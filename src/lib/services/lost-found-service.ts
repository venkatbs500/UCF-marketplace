import type { LostFoundItem } from "@/lib/types";
import { lostFoundItems } from "@/lib/mock-data";
import { usesSupabaseLostFound } from "@/lib/lost-found-mode";
import type {
  CreateLostFoundItemInput,
  LostFoundItemFilters,
  LostFoundItemRecord,
  UpdateLostFoundItemInput,
} from "./lost-found-types";
import { mapLostFoundItemRow } from "./lost-found-types";
import {
  createLostFoundItem as createSupabaseLostFoundItem,
  deleteLostFoundItem as deleteSupabaseLostFoundItem,
  getLostFoundItemById as getSupabaseLostFoundItemById,
  getLostFoundItems as getSupabaseLostFoundItems,
  getMyLostFoundItems as getSupabaseMyLostFoundItems,
  markLostFoundItemResolved as markSupabaseLostFoundItemResolved,
  updateLostFoundItem as updateSupabaseLostFoundItem,
  uploadLostFoundImages as uploadSupabaseLostFoundImages,
} from "./supabase-lost-found-service";

export { usesSupabaseLostFound };

export function mapMockLostFoundItemToRecord(item: LostFoundItem): LostFoundItemRecord {
  return mapLostFoundItemRow(
    {
      id: item.id,
      user_id: item.reporter.id,
      type: item.status,
      title: item.title,
      description: item.description,
      category: item.category,
      location: item.location,
      item_date: item.date,
      images: item.image ? [item.image] : [],
      contact_preference: null,
      status: "active",
      created_at: item.date,
      updated_at: item.date,
    },
    {
      id: item.reporter.id,
      name: item.reporter.name,
      avatarInitials: item.reporter.avatar,
      isVerifiedStudent: item.reporter.verified,
    }
  );
}

export async function getLostFoundItems(filters: LostFoundItemFilters = {}): Promise<{
  items: LostFoundItemRecord[];
  error?: string;
}> {
  if (!usesSupabaseLostFound()) return { items: [] };
  return getSupabaseLostFoundItems(filters);
}

export async function getLostFoundItemById(
  id: string,
  userId?: string | null
): Promise<{ item: LostFoundItemRecord | null; error?: string }> {
  if (!usesSupabaseLostFound()) {
    const mock = lostFoundItems.find((item) => item.id === id);
    if (!mock) return { item: null };
    return { item: mapMockLostFoundItemToRecord(mock) };
  }
  return getSupabaseLostFoundItemById(id, userId);
}

export async function getMyLostFoundItems(userId: string): Promise<{
  items: LostFoundItemRecord[];
  error?: string;
}> {
  if (!usesSupabaseLostFound()) return { items: [] };
  return getSupabaseMyLostFoundItems(userId);
}

export async function createLostFoundItem(
  input: CreateLostFoundItemInput
): Promise<{ item: LostFoundItemRecord | null; error?: string }> {
  if (!usesSupabaseLostFound()) {
    return { item: null, error: "Lost & Found posts are available in Supabase real mode." };
  }
  return createSupabaseLostFoundItem(input);
}

export async function updateLostFoundItem(
  id: string,
  userId: string,
  input: UpdateLostFoundItemInput
): Promise<{ item: LostFoundItemRecord | null; error?: string }> {
  if (!usesSupabaseLostFound()) {
    return { item: null, error: "Lost & Found posts are available in Supabase real mode." };
  }
  return updateSupabaseLostFoundItem(id, userId, input);
}

export async function markLostFoundItemResolved(
  id: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  if (!usesSupabaseLostFound()) {
    return { success: false, error: "Supabase Lost & Found is not enabled." };
  }
  return markSupabaseLostFoundItemResolved(id, userId);
}

export async function deleteLostFoundItem(
  id: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  if (!usesSupabaseLostFound()) {
    return { success: false, error: "Supabase Lost & Found is not enabled." };
  }
  return deleteSupabaseLostFoundItem(id, userId);
}

export async function uploadLostFoundImages(
  files: File[],
  userId: string
): Promise<{ success: true; urls: string[] } | { success: false; error: string }> {
  if (!usesSupabaseLostFound()) {
    return { success: false, error: "Lost & Found image upload requires Supabase real mode." };
  }
  return uploadSupabaseLostFoundImages(files, userId);
}
