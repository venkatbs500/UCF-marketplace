import type { HousingPost } from "@/lib/types";
import { housingPosts } from "@/lib/mock-data";
import { usesSupabaseHousing } from "@/lib/housing-mode";
import type {
  CreateHousingPostInput,
  HousingPostFilters,
  HousingPostItem,
  UpdateHousingPostInput,
} from "./housing-types";
import { mapHousingPostRow } from "./housing-types";
import {
  createHousingPost as createSupabaseHousingPost,
  deleteHousingPost as deleteSupabaseHousingPost,
  getHousingPostById as getSupabaseHousingPostById,
  getHousingPosts as getSupabaseHousingPosts,
  getMyHousingPosts as getSupabaseMyHousingPosts,
  markHousingPostInactive as markSupabaseHousingPostInactive,
  updateHousingPost as updateSupabaseHousingPost,
  uploadHousingImages as uploadSupabaseHousingImages,
} from "./supabase-housing-service";

export { usesSupabaseHousing };

export function mapMockHousingPostToItem(post: HousingPost): HousingPostItem {
  const type =
    post.type === "lease-transfer"
      ? "lease_transfer"
      : post.type === "roommate"
        ? "roommate"
        : "sublease";

  return mapHousingPostRow(
    {
      id: post.id,
      user_id: post.poster.id,
      type,
      title: post.title,
      description: post.description,
      rent: post.price,
      bedrooms: post.bedrooms,
      bathrooms: post.bathrooms,
      apartment_name: null,
      location: post.location,
      move_in_date: post.availableFrom,
      move_out_date: post.leaseEnd ?? null,
      images: post.images,
      tags: post.amenities,
      status: "active",
      created_at: post.createdAt,
      updated_at: post.createdAt,
    },
    {
      id: post.poster.id,
      name: post.poster.name,
      avatarInitials: post.poster.avatar,
      isVerifiedStudent: post.poster.verified,
    }
  );
}

export async function getHousingPosts(filters: HousingPostFilters = {}): Promise<{
  posts: HousingPostItem[];
  error?: string;
}> {
  if (!usesSupabaseHousing()) return { posts: [] };
  return getSupabaseHousingPosts(filters);
}

export async function getHousingPostById(
  id: string,
  userId?: string | null
): Promise<{ post: HousingPostItem | null; error?: string }> {
  if (!usesSupabaseHousing()) {
    const mock = housingPosts.find((post) => post.id === id);
    if (!mock) return { post: null };
    return { post: mapMockHousingPostToItem(mock) };
  }
  return getSupabaseHousingPostById(id, userId);
}

export async function getMyHousingPosts(userId: string): Promise<{
  posts: HousingPostItem[];
  error?: string;
}> {
  if (!usesSupabaseHousing()) return { posts: [] };
  return getSupabaseMyHousingPosts(userId);
}

export async function createHousingPost(
  input: CreateHousingPostInput
): Promise<{ post: HousingPostItem | null; error?: string }> {
  if (!usesSupabaseHousing()) {
    return { post: null, error: "Housing posts are available in Supabase real mode." };
  }
  return createSupabaseHousingPost(input);
}

export async function updateHousingPost(
  id: string,
  userId: string,
  input: UpdateHousingPostInput
): Promise<{ post: HousingPostItem | null; error?: string }> {
  if (!usesSupabaseHousing()) {
    return { post: null, error: "Housing posts are available in Supabase real mode." };
  }
  return updateSupabaseHousingPost(id, userId, input);
}

export async function deleteHousingPost(
  id: string,
  userId: string
): Promise<{ success: boolean; error?: string; storageWarning?: string }> {
  if (!usesSupabaseHousing()) return { success: false, error: "Supabase housing is not enabled." };
  return deleteSupabaseHousingPost(id, userId);
}

export async function markHousingPostInactive(
  id: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  if (!usesSupabaseHousing()) return { success: false, error: "Supabase housing is not enabled." };
  return markSupabaseHousingPostInactive(id, userId);
}

export async function uploadHousingImages(
  files: File[],
  userId: string
): Promise<{ success: true; urls: string[] } | { success: false; error: string }> {
  if (!usesSupabaseHousing()) {
    return { success: false, error: "Housing image upload requires Supabase real mode." };
  }
  return uploadSupabaseHousingImages(files, userId);
}
