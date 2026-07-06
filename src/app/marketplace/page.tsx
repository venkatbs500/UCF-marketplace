"use client";

import { Suspense, useCallback, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Heart, PlusCircle } from "lucide-react";
import type { ListingCondition, ListingSortOption, MarketplaceCategory } from "@/lib/types";
import { AppShell } from "@/components/layout/app-shell";
import { SectionHeading } from "@/components/ui/section-heading";
import { Button } from "@/components/ui/button";
import { DemoModeBadge } from "@/components/ui/demo-mode-badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ListingGrid } from "@/components/marketplace/listing-grid";
import { BrowseResultBar } from "@/components/browse/browse-result-bar";
import {
  MarketplaceSearchControls,
  DEFAULT_MARKETPLACE_SEARCH,
} from "@/components/marketplace/marketplace-search-state";
import { useUserListings } from "@/components/providers/user-listings-provider";
import { useMarketplaceBrowseListings } from "@/hooks/use-marketplace-browse-listings";
import { useBrowseUrlState } from "@/hooks/use-browse-url-state";
import {
  filterAndSortListings,
  getBrowseListings,
  getMarketplaceBrowseLayout,
  isMarketplaceFilterActive,
} from "@/lib/marketplace-utils";
import { isDemoDataEnabledWithOverride } from "@/lib/product-mode";
import { usesSupabaseMarketplace } from "@/lib/marketplace-mode";

function parseMarketplaceParams(params: URLSearchParams) {
  return {
    search: params.get("search") ?? "",
    category: (params.get("category") as MarketplaceCategory | "all") ?? "all",
    condition: (params.get("condition") as ListingCondition | "all") ?? "all",
    campusArea: params.get("campusArea") ?? "all",
    sort: (params.get("sort") as ListingSortOption) ?? "newest",
  };
}

function serializeMarketplaceState(state: typeof DEFAULT_MARKETPLACE_SEARCH) {
  return {
    search: state.search,
    category: state.category,
    condition: state.condition,
    campusArea: state.campusArea,
    sort: state.sort,
  };
}

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
  const { userListings, listingsVersion } = useUserListings();
  const [searchState, setSearchState, resetSearchState] = useBrowseUrlState({
    defaults: DEFAULT_MARKETPLACE_SEARCH,
    parse: parseMarketplaceParams,
    serialize: serializeMarketplaceState,
  });
  const demoEnabled = isDemoDataEnabledWithOverride(searchParams);
  const supabaseMode = usesSupabaseMarketplace();

  const {
    listings: supabaseListings,
    loading: supabaseLoading,
    error: supabaseError,
  } = useMarketplaceBrowseListings({
    enabled: supabaseMode,
    refreshKey: listingsVersion,
  });

  const allListings = useMemo(() => {
    if (supabaseMode) return supabaseListings;
    return getBrowseListings(userListings, { includeDemo: demoEnabled });
  }, [supabaseMode, supabaseListings, userListings, demoEnabled]);

  const filtered = useMemo(
    () => filterAndSortListings(allListings, searchState),
    [allListings, searchState]
  );

  const { showFeaturedSection, featured, browseListings, resultCount } = useMemo(
    () => getMarketplaceBrowseLayout(filtered, searchState),
    [filtered, searchState]
  );

  const filtersActive = isMarketplaceFilterActive(searchState);
  const isRealEmpty = !demoEnabled && !supabaseMode && allListings.length === 0;
  const isSupabaseEmpty = supabaseMode && !supabaseLoading && allListings.length === 0;
  const listingDeleted = searchParams.get("listingDeleted") === "1";

  const handleSearchChange = useCallback(
    (patch: Partial<typeof DEFAULT_MARKETPLACE_SEARCH>) => {
      setSearchState(patch);
    },
    [setSearchState]
  );

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

      <div className="mb-6">
        <MarketplaceSearchControls
          state={searchState}
          onChange={handleSearchChange}
          onReset={resetSearchState}
        />
      </div>

      {supabaseLoading && (
        <LoadingSpinner className="min-h-[30vh]" label="Loading listings..." />
      )}

      {supabaseError && !supabaseLoading && (
        <div
          role="alert"
          className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
        >
          We could not load listings. Please try again.
        </div>
      )}

      {!supabaseLoading && (
        <>
          {showFeaturedSection && (
            <section className="mb-10" data-testid="featured-listings-section">
              <h3 className="mb-4 text-lg font-semibold text-gold">Featured Listings</h3>
              <ListingGrid listings={featured} />
            </section>
          )}

          <section data-testid="browse-listings-section">
            <BrowseResultBar
              count={resultCount}
              singular="listing"
              filtersActive={filtersActive}
              onReset={resetSearchState}
            />
            <ListingGrid
              listings={browseListings}
              showSellCta
              emptyTitle={
                filtersActive && allListings.length > 0
                  ? "No listings match your filters"
                  : isRealEmpty || isSupabaseEmpty
                    ? "No student listings yet"
                    : "No listings match your search"
              }
              emptyDescription={
                filtersActive && allListings.length > 0
                  ? "Try clearing search or changing your filters."
                  : isRealEmpty || isSupabaseEmpty
                    ? "Be the first verified student to post something on Knight Market."
                    : "Try different filters or post something new."
              }
              emptyPrimaryLabel={isRealEmpty || isSupabaseEmpty ? "Post the first listing" : undefined}
            />
          </section>
        </>
      )}
    </AppShell>
  );
}
