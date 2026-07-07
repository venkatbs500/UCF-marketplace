import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { ProfileRow } from "./supabase-marketplace-types";
import {
  deleteStorageFilesSafely,
  getRemovedImageUrls,
} from "./supabase-storage-cleanup";
import {
  mapHousingPostRow,
  type CreateHousingPostInput,
  type HousingPostFilters,
  type HousingPostItem,
  type HousingPostRow,
  type HousingPoster,
  type UpdateHousingPostInput,
  filterHousingPosts,
} from "./housing-types";

const HOUSING_IMAGES_BUCKET = "housing-images";
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

function validateHousingImage(file: File): string | null {
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return "Please upload JPEG, PNG, or WebP images.";
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return "Each image must be under 5 MB.";
  }
  return null;
}

function mapProfileToPoster(profile: ProfileRow | null | undefined, userId: string): HousingPoster {
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

async function mapRowsToPosts(rows: HousingPostRow[]): Promise<HousingPostItem[]> {
  const profiles = await fetchProfilesByIds(rows.map((row) => row.user_id));
  return rows.map((row) =>
    mapHousingPostRow(row, mapProfileToPoster(profiles.get(row.user_id), row.user_id))
  );
}

export async function uploadHousingImages(
  files: File[],
  userId: string
): Promise<{ success: true; urls: string[] } | { success: false; error: string }> {
  if (files.length < 1) {
    return { success: false, error: "Please add at least one image." };
  }
  if (files.length > MAX_IMAGE_COUNT) {
    return { success: false, error: "You can upload up to 5 images." };
  }

  for (const file of files) {
    const validationError = validateHousingImage(file);
    if (validationError) return { success: false, error: validationError };
  }

  const client = getSupabaseBrowserClient();
  if (!client) {
    return { success: false, error: "Supabase is not configured." };
  }

  const urls: string[] = [];
  for (const file of files) {
    const path = createSafeImagePath(userId, file);
    const { error } = await client.storage.from(HOUSING_IMAGES_BUCKET).upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });
    if (error) {
      return { success: false, error: "We could not upload your images. Please try again." };
    }
    const { data } = client.storage.from(HOUSING_IMAGES_BUCKET).getPublicUrl(path);
    if (!data.publicUrl) {
      return { success: false, error: "We could not upload your images. Please try again." };
    }
    urls.push(data.publicUrl);
  }

  return { success: true, urls };
}

export async function getHousingPosts(filters: HousingPostFilters = {}): Promise<{
  posts: HousingPostItem[];
  error?: string;
}> {
  const client = getSupabaseBrowserClient();
  if (!client) return { posts: [], error: "Supabase is not configured." };

  const { data, error } = await client
    .from("housing_posts")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error) return { posts: [], error: mapSupabaseError(error) };

  const posts = await mapRowsToPosts((data ?? []) as HousingPostRow[]);
  return { posts: filterHousingPosts(posts, filters) };
}

export async function getHousingPostById(
  id: string,
  userId?: string | null
): Promise<{ post: HousingPostItem | null; error?: string }> {
  const client = getSupabaseBrowserClient();
  if (!client) return { post: null, error: "Supabase is not configured." };

  const { data, error } = await client.from("housing_posts").select("*").eq("id", id).maybeSingle();
  if (error) return { post: null, error: mapSupabaseError(error) };
  if (!data) return { post: null };

  const row = data as HousingPostRow;
  if (row.status !== "active" && row.user_id !== userId) {
    return { post: null };
  }

  const profiles = await fetchProfilesByIds([row.user_id]);
  return {
    post: mapHousingPostRow(row, mapProfileToPoster(profiles.get(row.user_id), row.user_id)),
  };
}

export async function getMyHousingPosts(userId: string): Promise<{
  posts: HousingPostItem[];
  error?: string;
}> {
  const client = getSupabaseBrowserClient();
  if (!client) return { posts: [], error: "Supabase is not configured." };

  const { data, error } = await client
    .from("housing_posts")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) return { posts: [], error: mapSupabaseError(error) };
  return { posts: await mapRowsToPosts((data ?? []) as HousingPostRow[]) };
}

export async function createHousingPost(
  input: CreateHousingPostInput
): Promise<{ post: HousingPostItem | null; error?: string }> {
  const client = getSupabaseBrowserClient();
  if (!client) return { post: null, error: "Supabase is not configured." };

  const { data, error } = await client
    .from("housing_posts")
    .insert({
      user_id: input.userId,
      type: input.type,
      title: input.title.trim(),
      description: input.description.trim(),
      rent: input.rent,
      bedrooms: input.bedrooms,
      bathrooms: input.bathrooms,
      apartment_name: input.apartmentName?.trim() || null,
      location: input.location.trim(),
      move_in_date: input.moveInDate || null,
      move_out_date: input.moveOutDate || null,
      images: input.images,
      tags: input.tags ?? [],
      status: input.status ?? "active",
    })
    .select("*")
    .single();

  if (error || !data) return { post: null, error: mapSupabaseError(error) };

  const profiles = await fetchProfilesByIds([input.userId]);
  return {
    post: mapHousingPostRow(
      data as HousingPostRow,
      mapProfileToPoster(profiles.get(input.userId), input.userId)
    ),
  };
}

