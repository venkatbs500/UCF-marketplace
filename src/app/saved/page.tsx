"use client";

import Link from "next/link";
import { useMemo } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { AuthGuard } from "@/components/auth/auth-guard";
import { SectionHeading } from "@/components/ui/section-heading";
import { ListingGrid } from "@/components/marketplace/listing-grid";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useSavedListings } from "@/components/providers/saved-listings-provider";
import { useUserListings } from "@/components/providers/user-listings-provider";
import { getBrowseListings } from "@/lib/marketplace-utils";
import { isDemoDataEnabled } from "@/lib/product-mode";
import { usesSupabaseSavedListings } from "@/lib/saved-listings-mode";
import { Button } from "@/components/ui/button";

function SavedContent() {
  const {
    savedListingIds,
    savedListings: remoteSavedListings,
    isLoading,
    error,
  } = useSavedListings();
  const { userListings } = useUserListings();
  const demoEnabled = isDemoDataEnabled();
  const supabaseMode = usesSupabaseSavedListings();

  const savedListings = useMemo(() => {
    if (supabaseMode) return remoteSavedListings;
    const all = getBrowseListings(userListings, { includeDemo: demoEnabled });
    return all.filter((listing) => savedListingIds.includes(listing.id));
  }, [
    supabaseMode,
    remoteSavedListings,
    savedListingIds,
    userListings,
    demoEnabled,
  ]);

  return (
    <AppShell>
      <SectionHeading
        title="Saved listings"
        subtitle={
          savedListings.length > 0
            ? `${savedListings.length} item${savedListings.length !== 1 ? "s" : ""} saved`
            : "Save listings to come back later"
        }
      />

      {isLoading && (
        <LoadingSpinner className="min-h-[30vh]" label="Loading saved listings..." />
      )}

      {error && !isLoading && (
        <div
          role="alert"
          className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
        >
          {error}
        </div>
      )}

      {!isLoading && (
        <ListingGrid
          listings={savedListings}
          emptyTitle="No saved listings yet"
          emptyDescription="Save listings to come back later."
          showSellCta
        />
      )}

      {savedListings.length > 0 && (
        <div className="mt-8 text-center">
          <Link href="/marketplace">
            <Button variant="secondary">Browse More Listings</Button>
          </Link>
        </div>
      )}
    </AppShell>
  );
}

export default function SavedPage() {
  return (
    <AuthGuard>
      <SavedContent />
    </AuthGuard>
  );
}
