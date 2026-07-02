"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ListingDetail } from "@/components/marketplace/listing-detail";
import { useAuth } from "@/components/providers/auth-provider";
import { useUserListings } from "@/components/providers/user-listings-provider";
import { getListingById } from "@/lib/marketplace-utils";
import { usesSupabaseMarketplace } from "@/lib/marketplace-mode";
import { getSupabaseListingById } from "@/lib/services/supabase-marketplace-service";
import type { Listing } from "@/lib/types";
import { Package } from "lucide-react";

export default function ListingDetailPage() {
  const params = useParams();
  const listingId = params.listingId as string;
  const { user } = useAuth();
  const { userListings } = useUserListings();
  const supabaseMode = usesSupabaseMarketplace();
  const [remoteListing, setRemoteListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(supabaseMode);
  const [checked, setChecked] = useState(!supabaseMode);

  useEffect(() => {
    if (!supabaseMode) return;

    let cancelled = false;

    void getSupabaseListingById(listingId, user?.id).then((result) => {
      if (cancelled) return;
      setRemoteListing(result.listing);
      setLoading(false);
      setChecked(true);
    });

    return () => {
      cancelled = true;
    };
  }, [listingId, supabaseMode, user?.id]);

  const localListing = getListingById(listingId, userListings);
  const listing = supabaseMode ? remoteListing : localListing;

  if (loading) {
    return (
      <AppShell>
        <LoadingSpinner className="min-h-[40vh]" label="Loading listing..." />
      </AppShell>
    );
  }

  if (!listing && checked) {
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

  if (!listing) return null;

  return <ListingDetail listing={listing} />;
}
