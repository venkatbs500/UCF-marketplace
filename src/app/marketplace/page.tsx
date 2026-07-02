"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Heart, PlusCircle } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { SectionHeading } from "@/components/ui/section-heading";
import { Button } from "@/components/ui/button";
import { DemoModeBadge } from "@/components/ui/demo-mode-badge";
import { ListingGrid } from "@/components/marketplace/listing-grid";
import {
  MarketplaceSearchControls,
  DEFAULT_MARKETPLACE_SEARCH,
} from "@/components/marketplace/marketplace-search-state";
import { useUserListings } from "@/components/providers/user-listings-provider";
import {
  filterAndSortListings,
  getBrowseListings,
  getMarketplaceBrowseLayout,
} from "@/lib/marketplace-utils";
import { isDemoDataEnabledWithOverride } from "@/lib/product-mode";

export default function MarketplacePage() {
  return (
    <Suspense
      fallback={
        <AppShell>
          <SectionHeading title="Marketplace" subtitle="Loading..." />
        </AppShell>
      }
    >
      <MarketplacePageContent />
    </Suspense>
  );
}

function MarketplacePageContent() {
  const searchParams = useSearchParams();
  const { userListings } = useUserListings();
  const [searchState, setSearchState] = useState(DEFAULT_MARKETPLACE_SEARCH);
  const demoEnabled = isDemoDataEnabledWithOverride(searchParams);

  const allListings = useMemo(
    () => getBrowseListings(userListings, { includeDemo: demoEnabled }),
    [userListings, demoEnabled]
  );

  const filtered = useMemo(
    () => filterAndSortListings(allListings, searchState),
    [allListings, searchState]
  );

  const { showFeaturedSection, featured, browseListings, resultCount } = useMemo(
    () => getMarketplaceBrowseLayout(filtered, searchState),
    [filtered, searchState]
  );

  const isRealEmpty = !demoEnabled && allListings.length === 0;
  const listingDeleted = searchParams.get("listingDeleted") === "1";

  return (
    <AppShell>
      {listingDeleted && (
        <div
          role="status"
          data-testid="listing-deleted-message"
          className="mb-6 rounded-2xl border border-gold/30 bg-gold/10 px-4 py-3 text-sm"
        >
          Listing deleted.
        </div>
      )}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <SectionHeading
            title="Marketplace"
            subtitle="Buy and sell with verified UCF students"
          />
          <DemoModeBadge />
        </div>
        <div className="flex gap-2">
          <Link href="/saved">
            <Button variant="secondary" size="sm">
              <Heart className="h-4 w-4" />
              Saved
            </Button>
          </Link>
          <Link href="/sell">
            <Button size="sm">
              <PlusCircle className="h-4 w-4" />
              Sell
            </Button>
          </Link>
        </div>
      </div>

      {!demoEnabled && userListings.length > 0 && (
        <p className="mb-6 text-xs text-muted">
          Real image uploads are coming next. Listings may show placeholder previews for now.
        </p>
      )}

      <div className="mb-8">
        <MarketplaceSearchControls
          state={searchState}
          onChange={(patch) => setSearchState((s) => ({ ...s, ...patch }))}
        />
      </div>

      {showFeaturedSection && (
        <section className="mb-10" data-testid="featured-listings-section">
          <h3 className="mb-4 text-lg font-semibold text-gold">Featured Listings</h3>
          <ListingGrid listings={featured} />
        </section>
      )}

      <section data-testid="browse-listings-section">
        <h3 className="mb-4 text-lg font-semibold">
          {resultCount} Listing{resultCount !== 1 ? "s" : ""}
        </h3>
        <ListingGrid
          listings={browseListings}
          showSellCta
          emptyTitle={
            isRealEmpty
              ? "No student listings yet"
              : "No listings match your search"
          }
          emptyDescription={
            isRealEmpty
              ? "Be the first verified student to post something on Knight Market."
              : "Try different filters or post something new."
          }
          emptyPrimaryLabel={isRealEmpty ? "Post the first listing" : undefined}
        />
      </section>
    </AppShell>
  );
}
