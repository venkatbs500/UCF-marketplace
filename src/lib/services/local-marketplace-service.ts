import type { MarketplaceService, PublishListingResult, DeleteListingResult } from "./marketplace-service";
import type { AuthUser, Listing, ListingDraft } from "./service-types";
import { EMPTY_LISTING_DRAFT } from "@/lib/types";
import {
  clearListingDraft,
  getEmptyDraftSnapshot,
  getEmptySavedSnapshot,
  getEmptyUserListingsSnapshot,
  getListingDraftSnapshot,
  getSavedListingsSnapshot,
  getUserListingsSnapshot,
  loadListingDraft,
  loadSavedListingIds,
  loadUserListings,
  saveListingDraft,
  saveSavedListingIds,
  saveUserListings,
  subscribeStorage,
} from "@/lib/marketplace-storage";
import {
  filterAndSortListings,
  getListingById,
  getListingsBySeller,
  getSellerById,
  getBrowseListings,
  canUserDeleteListing,
} from "@/lib/marketplace-utils";

function draftToListing(draft: ListingDraft, user: AuthUser): Listing | null {
  if (
    !draft.title.trim() ||
    !draft.category ||
    !draft.condition ||
    draft.price === "" ||
    !draft.campusArea ||
    !draft.location.trim() ||
    !draft.description.trim() ||
    draft.description.trim().length < 20
  ) {
    return null;
  }

  const now = new Date().toISOString().split("T")[0];
  const price = Number(draft.price);

  return {
    id: `user-listing-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    title: draft.title.trim(),
    description: draft.description.trim(),
    price: Number.isNaN(price) ? 0 : price,
    category: draft.category,
    condition: draft.condition,
    location: draft.location.trim(),
    campusArea: draft.campusArea,
    sellerId: user.id,
    sellerName: user.name,
    sellerAvatarInitials: user.avatarInitials,
    sellerRating: 5,
    sellerJoinedAt: user.joinedAt,
    sellerMajor: user.major,
    sellerYear: user.year,
    images: draft.images.length > 0 ? draft.images : ["📦"],
    tags: draft.tags,
    postedAt: now,
    updatedAt: now,
    isFeatured: false,
    isNegotiable: draft.isNegotiable,
    pickupOptions: draft.pickupOptions,
    status: "active",
    views: 0,
    savedCount: 0,
  };
}

/** LocalStorage-backed marketplace — temporary until Supabase replaces this module. */
export const localMarketplaceService: MarketplaceService = {
  subscribe: subscribeStorage,

  getSavedListingIds: loadSavedListingIds,
  getSavedListingIdsSnapshot: getSavedListingsSnapshot,
  getEmptySavedSnapshot: getEmptySavedSnapshot,
  saveSavedListingIds,
  toggleSavedListing(id: string) {
    const current = loadSavedListingIds();
    const next = current.includes(id)
      ? current.filter((savedId) => savedId !== id)
      : [...new Set([...current, id])];
    saveSavedListingIds(next);
  },
  clearSavedListings() {
    saveSavedListingIds([]);
  },

  getUserListings: loadUserListings,
  getUserListingsSnapshot,
  getEmptyUserListingsSnapshot,
  saveUserListings,

  getCurrentDraft: loadListingDraft,
  getDraftSnapshot: getListingDraftSnapshot,
  getEmptyDraftSnapshot,
  updateDraft(patch: Partial<ListingDraft>) {
    const current = loadListingDraft();
    saveListingDraft({ ...current, ...patch });
  },
  clearDraft() {
    clearListingDraft();
    saveListingDraft({ ...EMPTY_LISTING_DRAFT });
  },

  getAllListings(userListings = []) {
    return getBrowseListings(userListings);
  },
  getListingById,
  getSellerById,
  getListingsBySeller,
  filterAndSortListings,

  publishListing(user, draft, existingListings): PublishListingResult {
    const listing = draftToListing(draft, user);
    if (!listing) {
      return { listing: null, error: "Please complete all required listing fields." };
    }
    saveUserListings([listing, ...existingListings]);
    clearListingDraft();
    saveListingDraft({ ...EMPTY_LISTING_DRAFT });
    return { listing };
  },

  deleteListing(listingId: string, userId: string): DeleteListingResult {
    if (!userId) {
      return { success: false, error: "Sign in to manage your listings." };
    }

    const listings = loadUserListings();
    const listing = listings.find((item) => item.id === listingId);

    if (!listing) {
      return { success: false, error: "Listing not found." };
    }

    if (!canUserDeleteListing(listing, userId)) {
      return { success: false, error: "You can only delete your own listings." };
    }

    saveUserListings(listings.filter((item) => item.id !== listingId));

    const saved = loadSavedListingIds();
    if (saved.includes(listingId)) {
      saveSavedListingIds(saved.filter((id) => id !== listingId));
    }

    return { success: true };
  },
};
