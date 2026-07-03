"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import type { Listing } from "@/lib/types";
import { draftMarketplaceService } from "@/lib/services/active-marketplace-service";
import {
  getSavedListingIds,
  getSavedListings,
  saveListing,
  unsaveListing,
  usesSupabaseSavedListings,
} from "@/lib/services/saved-listings-service";
import { useAuth } from "@/components/providers/auth-provider";

type SavedListingsContextValue = {
  isLoading: boolean;
  savedListingIds: string[];
  savedListings: Listing[];
  error: string | null;
  isSaved: (id: string) => boolean;
  toggleSaved: (id: string) => Promise<void>;
  clearSaved: () => void;
  refreshSavedListings: () => Promise<void>;
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
  const { user } = useAuth();
  const supabaseMode = usesSupabaseSavedListings();
  const userId = user?.id ?? null;

  const localSavedListingIds = useSyncExternalStore(
    draftMarketplaceService.subscribe,
    draftMarketplaceService.getSavedListingIdsSnapshot,
    draftMarketplaceService.getEmptySavedSnapshot
  );

  const [remoteSavedListingIds, setRemoteSavedListingIds] = useState<string[]>([]);
  const [remoteSavedListings, setRemoteSavedListings] = useState<Listing[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [remoteLoading, setRemoteLoading] = useState(supabaseMode);

  const isMounted = useSyncExternalStore(
    subscribeNoop,
    getClientMounted,
    getServerMounted
  );

  const refreshSavedListings = useCallback(async () => {
    if (!supabaseMode || !userId) {
      setRemoteLoading(false);
      return;
    }

    setRemoteLoading(true);
    const [idsResult, listingsResult] = await Promise.all([
      getSavedListingIds(userId),
      getSavedListings(userId),
    ]);
    setRemoteSavedListingIds(idsResult.data);
    setRemoteSavedListings(listingsResult.data);
    setError(idsResult.error ?? listingsResult.error ?? null);
    setRemoteLoading(false);
  }, [supabaseMode, userId]);

  useEffect(() => {
    if (!supabaseMode || !userId) return;

    let cancelled = false;

    void Promise.all([getSavedListingIds(userId), getSavedListings(userId)]).then(
      ([idsResult, listingsResult]) => {
        if (cancelled) return;
        setRemoteSavedListingIds(idsResult.data);
        setRemoteSavedListings(listingsResult.data);
        setError(idsResult.error ?? listingsResult.error ?? null);
        setRemoteLoading(false);
      }
    );

    return () => {
      cancelled = true;
    };
  }, [supabaseMode, userId]);

  const savedListingIds = useMemo(() => {
    if (!supabaseMode) return localSavedListingIds;
    return userId ? remoteSavedListingIds : [];
  }, [supabaseMode, userId, localSavedListingIds, remoteSavedListingIds]);

  const savedListings = useMemo(() => {
    if (!supabaseMode || !userId) return [];
    return remoteSavedListings;
  }, [supabaseMode, userId, remoteSavedListings]);

  const isLoading = !isMounted || (supabaseMode && Boolean(userId) && remoteLoading);

  const isSaved = useCallback(
    (id: string) => savedListingIds.includes(id),
    [savedListingIds]
  );

  const toggleSaved = useCallback(
    async (id: string) => {
      if (!userId) return;

      const previousIds = savedListingIds;
      const previousListings = remoteSavedListings;
      const wasSaved = previousIds.includes(id);
      setError(null);

      if (supabaseMode) {
        const optimisticIds = wasSaved
          ? previousIds.filter((savedId) => savedId !== id)
          : [...previousIds, id];
        const optimisticListings = wasSaved
          ? previousListings.filter((listing) => listing.id !== id)
          : previousListings;

        setRemoteSavedListingIds(optimisticIds);
        setRemoteSavedListings(optimisticListings);

        const result = wasSaved
          ? await unsaveListing(userId, id)
          : await saveListing(userId, id);

        if (!result.success) {
          setRemoteSavedListingIds(previousIds);
          setRemoteSavedListings(previousListings);
          setError(result.error ?? "We could not update your saved listing.");
          return;
        }

        await refreshSavedListings();
        return;
      }

      draftMarketplaceService.toggleSavedListing(id);
    },
    [
      userId,
      supabaseMode,
      savedListingIds,
      remoteSavedListings,
      refreshSavedListings,
    ]
  );

  const clearSaved = useCallback(() => {
    if (supabaseMode) {
      setRemoteSavedListingIds([]);
      setRemoteSavedListings([]);
      return;
    }
    draftMarketplaceService.clearSavedListings();
  }, [supabaseMode]);

  const value = useMemo(
    () => ({
      isLoading,
      savedListingIds,
      savedListings,
      error,
      isSaved,
      toggleSaved,
      clearSaved,
      refreshSavedListings,
    }),
    [
      isLoading,
      savedListingIds,
      savedListings,
      error,
      isSaved,
      toggleSaved,
      clearSaved,
      refreshSavedListings,
    ]
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
