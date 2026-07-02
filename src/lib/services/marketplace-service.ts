import type { AuthUser, Listing, ListingDraft, SellerProfile } from "./service-types";
import type { MarketplaceFilters } from "@/lib/marketplace-utils";

export type PublishListingResult = {
  listing: Listing | null;
  error?: string;
};

export type DeleteListingResult = {
  success: boolean;
  error?: string;
};

/**
 * Marketplace service contract — swap `localMarketplaceService` for Supabase
 * queries/mutations when the backend is ready.
 */
export interface MarketplaceService {
  subscribe(listener: () => void): () => void;

  getSavedListingIds(): string[];
  getSavedListingIdsSnapshot(): string[];
  getEmptySavedSnapshot(): string[];
  saveSavedListingIds(ids: string[]): void;
  toggleSavedListing(id: string): void;
  clearSavedListings(): void;

  getUserListings(): Listing[];
  getUserListingsSnapshot(): Listing[];
  getEmptyUserListingsSnapshot(): Listing[];
  saveUserListings(listings: Listing[]): void;

  getCurrentDraft(): ListingDraft;
  getDraftSnapshot(): ListingDraft;
  getEmptyDraftSnapshot(): ListingDraft;
  updateDraft(patch: Partial<ListingDraft>): void;
  clearDraft(): void;

  getAllListings(userListings?: Listing[]): Listing[];
  getListingById(id: string, userListings?: Listing[]): Listing | undefined;
  getSellerById(
    id: string,
    options?: { authUser?: AuthUser | null; userListings?: Listing[] }
  ): SellerProfile | undefined;
  getListingsBySeller(sellerId: string, userListings?: Listing[]): Listing[];
  filterAndSortListings(listings: Listing[], filters: MarketplaceFilters): Listing[];

  publishListing(
    user: AuthUser,
    draft: ListingDraft,
    existingListings: Listing[]
  ): PublishListingResult;

  deleteListing(listingId: string, userId: string): DeleteListingResult;
}
