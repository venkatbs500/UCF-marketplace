"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";
import { localMarketplaceService } from "@/lib/services/local-marketplace-service";

type SavedListingsContextValue = {
  isLoading: boolean;
  savedListingIds: string[];
  isSaved: (id: string) => boolean;
  toggleSaved: (id: string) => void;
  clearSaved: () => void;
};

const SavedListingsContext = createContext<SavedListingsContextValue | null>(
  null
);

function subscribeNoop() {
  return () => {};
}

function getClientMounted() {
  return true;
}

function getServerMounted() {
  return false;
}

export function SavedListingsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const savedListingIds = useSyncExternalStore(
    localMarketplaceService.subscribe,
    localMarketplaceService.getSavedListingIdsSnapshot,
    localMarketplaceService.getEmptySavedSnapshot
  );
  const isMounted = useSyncExternalStore(
    subscribeNoop,
    getClientMounted,
    getServerMounted
  );
  const isLoading = !isMounted;

  const isSaved = useCallback(
    (id: string) => savedListingIds.includes(id),
    [savedListingIds]
  );

  const toggleSaved = useCallback((id: string) => {
    localMarketplaceService.toggleSavedListing(id);
  }, []);

  const clearSaved = useCallback(() => {
    localMarketplaceService.clearSavedListings();
  }, []);

  const value = useMemo(
    () => ({
      isLoading,
      savedListingIds,
      isSaved,
      toggleSaved,
      clearSaved,
    }),
    [isLoading, savedListingIds, isSaved, toggleSaved, clearSaved]
  );

  return (
    <SavedListingsContext.Provider value={value}>
      {children}
    </SavedListingsContext.Provider>
  );
}

export function useSavedListings() {
  const context = useContext(SavedListingsContext);
  if (!context) {
    throw new Error("useSavedListings must be used within SavedListingsProvider");
  }
  return context;
}
