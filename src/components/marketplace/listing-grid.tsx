import Link from "next/link";
import type { Listing } from "@/lib/types";
import { ListingCard } from "./listing-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";

interface ListingGridProps {
  listings: Listing[];
  emptyTitle?: string;
  emptyDescription?: string;
  showSellCta?: boolean;
}

export function ListingGrid({
  listings,
  emptyTitle = "No listings found",
  emptyDescription = "Try adjusting your search or filters.",
  showSellCta = false,
}: ListingGridProps) {
  if (listings.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title={emptyTitle}
        description={emptyDescription}
        action={
          showSellCta ? (
            <Link href="/sell">
              <Button>Post a Listing</Button>
            </Link>
          ) : undefined
        }
      />
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
