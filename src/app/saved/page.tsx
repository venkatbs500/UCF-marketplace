"use client";

import Link from "next/link";
import { useMemo } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { AuthGuard } from "@/components/auth/auth-guard";
import { SectionHeading } from "@/components/ui/section-heading";
import { ListingGrid } from "@/components/marketplace/listing-grid";
import { useSavedListings } from "@/components/providers/saved-listings-provider";
import { useUserListings } from "@/components/providers/user-listings-provider";
import { getBrowseListings } from "@/lib/marketplace-utils";
import { isDemoDataEnabled } from "@/lib/product-mode";
import { Button } from "@/components/ui/button";

function SavedContent() {
  const { savedListingIds } = useSavedListings();
  const { userListings } = useUserListings();
  const demoEnabled = isDemoDataEnabled();

  const savedListings = useMemo(() => {
    const all = getBrowseListings(userListings, { includeDemo: demoEnabled });
    return all.filter((l) => savedListingIds.includes(l.id));
  }, [savedListingIds, userListings, demoEnabled]);

  return (
    <AppShell>
      <SectionHeading
        title="Saved Listings"
        subtitle={`${savedListings.length} item${savedListings.length !== 1 ? "s" : ""} saved`}
      />
      <ListingGrid
        listings={savedListings}
        emptyTitle="No saved listings yet"
        emptyDescription="Tap the heart on any listing to save it for later."
        showSellCta
      />
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
