import type { Listing } from "@/lib/types";
import { draftMarketplaceService } from "@/lib/services/active-marketplace-service";
import { usesSupabaseSavedListings } from "@/lib/saved-listings-mode";
import {
  getSavedListingIds as getSupabaseSavedListingIds,
  getSavedListings as getSupabaseSavedListings,
  isListingSaved as isSupabaseListingSaved,
  saveListing as saveSupabaseListing,
  unsaveListing as unsaveSupabaseListing,
  toggleSavedListing as toggleSupabaseSavedListing,
} from "./supabase-saved-listings-service";

export { usesSupabaseSavedListings };

export type SavedListingsResult<T> = {
  data: T;
  error?: string;
};

export async function getSavedListingIds(
  userId: string
): Promise<SavedListingsResult<string[]>> {
  if (!usesSupabaseSavedListings()) {
    return { data: draftMarketplaceService.getSavedListingIds() };
  }
  const result = await getSupabaseSavedListingIds(userId);
  return { data: result.ids, error: result.error };
}

export async function getSavedListings(
  userId: string
): Promise<SavedListingsResult<Listing[]>> {
  if (!usesSupabaseSavedListings()) {
    return { data: [] };
  }
  const result = await getSupabaseSavedListings(userId);
  return { data: result.listings, error: result.error };
}

export async function isListingSaved(
  userId: string,
  listingId: string
): Promise<SavedListingsResult<boolean>> {
  if (!usesSupabaseSavedListings()) {
    return { data: draftMarketplaceService.getSavedListingIds().includes(listingId) };
  }
  const result = await isSupabaseListingSaved(userId, listingId);
  return { data: result.saved, error: result.error };
}

export async function saveListing(
  userId: string,
  listingId: string
): Promise<{ success: boolean; error?: string }> {
  if (!usesSupabaseSavedListings()) {
    const current = draftMarketplaceService.getSavedListingIds();
    if (!current.includes(listingId)) {
      draftMarketplaceService.toggleSavedListing(listingId);
    }
    return { success: true };
  }
  return saveSupabaseListing(userId, listingId);
}

export async function unsaveListing(
  userId: string,
  listingId: string
): Promise<{ success: boolean; error?: string }> {
  if (!usesSupabaseSavedListings()) {
    const current = draftMarketplaceService.getSavedListingIds();
    if (current.includes(listingId)) {
      draftMarketplaceService.toggleSavedListing(listingId);
    }
    return { success: true };
  }
  return unsaveSupabaseListing(userId, listingId);
}

export async function toggleSavedListing(
  userId: string,
  listingId: string
): Promise<{ saved: boolean; error?: string }> {
  if (!usesSupabaseSavedListings()) {
    const wasSaved = draftMarketplaceService.getSavedListingIds().includes(listingId);
    draftMarketplaceService.toggleSavedListing(listingId);
    return { saved: !wasSaved };
  }
  return toggleSupabaseSavedListing(userId, listingId);
}
