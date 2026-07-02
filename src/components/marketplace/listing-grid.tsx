import Link from "next/link";
import type { ReactNode } from "react";
import type { Listing } from "@/lib/types";
import { ListingCard } from "./listing-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";

interface ListingGridProps {
  listings: Listing[];
  emptyTitle?: string;
  emptyDescription?: string;
  emptyPrimaryLabel?: string;
  emptySecondaryAction?: ReactNode;
  showSellCta?: boolean;
  ownerActionVariant?: "card" | "profile";
}

export function ListingGrid({
  listings,
  emptyTitle = "No listings found",
  emptyDescription = "Try adjusting your search or filters.",
  emptyPrimaryLabel,
  emptySecondaryAction,
  showSellCta = false,
  ownerActionVariant,
}: ListingGridProps) {
  if (listings.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title={emptyTitle}
        description={emptyDescription}
        action={
          showSellCta || emptySecondaryAction ? (
            <div className="flex flex-wrap justify-center gap-3">
              {showSellCta && (
                <Link href="/sell">
                  <Button>{emptyPrimaryLabel ?? "Post a Listing"}</Button>
                </Link>
              )}
              {emptySecondaryAction}
            </div>
          ) : undefined
        }
      />
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {listings.map((listing) => (
        <ListingCard
          key={listing.id}
          listing={listing}
          ownerActionVariant={ownerActionVariant}
        />
      ))}
    </div>
  );
}
