import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { ProfileRow } from "./supabase-marketplace-types";
import {
  filterCampusEvents,
  mapCampusEventRow,
  type CampusEventFilters,
  type CampusEventOrganizer,
  type CampusEventRecord,
  type CampusEventRow,
  type CreateCampusEventInput,
  type UpdateCampusEventInput,
} from "./events-types";

const EVENT_IMAGES_BUCKET = "event-images";
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

function validateEventImage(file: File): string | null {
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return "Please upload JPEG, PNG, or WebP images.";
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return "Each image must be under 5 MB.";
  }
  return null;
}

function mapProfileToOrganizer(
  profile: ProfileRow | null | undefined,
  userId: string
): CampusEventOrganizer {
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

async function mapRowsToEvents(rows: CampusEventRow[]): Promise<CampusEventRecord[]> {
  const profiles = await fetchProfilesByIds(rows.map((row) => row.posted_by));
  return rows.map((row) =>
    mapCampusEventRow(row, mapProfileToOrganizer(profiles.get(row.posted_by), row.posted_by))
  );
}

function todayDateString(): string {
  return new Date().toISOString().split("T")[0];
}

export async function uploadEventImages(
  files: File[],
  userId: string
): Promise<{ success: true; urls: string[] } | { success: false; error: string }> {
  if (files.length > MAX_IMAGE_COUNT) {
    return { success: false, error: "You can upload up to 5 images." };
  }

  for (const file of files) {
    const validationError = validateEventImage(file);
    if (validationError) return { success: false, error: validationError };
  }

  const client = getSupabaseBrowserClient();
  if (!client) {
    return { success: false, error: "Supabase is not configured." };
  }

  const urls: string[] = [];
  for (const file of files) {
    const path = createSafeImagePath(userId, file);
    const { error } = await client.storage.from(EVENT_IMAGES_BUCKET).upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });
    if (error) {
      return { success: false, error: "We could not upload your images. Please try again." };
    }
    const { data } = client.storage.from(EVENT_IMAGES_BUCKET).getPublicUrl(path);
    if (!data.publicUrl) {
      return { success: false, error: "We could not upload your images. Please try again." };
    }
    urls.push(data.publicUrl);
  }

  return { success: true, urls };
}

export async function getCampusEvents(filters: CampusEventFilters = {}): Promise<{
  events: CampusEventRecord[];
  error?: string;
}> {
  const client = getSupabaseBrowserClient();
  if (!client) return { events: [], error: "Supabase is not configured." };

  const today = todayDateString();
  const { data, error } = await client
    .from("campus_events")
    .select("*")
    .eq("status", "active")
    .or(`event_date.is.null,event_date.gte.${today}`)
    .order("event_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) return { events: [], error: mapSupabaseError(error) };

  const events = await mapRowsToEvents((data ?? []) as CampusEventRow[]);
  return { events: filterCampusEvents(events, filters) };
}

export async function getCampusEventById(
  id: string,
  userId?: string | null
): Promise<{ event: CampusEventRecord | null; error?: string }> {
  const client = getSupabaseBrowserClient();
  if (!client) return { event: null, error: "Supabase is not configured." };

  const { data, error } = await client
    .from("campus_events")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) return { event: null, error: mapSupabaseError(error) };
  if (!data) return { event: null };

  const row = data as CampusEventRow;
  if (row.status !== "active" && row.posted_by !== userId) {
    return { event: null };
  }

  const profiles = await fetchProfilesByIds([row.posted_by]);
  return {
    event: mapCampusEventRow(
      row,
      mapProfileToOrganizer(profiles.get(row.posted_by), row.posted_by)
    ),
  };
}

export async function getMyCampusEvents(userId: string): Promise<{
  events: CampusEventRecord[];
  error?: string;
}> {
  const client = getSupabaseBrowserClient();
  if (!client) return { events: [], error: "Supabase is not configured." };

  const { data, error } = await client
    .from("campus_events")
    .select("*")
    .eq("posted_by", userId)
    .order("created_at", { ascending: false });

  if (error) return { events: [], error: mapSupabaseError(error) };
  return { events: await mapRowsToEvents((data ?? []) as CampusEventRow[]) };
}

