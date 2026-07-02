"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import type { AuthUser, Listing, ListingDraft } from "@/lib/types";
import { localMarketplaceService } from "@/lib/services/local-marketplace-service";
import type { DeleteListingResult } from "@/lib/services/marketplace-service";

type UserListingsContextValue = {
  isLoading: boolean;
  userListings: Listing[];
  currentDraft: ListingDraft;
  updateDraft: (patch: Partial<ListingDraft>) => void;
  clearDraft: () => void;
  createListing: (user: AuthUser) => Listing | null;
  deleteListing: (listingId: string, user: AuthUser) => DeleteListingResult;
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

export function UserListingsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const userListings = useSyncExternalStore(
    localMarketplaceService.subscribe,
    localMarketplaceService.getUserListingsSnapshot,
    localMarketplaceService.getEmptyUserListingsSnapshot
  );
  const currentDraft = useSyncExternalStore(
    localMarketplaceService.subscribe,
    localMarketplaceService.getDraftSnapshot,
    localMarketplaceService.getEmptyDraftSnapshot
  );
  const isMounted = useSyncExternalStore(
    subscribeNoop,
    getClientMounted,
    getServerMounted
  );
  const isLoading = !isMounted;
  const [publishSuccess, setPublishSuccess] = useState(false);
  const isPublishingRef = useRef(false);

  const updateDraft = useCallback((patch: Partial<ListingDraft>) => {
    localMarketplaceService.updateDraft(patch);
  }, []);

  const clearDraft = useCallback(() => {
    localMarketplaceService.clearDraft();
  }, []);

  const createListing = useCallback((user: AuthUser): Listing | null => {
    if (isPublishingRef.current || publishSuccess) return null;
    const draft = localMarketplaceService.getCurrentDraft();
    const existing = localMarketplaceService.getUserListings();

    isPublishingRef.current = true;
    try {
      const result = localMarketplaceService.publishListing(user, draft, existing);
      if (!result.listing) return null;
      setPublishSuccess(true);
      return result.listing;
    } finally {
      isPublishingRef.current = false;
    }
  }, [publishSuccess]);

  const deleteListing = useCallback(
    (listingId: string, user: AuthUser): DeleteListingResult => {
      return localMarketplaceService.deleteListing(listingId, user.id);
    },
    []
  );

  const clearPublishSuccess = useCallback(() => {
    setPublishSuccess(false);
    localMarketplaceService.clearDraft();
  }, []);

  const value = useMemo(
    () => ({
      isLoading,
      userListings,
      currentDraft,
      updateDraft,
      clearDraft,
      createListing,
      deleteListing,
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
      deleteListing,
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
