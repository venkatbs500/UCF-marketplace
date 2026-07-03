import type { Listing } from "@/lib/types";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  mapListingRowToListing,
  type ListingRow,
  type ProfileRow,
} from "./supabase-marketplace-types";
import type { SavedListingRow } from "./supabase-saved-listings-types";

function mapSupabaseError(error: { message?: string; code?: string } | null): string {
  const message = error?.message?.trim();
  if (!message) return "Something went wrong. Please try again.";
  if (message.toLowerCase().includes("row-level security")) {
    return "You do not have permission to perform this action.";
  }
  return "Something went wrong. Please try again.";
}

function isDuplicateKeyError(error: { code?: string } | null): boolean {
  return error?.code === "23505";
}

async function fetchProfilesByIds(
  ids: string[]
): Promise<Map<string, ProfileRow>> {
  const client = getSupabaseBrowserClient();
  const map = new Map<string, ProfileRow>();
  if (!client || ids.length === 0) return map;

  const { data } = await client.from("profiles").select("*").in("id", [...new Set(ids)]);
  for (const row of (data ?? []) as ProfileRow[]) {
    map.set(row.id, row);
  }
  return map;
}

export async function getSavedListingIds(userId: string): Promise<{
  ids: string[];
  error?: string;
}> {
  const client = getSupabaseBrowserClient();
  if (!client) {
    return { ids: [], error: "Supabase is not configured." };
  }

  const { data, error } = await client
    .from("saved_listings")
    .select("listing_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    return { ids: [], error: mapSupabaseError(error) };
  }

  const ids = ((data ?? []) as Pick<SavedListingRow, "listing_id">[]).map(
    (row) => row.listing_id
  );
  return { ids };
}

export async function getSavedListings(userId: string): Promise<{
  listings: Listing[];
  error?: string;
}> {
  const client = getSupabaseBrowserClient();
  if (!client) {
    return { listings: [], error: "Supabase is not configured." };
  }

  const { data: savedRows, error: savedError } = await client
    .from("saved_listings")
    .select("listing_id, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (savedError) {
    return { listings: [], error: mapSupabaseError(savedError) };
  }

  const orderedIds = ((savedRows ?? []) as SavedListingRow[]).map((row) => row.listing_id);
  if (orderedIds.length === 0) {
    return { listings: [] };
  }

  const { data: listingRows, error: listingError } = await client
    .from("listings")
    .select("*")
    .in("id", orderedIds)
    .eq("status", "active");

  if (listingError) {
    return { listings: [], error: mapSupabaseError(listingError) };
  }

  const rows = (listingRows ?? []) as ListingRow[];
  const profiles = await fetchProfilesByIds(rows.map((row) => row.seller_id));
  const listingById = new Map(
    rows.map((row) => [
      row.id,
      mapListingRowToListing(row, profiles.get(row.seller_id) ?? null),
    ])
  );

  const listings = orderedIds
    .map((id) => listingById.get(id))
    .filter((listing): listing is Listing => Boolean(listing));

  return { listings };
}

export async function isListingSaved(
  userId: string,
  listingId: string
): Promise<{ saved: boolean; error?: string }> {
  const client = getSupabaseBrowserClient();
  if (!client) {
    return { saved: false, error: "Supabase is not configured." };
  }

  const { data, error } = await client
    .from("saved_listings")
    .select("listing_id")
    .eq("user_id", userId)
    .eq("listing_id", listingId)
    .maybeSingle();

  if (error) {
    return { saved: false, error: mapSupabaseError(error) };
  }

  return { saved: Boolean(data) };
}

export async function saveListing(
  userId: string,
  listingId: string
): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseBrowserClient();
  if (!client) {
    return { success: false, error: "Supabase is not configured." };
  }

  const { error } = await client.from("saved_listings").insert({
    user_id: userId,
    listing_id: listingId,
  });

  if (error && !isDuplicateKeyError(error)) {
    return { success: false, error: mapSupabaseError(error) };
  }

  return { success: true };
}

export async function unsaveListing(
  userId: string,
  listingId: string
): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseBrowserClient();
  if (!client) {
    return { success: false, error: "Supabase is not configured." };
  }

  const { error } = await client
    .from("saved_listings")
    .delete()
    .eq("user_id", userId)
    .eq("listing_id", listingId);

  if (error) {
    return { success: false, error: mapSupabaseError(error) };
  }

  return { success: true };
}

export async function toggleSavedListing(
  userId: string,
  listingId: string
): Promise<{ saved: boolean; error?: string }> {
  const current = await isListingSaved(userId, listingId);
  if (current.error) {
    return { saved: current.saved, error: current.error };
  }

  if (current.saved) {
    const result = await unsaveListing(userId, listingId);
    return { saved: false, error: result.error };
  }

  const result = await saveListing(userId, listingId);
  return { saved: true, error: result.error };
}
