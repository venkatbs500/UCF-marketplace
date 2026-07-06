import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { ProfileRow } from "./supabase-marketplace-types";
import {
  filterLostFoundItems,
  mapLostFoundItemRow,
  type CreateLostFoundItemInput,
  type LostFoundItemFilters,
  type LostFoundItemRecord,
  type LostFoundItemRow,
  type LostFoundPoster,
  type UpdateLostFoundItemInput,
} from "./lost-found-types";

const LOST_FOUND_IMAGES_BUCKET = "lost-found-images";
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const MAX_IMAGE_COUNT = 5;

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function mapSupabaseError(error: { message?: string } | null): string {
  const message = error?.message?.trim();
  if (!message) return "Something went wrong. Please try again.";
  if (message.toLowerCase().includes("row-level security")) {
    return "You do not have permission to perform this action.";
  }
  return "Something went wrong. Please try again.";
}

function sanitizeFileName(name: string): string {
  const base = name.trim().toLowerCase().replace(/[^a-z0-9._-]+/g, "-");
  return base.replace(/^-+|-+$/g, "") || "image";
}

function createSafeImagePath(userId: string, file: File): string {
  const safeName = sanitizeFileName(file.name);
  const randomId = Math.random().toString(36).slice(2, 10);
  return `${userId}/${Date.now()}-${randomId}-${safeName}`;
}

function validateLostFoundImage(file: File): string | null {
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return "Please upload JPEG, PNG, or WebP images.";
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return "Each image must be under 5 MB.";
  }
  return null;
}

function mapProfileToPoster(profile: ProfileRow | null | undefined, userId: string): LostFoundPoster {
  return {
    id: userId,
    name: profile?.full_name?.trim() || "Verified student",
    avatarInitials: profile?.avatar_initials?.trim() || "VS",
    isVerifiedStudent: profile?.is_verified_student ?? true,
  };
}

async function fetchProfilesByIds(ids: string[]): Promise<Map<string, ProfileRow>> {
  const client = getSupabaseBrowserClient();
  const map = new Map<string, ProfileRow>();
  if (!client || ids.length === 0) return map;

  const { data } = await client.from("profiles").select("*").in("id", [...new Set(ids)]);
  for (const row of (data ?? []) as ProfileRow[]) {
    map.set(row.id, row);
  }
  return map;
}

async function mapRowsToItems(rows: LostFoundItemRow[]): Promise<LostFoundItemRecord[]> {
  const profiles = await fetchProfilesByIds(rows.map((row) => row.user_id));
  return rows.map((row) =>
    mapLostFoundItemRow(row, mapProfileToPoster(profiles.get(row.user_id), row.user_id))
  );
}

export async function uploadLostFoundImages(
  files: File[],
  userId: string
): Promise<{ success: true; urls: string[] } | { success: false; error: string }> {
  if (files.length > MAX_IMAGE_COUNT) {
    return { success: false, error: "You can upload up to 5 images." };
  }

  for (const file of files) {
    const validationError = validateLostFoundImage(file);
    if (validationError) return { success: false, error: validationError };
  }

  const client = getSupabaseBrowserClient();
  if (!client) {
    return { success: false, error: "Supabase is not configured." };
  }

  const urls: string[] = [];
  for (const file of files) {
    const path = createSafeImagePath(userId, file);
    const { error } = await client.storage.from(LOST_FOUND_IMAGES_BUCKET).upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });
    if (error) {
      return { success: false, error: "We could not upload your images. Please try again." };
    }
    const { data } = client.storage.from(LOST_FOUND_IMAGES_BUCKET).getPublicUrl(path);
    if (!data.publicUrl) {
      return { success: false, error: "We could not upload your images. Please try again." };
    }
    urls.push(data.publicUrl);
  }

  return { success: true, urls };
}

export async function getLostFoundItems(filters: LostFoundItemFilters = {}): Promise<{
  items: LostFoundItemRecord[];
  error?: string;
}> {
  const client = getSupabaseBrowserClient();
  if (!client) return { items: [], error: "Supabase is not configured." };

  const { data, error } = await client
    .from("lost_found_items")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error) return { items: [], error: mapSupabaseError(error) };

  const items = await mapRowsToItems((data ?? []) as LostFoundItemRow[]);
  return { items: filterLostFoundItems(items, filters) };
}

