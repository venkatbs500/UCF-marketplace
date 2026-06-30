"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Heart, PlusCircle } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { SectionHeading } from "@/components/ui/section-heading";
import { Button } from "@/components/ui/button";
import { ListingGrid } from "@/components/marketplace/listing-grid";
import {
  MarketplaceSearchControls,
  DEFAULT_MARKETPLACE_SEARCH,
} from "@/components/marketplace/marketplace-search-state";
import { useUserListings } from "@/components/providers/user-listings-provider";
import { listings as mockListings } from "@/lib/mock-data";
import { filterAndSortListings, mergeListings } from "@/lib/marketplace-utils";

export default function MarketplacePage() {
  const { userListings } = useUserListings();
  const [searchState, setSearchState] = useState(DEFAULT_MARKETPLACE_SEARCH);

  const allListings = useMemo(
    () => mergeListings(mockListings, userListings),
    [userListings]
  );

  const filtered = useMemo(
    () => filterAndSortListings(allListings, searchState),
    [allListings, searchState]
  );

  const featured = useMemo(
    () =>
      filtered.filter((l) => l.isFeatured).slice(0, 4),
    [filtered]
  );

  const showFeatured =
    searchState.category === "all" &&
    !searchState.search &&
    searchState.condition === "all" &&
    searchState.campusArea === "all" &&
    featured.length > 0;

  return (
    <AppShell>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <SectionHeading
          title="Marketplace"
          subtitle="Buy and sell with verified UCF students"
        />
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

      <div className="mb-8">
        <MarketplaceSearchControls
          state={searchState}
          onChange={(patch) => setSearchState((s) => ({ ...s, ...patch }))}
        />
      </div>

      {showFeatured && (
        <section className="mb-10">
          <h3 className="mb-4 text-lg font-semibold text-gold">Featured Listings</h3>
          <ListingGrid listings={featured} />
        </section>
      )}

      <section>
        <h3 className="mb-4 text-lg font-semibold">
          {filtered.length} Listing{filtered.length !== 1 ? "s" : ""}
        </h3>
        <ListingGrid
          listings={filtered}
          showSellCta
          emptyTitle="No listings match your search"
          emptyDescription="Try different filters or post something new."
        />
      </section>
    </AppShell>
  );
}
