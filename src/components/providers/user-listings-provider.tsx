"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import type { AuthUser, Listing, ListingDraft } from "@/lib/types";
import {
  draftMarketplaceService,
  usesSupabaseMarketplace,
} from "@/lib/services/active-marketplace-service";
import type { DeleteListingResult } from "@/lib/services/marketplace-service";
import {
  createSupabaseListing,
  deleteSupabaseListing,
  getSupabaseUserListings,
} from "@/lib/services/supabase-marketplace-service";
import { useAuth } from "@/components/providers/auth-provider";

type UserListingsContextValue = {
  isLoading: boolean;
  userListings: Listing[];
  userListingsError: string | null;
  currentDraft: ListingDraft;
  selectedImageFiles: File[];
  imagePreviewUrls: string[];
  updateDraft: (patch: Partial<ListingDraft>) => void;
  setSelectedImageFiles: (files: File[]) => void;
  clearDraft: () => void;
  createListing: (user: AuthUser) => Promise<Listing | null>;
  deleteListing: (listingId: string, user: AuthUser) => Promise<DeleteListingResult>;
  publishSuccess: boolean;
  publishError: string | null;
  isPublishing: boolean;
  clearPublishSuccess: () => void;
  refreshUserListings: () => Promise<void>;
  listingsVersion: number;
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

function revokePreviewUrls(urls: string[]) {
  urls.forEach((url) => URL.revokeObjectURL(url));
}

export function UserListingsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const supabaseMode = usesSupabaseMarketplace();

  const currentDraft = useSyncExternalStore(
    draftMarketplaceService.subscribe,
    draftMarketplaceService.getDraftSnapshot,
    draftMarketplaceService.getEmptyDraftSnapshot
  );

  const localUserListings = useSyncExternalStore(
    draftMarketplaceService.subscribe,
    draftMarketplaceService.getUserListingsSnapshot,
    draftMarketplaceService.getEmptyUserListingsSnapshot
  );

  const [remoteUserListings, setRemoteUserListings] = useState<Listing[]>([]);
  const [userListingsError, setUserListingsError] = useState<string | null>(null);
  const [remoteLoading, setRemoteLoading] = useState(supabaseMode);
  const [selectedImageFiles, setSelectedImageFilesState] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [listingsVersion, setListingsVersion] = useState(0);
  const isPublishingRef = useRef(false);
  const previewUrlsRef = useRef<string[]>([]);

  const isMounted = useSyncExternalStore(
    subscribeNoop,
    getClientMounted,
    getServerMounted
  );

  const refreshUserListings = useCallback(async () => {
    if (!supabaseMode || !user?.id) {
      setRemoteUserListings([]);
      setUserListingsError(null);
      setRemoteLoading(false);
      return;
    }

    setRemoteLoading(true);
    const result = await getSupabaseUserListings(user.id);
    setRemoteUserListings(result.listings);
    setUserListingsError(result.error ?? null);
    setRemoteLoading(false);
    setListingsVersion((value) => value + 1);
  }, [supabaseMode, user]);

  useEffect(() => {
    if (!supabaseMode || !user?.id) return;

    let cancelled = false;

    void getSupabaseUserListings(user.id).then((result) => {
      if (cancelled) return;
      setRemoteUserListings(result.listings);
      setUserListingsError(result.error ?? null);
      setRemoteLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [supabaseMode, user?.id]);

  const userListings = supabaseMode ? remoteUserListings : localUserListings;
  const isLoading = !isMounted || (supabaseMode && remoteLoading);

  const setSelectedImageFiles = useCallback((files: File[]) => {
    revokePreviewUrls(previewUrlsRef.current);
    const previews = files.map((file) => URL.createObjectURL(file));
    previewUrlsRef.current = previews;
    setSelectedImageFilesState(files);
    setImagePreviewUrls(previews);
  }, []);

  useEffect(() => {
    return () => {
      revokePreviewUrls(previewUrlsRef.current);
    };
  }, []);

  const updateDraft = useCallback((patch: Partial<ListingDraft>) => {
    draftMarketplaceService.updateDraft(patch);
  }, []);

  const clearDraft = useCallback(() => {
    draftMarketplaceService.clearDraft();
    setSelectedImageFiles([]);
    setPublishError(null);
  }, [setSelectedImageFiles]);

  const createListing = useCallback(
    async (authUser: AuthUser): Promise<Listing | null> => {
      if (isPublishingRef.current || publishSuccess) return null;
      setPublishError(null);

      if (supabaseMode) {
        if (selectedImageFiles.length === 0) {
          setPublishError("Please add at least one image before publishing.");
          return null;
        }

        isPublishingRef.current = true;
        setIsPublishing(true);
        try {
          const draft = draftMarketplaceService.getCurrentDraft();
          const result = await createSupabaseListing(
            draft,
            authUser,
            selectedImageFiles
          );
          if (!result.listing) {
            setPublishError(result.error ?? "We could not publish your listing.");
            return null;
          }
          draftMarketplaceService.clearDraft();
          setSelectedImageFiles([]);
          setPublishSuccess(true);
          await refreshUserListings();
          return result.listing;
        } finally {
          isPublishingRef.current = false;
          setIsPublishing(false);
        }
      }

      const draft = draftMarketplaceService.getCurrentDraft();
      const existing = draftMarketplaceService.getUserListings();

      isPublishingRef.current = true;
      setIsPublishing(true);
      try {
        const result = draftMarketplaceService.publishListing(authUser, draft, existing);
        if (!result.listing) {
          setPublishError(result.error ?? "Please complete all required listing fields.");
          return null;
        }
        setPublishSuccess(true);
        return result.listing;
      } finally {
        isPublishingRef.current = false;
        setIsPublishing(false);
      }
    },
    [
      publishSuccess,
      refreshUserListings,
      selectedImageFiles,
      setSelectedImageFiles,
      supabaseMode,
    ]
  );

  const deleteListing = useCallback(
    async (listingId: string, authUser: AuthUser): Promise<DeleteListingResult> => {
      if (supabaseMode) {
        const result = await deleteSupabaseListing(listingId, authUser.id);
        if (result.success) {
          await refreshUserListings();
        }
        return result;
      }
      return draftMarketplaceService.deleteListing(listingId, authUser.id);
    },
    [refreshUserListings, supabaseMode]
  );

  const clearPublishSuccess = useCallback(() => {
    setPublishSuccess(false);
    setPublishError(null);
    draftMarketplaceService.clearDraft();
    setSelectedImageFiles([]);
  }, [setSelectedImageFiles]);

  const value = useMemo(
    () => ({
      isLoading,
      userListings,
      userListingsError,
      currentDraft,
      selectedImageFiles,
      imagePreviewUrls,
      updateDraft,
      setSelectedImageFiles,
      clearDraft,
      createListing,
      deleteListing,
      publishSuccess,
      publishError,
      isPublishing,
      clearPublishSuccess,
      refreshUserListings,
      listingsVersion,
    }),
    [
      isLoading,
      userListings,
      userListingsError,
      currentDraft,
      selectedImageFiles,
      imagePreviewUrls,
      updateDraft,
      setSelectedImageFiles,
      clearDraft,
      createListing,
      deleteListing,
      publishSuccess,
      publishError,
      isPublishing,
      clearPublishSuccess,
      refreshUserListings,
      listingsVersion,
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