export async function getLostFoundItemById(
  id: string,
  userId?: string | null
): Promise<{ item: LostFoundItemRecord | null; error?: string }> {
  const client = getSupabaseBrowserClient();
  if (!client) return { item: null, error: "Supabase is not configured." };

  const { data, error } = await client
    .from("lost_found_items")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) return { item: null, error: mapSupabaseError(error) };
  if (!data) return { item: null };

  const row = data as LostFoundItemRow;
  const normalizedStatus = row.status === "open" ? "active" : row.status;
  if (normalizedStatus !== "active" && row.user_id !== userId) {
    return { item: null };
  }

  const profiles = await fetchProfilesByIds([row.user_id]);
  return {
    item: mapLostFoundItemRow(row, mapProfileToPoster(profiles.get(row.user_id), row.user_id)),
  };
}

export async function getMyLostFoundItems(userId: string): Promise<{
  items: LostFoundItemRecord[];
  error?: string;
}> {
  const client = getSupabaseBrowserClient();
  if (!client) return { items: [], error: "Supabase is not configured." };

  const { data, error } = await client
    .from("lost_found_items")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) return { items: [], error: mapSupabaseError(error) };
  return { items: await mapRowsToItems((data ?? []) as LostFoundItemRow[]) };
}

export async function createLostFoundItem(
  input: CreateLostFoundItemInput
): Promise<{ item: LostFoundItemRecord | null; error?: string }> {
  const client = getSupabaseBrowserClient();
  if (!client) return { item: null, error: "Supabase is not configured." };

  const { data, error } = await client
    .from("lost_found_items")
    .insert({
      user_id: input.userId,
      type: input.itemType,
      title: input.title.trim(),
      description: input.description.trim(),
      category: input.category,
      location: input.location.trim(),
      item_date: input.itemDate || null,
      images: input.images,
      status: input.status ?? "active",
    })
    .select("*")
    .single();

  if (error || !data) return { item: null, error: mapSupabaseError(error) };

  const row = data as LostFoundItemRow;
  const profiles = await fetchProfilesByIds([row.user_id]);
  return {
    item: mapLostFoundItemRow(row, mapProfileToPoster(profiles.get(row.user_id), row.user_id)),
  };
}

export async function updateLostFoundItem(
  id: string,
  userId: string,
  input: UpdateLostFoundItemInput
): Promise<{ item: LostFoundItemRecord | null; error?: string }> {
  const client = getSupabaseBrowserClient();
  if (!client) return { item: null, error: "Supabase is not configured." };

  const patch: Record<string, unknown> = {};
  if (input.itemType != null) patch.type = input.itemType;
  if (input.title != null) patch.title = input.title.trim();
  if (input.description != null) patch.description = input.description.trim();
  if (input.category != null) patch.category = input.category;
  if (input.location != null) patch.location = input.location.trim();
  if (input.itemDate !== undefined) patch.item_date = input.itemDate || null;
  if (input.images != null) patch.images = input.images;
  if (input.status != null) patch.status = input.status;

  const { data, error } = await client
    .from("lost_found_items")
    .update(patch)
    .eq("id", id)
    .eq("user_id", userId)
    .select("*")
    .maybeSingle();

  if (error) return { item: null, error: mapSupabaseError(error) };
  if (!data) return { item: null, error: "Item not found or you do not have permission." };

  const row = data as LostFoundItemRow;
  const profiles = await fetchProfilesByIds([row.user_id]);
  return {
    item: mapLostFoundItemRow(row, mapProfileToPoster(profiles.get(row.user_id), row.user_id)),
  };
}

export async function markLostFoundItemResolved(
  id: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseBrowserClient();
  if (!client) return { success: false, error: "Supabase is not configured." };

  const { error } = await client
    .from("lost_found_items")
    .update({ status: "resolved" })
    .eq("id", id)
    .eq("user_id", userId);

  if (error) return { success: false, error: mapSupabaseError(error) };
  return { success: true };
}

export async function deleteLostFoundItem(
  id: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseBrowserClient();
  if (!client) return { success: false, error: "Supabase is not configured." };

  const { error } = await client.from("lost_found_items").delete().eq("id", id).eq("user_id", userId);
  if (error) return { success: false, error: mapSupabaseError(error) };
  return { success: true };
}

export async function hideLostFoundItemForModeration(
  itemId: string
): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseBrowserClient();
  if (!client) return { success: false, error: "Supabase is not configured." };

  const { error } = await client
    .from("lost_found_items")
    .update({ status: "removed" })
    .eq("id", itemId);

  if (error) return { success: false, error: mapSupabaseError(error) };
  return { success: true };
}
