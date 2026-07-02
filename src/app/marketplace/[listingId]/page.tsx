"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ListingDetail } from "@/components/marketplace/listing-detail";
import { useUserListings } from "@/components/providers/user-listings-provider";
import { getListingById } from "@/lib/marketplace-utils";
import { Package } from "lucide-react";

export default function ListingDetailPage() {
  const params = useParams();
  const listingId = params.listingId as string;
  const { userListings } = useUserListings();
  const listing = getListingById(listingId, userListings);

  if (!listing) {
    return (
      <AppShell>
        <EmptyState
          icon={Package}
          title="Listing not found"
          description="This listing may have been removed or the link is incorrect."
          testId="listing-not-found"
          action={
            <Link href="/marketplace">
              <Button>Back to Marketplace</Button>
            </Link>
          }
        />
      </AppShell>
    );
  }

  return <ListingDetail listing={listing} />;
}
