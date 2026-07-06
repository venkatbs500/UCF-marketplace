import type { CampusEvent } from "@/lib/types";
import { campusEvents, users } from "@/lib/mock-data";
import { usesSupabaseEvents } from "@/lib/events-mode";
import type {
  CampusEventFilters,
  CampusEventRecord,
  CreateCampusEventInput,
  UpdateCampusEventInput,
} from "./events-types";
import { mapCampusEventRow, mapMockEventTypeToCampusEventType } from "./events-types";
import {
  createCampusEvent as createSupabaseCampusEvent,
  deleteCampusEvent as deleteSupabaseCampusEvent,
  getCampusEventById as getSupabaseCampusEventById,
  getCampusEvents as getSupabaseCampusEvents,
  getMyCampusEvents as getSupabaseMyCampusEvents,
  markCampusEventCancelled as markSupabaseCampusEventCancelled,
  updateCampusEvent as updateSupabaseCampusEvent,
  uploadEventImages as uploadSupabaseEventImages,
} from "./supabase-events-service";

export { usesSupabaseEvents };

export function mapMockCampusEventToRecord(event: CampusEvent, index = 0): CampusEventRecord {
  const poster = users[(index + 1) % users.length] ?? users[0];
  return mapCampusEventRow(
    {
      id: event.id,
      posted_by: poster.id,
      title: event.title,
      description: event.description,
      event_date: event.date,
      event_time: event.time,
      event_end_time: null,
      location: event.location,
      host: event.host,
      category: event.type,
      event_type: mapMockEventTypeToCampusEventType(event.type),
      images: event.image ? [event.image] : [],
      external_url: null,
      status: "active",
      created_at: event.date,
      updated_at: event.date,
    },
    {
      id: poster.id,
      name: poster.name,
      avatarInitials: poster.avatar,
      isVerifiedStudent: poster.verified,
    }
  );
}

export async function getCampusEvents(filters: CampusEventFilters = {}): Promise<{
  events: CampusEventRecord[];
  error?: string;
}> {
  if (!usesSupabaseEvents()) return { events: [] };
  return getSupabaseCampusEvents(filters);
}

export async function getCampusEventById(
  id: string,
  userId?: string | null
): Promise<{ event: CampusEventRecord | null; error?: string }> {
  if (!usesSupabaseEvents()) {
    const mock = campusEvents.find((event) => event.id === id);
    if (!mock) return { event: null };
    return { event: mapMockCampusEventToRecord(mock, campusEvents.indexOf(mock)) };
  }
  return getSupabaseCampusEventById(id, userId);
}

export async function getMyCampusEvents(userId: string): Promise<{
  events: CampusEventRecord[];
  error?: string;
}> {
  if (!usesSupabaseEvents()) return { events: [] };
  return getSupabaseMyCampusEvents(userId);
}

export async function createCampusEvent(
  input: CreateCampusEventInput
): Promise<{ event: CampusEventRecord | null; error?: string }> {
  if (!usesSupabaseEvents()) {
    return { event: null, error: "Campus events are available in Supabase real mode." };
  }
  return createSupabaseCampusEvent(input);
}

export async function updateCampusEvent(
  id: string,
  userId: string,
  input: UpdateCampusEventInput
): Promise<{ event: CampusEventRecord | null; error?: string }> {
  if (!usesSupabaseEvents()) {
    return { event: null, error: "Campus events are available in Supabase real mode." };
  }
  return updateSupabaseCampusEvent(id, userId, input);
}

export async function markCampusEventCancelled(
  id: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  if (!usesSupabaseEvents()) {
    return { success: false, error: "Supabase events are not enabled." };
  }
  return markSupabaseCampusEventCancelled(id, userId);
}

export async function deleteCampusEvent(
  id: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  if (!usesSupabaseEvents()) {
    return { success: false, error: "Supabase events are not enabled." };
  }
  return deleteSupabaseCampusEvent(id, userId);
}

export async function uploadEventImages(
  files: File[],
  userId: string
): Promise<{ success: true; urls: string[] } | { success: false; error: string }> {
  if (!usesSupabaseEvents()) {
    return { success: false, error: "Event image upload requires Supabase real mode." };
  }
  return uploadSupabaseEventImages(files, userId);
}