export async function createCampusEvent(
  input: CreateCampusEventInput
): Promise<{ event: CampusEventRecord | null; error?: string }> {
  const client = getSupabaseBrowserClient();
  if (!client) return { event: null, error: "Supabase is not configured." };

  const { data, error } = await client
    .from("campus_events")
    .insert({
      posted_by: input.postedBy,
      title: input.title.trim(),
      description: input.description.trim(),
      event_type: input.eventType,
      event_date: input.eventDate || null,
      event_time: input.eventTime?.trim() || "",
      event_end_time: input.eventEndTime?.trim() || null,
      location: input.location.trim(),
      host: input.host?.trim() || "",
      images: input.images,
      external_url: input.externalUrl?.trim() || null,
      status: input.status ?? "active",
    })
    .select("*")
    .single();

  if (error || !data) return { event: null, error: mapSupabaseError(error) };

  const row = data as CampusEventRow;
  const profiles = await fetchProfilesByIds([row.posted_by]);
  return {
    event: mapCampusEventRow(
      row,
      mapProfileToOrganizer(profiles.get(row.posted_by), row.posted_by)
    ),
  };
}

export async function updateCampusEvent(
  id: string,
  userId: string,
  input: UpdateCampusEventInput
): Promise<{ event: CampusEventRecord | null; error?: string }> {
  const client = getSupabaseBrowserClient();
  if (!client) return { event: null, error: "Supabase is not configured." };

  const patch: Record<string, unknown> = {};
  if (input.title != null) patch.title = input.title.trim();
  if (input.description != null) patch.description = input.description.trim();
  if (input.eventType != null) patch.event_type = input.eventType;
  if (input.eventDate !== undefined) patch.event_date = input.eventDate || null;
  if (input.eventTime != null) patch.event_time = input.eventTime.trim();
  if (input.eventEndTime !== undefined) patch.event_end_time = input.eventEndTime?.trim() || null;
  if (input.location != null) patch.location = input.location.trim();
  if (input.host != null) patch.host = input.host.trim();
  if (input.images != null) patch.images = input.images;
  if (input.externalUrl !== undefined) patch.external_url = input.externalUrl?.trim() || null;
  if (input.status != null) patch.status = input.status;

  const { data, error } = await client
    .from("campus_events")
    .update(patch)
    .eq("id", id)
    .eq("posted_by", userId)
    .select("*")
    .maybeSingle();

  if (error) return { event: null, error: mapSupabaseError(error) };
  if (!data) return { event: null, error: "Event not found or you do not have permission." };

  const row = data as CampusEventRow;
  const profiles = await fetchProfilesByIds([row.posted_by]);
  return {
    event: mapCampusEventRow(
      row,
      mapProfileToOrganizer(profiles.get(row.posted_by), row.posted_by)
    ),
  };
}

export async function markCampusEventCancelled(
  id: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseBrowserClient();
  if (!client) return { success: false, error: "Supabase is not configured." };

  const { error } = await client
    .from("campus_events")
    .update({ status: "cancelled" })
    .eq("id", id)
    .eq("posted_by", userId);

  if (error) return { success: false, error: mapSupabaseError(error) };
  return { success: true };
}

export async function deleteCampusEvent(
  id: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseBrowserClient();
  if (!client) return { success: false, error: "Supabase is not configured." };

  const { error } = await client.from("campus_events").delete().eq("id", id).eq("posted_by", userId);
  if (error) return { success: false, error: mapSupabaseError(error) };
  return { success: true };
}

export async function hideCampusEventForModeration(
  eventId: string
): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseBrowserClient();
  if (!client) return { success: false, error: "Supabase is not configured." };

  const { error } = await client
    .from("campus_events")
    .update({ status: "removed" })
    .eq("id", eventId);

  if (error) return { success: false, error: mapSupabaseError(error) };
  return { success: true };
}