export async function updateHousingPost(
  id: string,
  userId: string,
  input: UpdateHousingPostInput
): Promise<{ post: HousingPostItem | null; error?: string }> {
  const client = getSupabaseBrowserClient();
  if (!client) return { post: null, error: "Supabase is not configured." };

  const { data: existingRow, error: fetchError } = await client
    .from("housing_posts")
    .select("images")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();

  if (fetchError) return { post: null, error: mapSupabaseError(fetchError) };
  if (!existingRow) return { post: null, error: "Housing post not found." };

  const previousImages = ((existingRow as { images?: string[] | null }).images ?? []).filter(
    Boolean
  );

  const patch: Record<string, unknown> = {};
  if (input.type) patch.type = input.type;
  if (input.title !== undefined) patch.title = input.title.trim();
  if (input.description !== undefined) patch.description = input.description.trim();
  if (input.rent !== undefined) patch.rent = input.rent;
  if (input.bedrooms !== undefined) patch.bedrooms = input.bedrooms;
  if (input.bathrooms !== undefined) patch.bathrooms = input.bathrooms;
  if (input.apartmentName !== undefined) patch.apartment_name = input.apartmentName?.trim() || null;
  if (input.location !== undefined) patch.location = input.location.trim();
  if (input.moveInDate !== undefined) patch.move_in_date = input.moveInDate || null;
  if (input.moveOutDate !== undefined) patch.move_out_date = input.moveOutDate || null;
  if (input.tags !== undefined) patch.tags = input.tags;
  if (input.images !== undefined) patch.images = input.images;
  if (input.status !== undefined) patch.status = input.status;

  const { data, error } = await client
    .from("housing_posts")
    .update(patch)
    .eq("id", id)
    .eq("user_id", userId)
    .select("*")
    .maybeSingle();

  if (error) return { post: null, error: mapSupabaseError(error) };
  if (!data) return { post: null, error: "Housing post not found." };

  if (input.images !== undefined) {
    const removedImages = getRemovedImageUrls(previousImages, input.images);
    if (removedImages.length > 0) {
      await deleteStorageFilesSafely(HOUSING_IMAGES_BUCKET, removedImages, {
        userIdPrefix: userId,
      });
    }
  }

  const profiles = await fetchProfilesByIds([userId]);
  return {
    post: mapHousingPostRow(
      data as HousingPostRow,
      mapProfileToPoster(profiles.get(userId), userId)
    ),
  };
}

export async function deleteHousingPost(
  id: string,
  userId: string
): Promise<{ success: boolean; error?: string; storageWarning?: string }> {
  const client = getSupabaseBrowserClient();
  if (!client) return { success: false, error: "Supabase is not configured." };

  const { data: existingRow, error: fetchError } = await client
    .from("housing_posts")
    .select("images, user_id")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();

  if (fetchError) return { success: false, error: mapSupabaseError(fetchError) };
  if (!existingRow) {
    return { success: false, error: "Housing post not found." };
  }

  const images = ((existingRow as { images?: string[] | null }).images ?? []).filter(Boolean);

  const { error } = await client.from("housing_posts").delete().eq("id", id).eq("user_id", userId);
  if (error) return { success: false, error: mapSupabaseError(error) };

  const cleanup = await deleteStorageFilesSafely(HOUSING_IMAGES_BUCKET, images, {
    userIdPrefix: userId,
  });

  if (cleanup.failedPaths.length > 0) {
    return {
      success: true,
      storageWarning: "Post deleted, but some photos could not be removed from storage.",
    };
  }

  return { success: true };
}

export async function markHousingPostInactive(
  id: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseBrowserClient();
  if (!client) return { success: false, error: "Supabase is not configured." };

  const { error } = await client
    .from("housing_posts")
    .update({ status: "closed" })
    .eq("id", id)
    .eq("user_id", userId);

  if (error) return { success: false, error: mapSupabaseError(error) };
  return { success: true };
}

export async function hideHousingPostForModeration(
  housingPostId: string
): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseBrowserClient();
  if (!client) return { success: false, error: "Supabase is not configured." };

  const { error } = await client
    .from("housing_posts")
    .update({ status: "removed" })
    .eq("id", housingPostId);

  if (error) return { success: false, error: mapSupabaseError(error) };
  return { success: true };
}
