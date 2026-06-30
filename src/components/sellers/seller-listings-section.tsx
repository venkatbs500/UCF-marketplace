import type { Listing } from "@/lib/types";
import { ListingGrid } from "@/components/marketplace/listing-grid";
import { EmptyState } from "@/components/ui/empty-state";
import { Package } from "lucide-react";

interface SellerListingsSectionProps {
  listings: Listing[];
}

export function SellerListingsSection({ listings }: SellerListingsSectionProps) {
  return (
    <section>
      <h2 className="mb-4 text-xl font-bold">
        Active Listings ({listings.length})
      </h2>
      {listings.length > 0 ? (
        <ListingGrid listings={listings} />
      ) : (
        <EmptyState
          icon={Package}
          title="No active listings"
          description="This seller doesn't have any active listings right now."
        />
      )}
    </section>
  );
}
