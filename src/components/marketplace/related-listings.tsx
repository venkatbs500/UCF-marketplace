"use client";

import type { Listing } from "@/lib/types";
import { SectionHeading } from "@/components/ui/section-heading";
import { ListingGrid } from "./listing-grid";
import { getRelatedListings } from "@/lib/marketplace-utils";
import { useUserListings } from "@/components/providers/user-listings-provider";

interface RelatedListingsProps {
  listing: Listing;
}

export function RelatedListings({ listing }: RelatedListingsProps) {
  const { userListings } = useUserListings();
  const related = getRelatedListings(listing, userListings);

  if (related.length === 0) return null;

  return (
    <section>
      <SectionHeading title="Related Listings" subtitle="More in this category" />
      <ListingGrid listings={related} />
    </section>
  );
}
