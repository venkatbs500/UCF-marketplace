"use client";

import type { Listing } from "@/lib/types";
import { SectionHeading } from "@/components/ui/section-heading";
import { ListingGrid } from "./listing-grid";
import { getRelatedListings } from "@/lib/marketplace-utils";
import { useUserListings } from "@/components/providers/user-listings-provider";
import { useMarketplaceBrowseListings } from "@/hooks/use-marketplace-browse-listings";
import { usesSupabaseMarketplace } from "@/lib/marketplace-mode";

interface RelatedListingsProps {
  listing: Listing;
}

export function RelatedListings({ listing }: RelatedListingsProps) {
  const { userListings, listingsVersion } = useUserListings();
  const supabaseMode = usesSupabaseMarketplace();
  const { listings: browseListings } = useMarketplaceBrowseListings({
    enabled: supabaseMode,
    refreshKey: listingsVersion,
  });

  const sourceListings = supabaseMode ? browseListings : userListings;
  const related = getRelatedListings(listing, sourceListings);

  if (related.length === 0) return null;

  return (
    <section>
      <SectionHeading title="Related Listings" subtitle="More in this category" />
      <ListingGrid listings={related} />
    </section>
  );
}
