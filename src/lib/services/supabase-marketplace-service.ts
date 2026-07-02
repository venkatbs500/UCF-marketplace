import type { AuthUser, Listing, ListingDraft } from "@/lib/types";
import type { DeleteListingResult, PublishListingResult } from "./marketplace-service";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { deleteListingImagesForUser, uploadListingImages } from "./supabase-image-service";
import {
  mapListingDraftToListingInsert,
  mapListingRowToListing,
  mapProfileRowToAuthUser,
  type ListingRow,
  type ProfileRow,
} from "./supabase-marketplace-types";

function mapSupabaseError(error: { message?: string } | null): string {
  const message = error?.message?.trim();
  if (!message) {
    return "Something went wrong. Please try again.";
  }
  if (message.toLowerCase().includes("row-level security")) {
    return "You do not have permission to perform this action.";
  }
  return "Something went wrong. Please try again.";
}

async function fetchProfilesByIds(
  ids: string[]
): Promise<Map<string, ProfileRow>> {
  const client = getSupabaseBrowserClient();
  const map = new Map<string, ProfileRow>();
  if (!client || ids.length === 0) return map;

  const uniqueIds = [...new Set(ids)];
  const { data, error } = await client
    .from("profiles")
    .select("*")
    .in("id", uniqueIds);

  if (error || !data) return map;

  for (const row of data as ProfileRow[]) {
    map.set(row.id, row);
  }
  return map;
}

function mapRowsToListings(
  rows: ListingRow[],
  profiles: Map<string, ProfileRow>
): Listing[] {
  return rows.map((row) =>
    mapListingRowToListing(row, profiles.get(row.seller_id) ?? null)
  );
}

export async function getSupabaseListings(): Promise<{
  listings: Listing[];
  error?: string;
}> {
  const client = getSupabaseBrowserClient();
  if (!client) {
    return { listings: [], error: "Supabase is not configured." };
  }

  const { data, error } = await client
    .from("listings")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error) {
    return { listings: [], error: mapSupabaseError(error) };
  }

  const rows = (data ?? []) as ListingRow[];
  const profiles = await fetchProfilesByIds(rows.map((row) => row.seller_id));
  return { listings: mapRowsToListings(rows, profiles) };
}

export async function getSupabaseListingById(
  id: string,
  userId?: string | null
): Promise<{ listing: Listing | null; error?: string }> {
  const client = getSupabaseBrowserClient();
  if (!client) {
    return { listing: null, error: "Supabase is not configured." };
  }

  const { data, error } = await client
    .from("listings")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return { listing: null, error: mapSupabaseError(error) };
  }

  if (!data) {
    return { listing: null };
  }

  const row = data as ListingRow;
  if (row.status !== "active" && row.seller_id !== userId) {
    return { listing: null };
  }

  const profiles = await fetchProfilesByIds([row.seller_id]);
  return {
    listing: mapListingRowToListing(row, profiles.get(row.seller_id) ?? null),
  };
}

export async function getSupabaseUserListings(
  userId: string
): Promise<{ listings: Listing[]; error?: string }> {
  const client = getSupabaseBrowserClient();
  if (!client) {
    return { listings: [], error: "Supabase is not configured." };
  }

  const { data, error } = await client
    .from("listings")
    .select("*")
    .eq("seller_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    return { listings: [], error: mapSupabaseError(error) };
  }

  const rows = (data ?? []) as ListingRow[];
  const profiles = await fetchProfilesByIds([userId]);
  return { listings: mapRowsToListings(rows, profiles) };
}

export async function createSupabaseListing(
  draft: ListingDraft,
  user: AuthUser,
  imageFiles: File[]
): Promise<PublishListingResult> {
  if (!user.id) {
    return { listing: null, error: "Sign in to publish a listing." };
  }

  const uploadResult = await uploadListingImages(imageFiles, user.id);
  if (!uploadResult.success) {
    return { listing: null, error: uploadResult.error };
  }

  const insert = mapListingDraftToListingInsert(draft, user.id, uploadResult.urls);
  if (!insert) {
    return { listing: null, error: "Please complete all required listing fields." };
  }

  const client = getSupabaseBrowserClient();
  if (!client) {
    return { listing: null, error: "Supabase is not configured." };
  }

  const { data, error } = await client
    .from("listings")
    .insert(insert)
    .select("*")
    .single();

  if (error || !data) {
    return { listing: null, error: mapSupabaseError(error) };
  }

  const profile: ProfileRow = {
    id: user.id,
    email: user.email,
    full_name: user.name,
    avatar_initials: user.avatarInitials,
    bio: user.bio ?? null,
    major: user.major,
    year: user.year,
    campus_area: user.campusArea,
    interests: user.interests,
    trust_score: user.trustScore,
    is_verified_student: user.isVerifiedStudent,
    has_completed_onboarding: user.hasCompletedOnboarding,
    created_at: user.joinedAt,
    updated_at: new Date().toISOString(),
  };

  return {
    listing: mapListingRowToListing(data as ListingRow, profile),
  };
}

export async function deleteSupabaseListing(
  listingId: string,
  userId: string
): Promise<DeleteListingResult> {
  if (!userId) {
    return { success: false, error: "Sign in to manage your listings." };
  }

  const client = getSupabaseBrowserClient();
  if (!client) {
    return { success: false, error: "Supabase is not configured." };
  }

  const { listing } = await getSupabaseListingById(listingId, userId);
  if (!listing || listing.sellerId !== userId) {
    return { success: false, error: "You can only delete your own listings." };
  }

  const { error } = await client.from("listings").delete().eq("id", listingId);

  if (error) {
    return { success: false, error: mapSupabaseError(error) };
  }

  try {
    await deleteListingImagesForUser(listing.images, userId);
  } catch {
    // Image cleanup is best-effort.
  }

  return { success: true };
}

export async function fetchSupabaseProfile(
  userId: string,
  fallbackEmail?: string
): Promise<AuthUser | null> {
  const client = getSupabaseBrowserClient();
  if (!client) return null;

  const { data, error } = await client
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) return null;
  return mapProfileRowToAuthUser(data as ProfileRow, fallbackEmail);
}

export async function upsertSupabaseProfile(
  user: AuthUser
): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  const client = getSupabaseBrowserClient();
  if (!client) {
    return { success: false, error: "Supabase is not configured." };
  }

  const payload = {
    id: user.id,
    email: user.email,
    full_name: user.name,
    avatar_initials: user.avatarInitials,
    bio: user.bio ?? null,
    major: user.major,
    year: user.year,
    campus_area: user.campusArea,
    interests: user.interests,
    trust_score: user.trustScore,
    is_verified_student: user.isVerifiedStudent,
    has_completed_onboarding: user.hasCompletedOnboarding,
  };

  const { data, error } = await client
    .from("profiles")
    .upsert(payload, { onConflict: "id" })
    .select("*")
    .single();

  if (error || !data) {
    return { success: false, error: mapSupabaseError(error) };
  }

  return {
    success: true,
    user: mapProfileRowToAuthUser(data as ProfileRow, user.email),
  };
}
