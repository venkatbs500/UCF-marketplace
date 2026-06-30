"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import type { AuthUser, Listing, ListingDraft } from "@/lib/types";
import { EMPTY_LISTING_DRAFT } from "@/lib/types";
import {
  clearListingDraft,
  getEmptyDraftSnapshot,
  getEmptyUserListingsSnapshot,
  getListingDraftSnapshot,
  getUserListingsSnapshot,
  loadListingDraft,
  loadUserListings,
  saveListingDraft,
  saveUserListings,
  subscribeStorage,
} from "@/lib/marketplace-storage";

type UserListingsContextValue = {
  isLoading: boolean;
  userListings: Listing[];
  currentDraft: ListingDraft;
  updateDraft: (patch: Partial<ListingDraft>) => void;
  clearDraft: () => void;
  createListing: (user: AuthUser) => Listing | null;
  publishSuccess: boolean;
  clearPublishSuccess: () => void;
};

const UserListingsContext = createContext<UserListingsContextValue | null>(null);

function subscribeNoop() {
  return () => {};
}

function getClientMounted() {
  return true;
}

function getServerMounted() {
  return false;
}

function draftToListing(draft: ListingDraft, user: AuthUser): Listing | null {
  if (
    !draft.title.trim() ||
    !draft.category ||
    !draft.condition ||
    draft.price === "" ||
    !draft.campusArea ||
    !draft.location.trim() ||
    !draft.description.trim()
  ) {
    return null;
  }

  const now = new Date().toISOString().split("T")[0];
  const price = Number(draft.price);

  return {
    id: `user-listing-${Date.now()}`,
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

export function UserListingsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const userListings = useSyncExternalStore(
    subscribeStorage,
    getUserListingsSnapshot,
    getEmptyUserListingsSnapshot
  );
  const currentDraft = useSyncExternalStore(
    subscribeStorage,
    getListingDraftSnapshot,
    getEmptyDraftSnapshot
  );
  const isMounted = useSyncExternalStore(
    subscribeNoop,
    getClientMounted,
    getServerMounted
  );
  const isLoading = !isMounted;
  const [publishSuccess, setPublishSuccess] = useState(false);

  const updateDraft = useCallback((patch: Partial<ListingDraft>) => {
    const current = loadListingDraft();
    saveListingDraft({ ...current, ...patch });
  }, []);

  const clearDraft = useCallback(() => {
    clearListingDraft();
    saveListingDraft({ ...EMPTY_LISTING_DRAFT });
  }, []);

  const createListing = useCallback((user: AuthUser): Listing | null => {
    const draft = loadListingDraft();
    const listing = draftToListing(draft, user);
    if (!listing) return null;

    const existing = loadUserListings();
    saveUserListings([listing, ...existing]);
    clearListingDraft();
    saveListingDraft({ ...EMPTY_LISTING_DRAFT });
    setPublishSuccess(true);
    return listing;
  }, []);

  const clearPublishSuccess = useCallback(() => {
    setPublishSuccess(false);
  }, []);

  const value = useMemo(
    () => ({
      isLoading,
      userListings,
      currentDraft,
      updateDraft,
      clearDraft,
      createListing,
      publishSuccess,
      clearPublishSuccess,
    }),
    [
      isLoading,
      userListings,
      currentDraft,
      updateDraft,
      clearDraft,
      createListing,
      publishSuccess,
      clearPublishSuccess,
    ]
  );

  return (
    <UserListingsContext.Provider value={value}>
      {children}
    </UserListingsContext.Provider>
  );
}

export function useUserListings() {
  const context = useContext(UserListingsContext);
  if (!context) {
    throw new Error("useUserListings must be used within UserListingsProvider");
  }
  return context;
}
