"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import type { Listing } from "@/lib/types";
import { ListingGallery } from "./listing-gallery";
import { ListingInfoPanel } from "./listing-info-panel";
import { SellerSummaryCard } from "./seller-summary-card";
import { ContactSellerPanel } from "./contact-seller-panel";
import { ListingOwnerActions } from "./listing-owner-actions";
import { SafetyTipsCard } from "./safety-tips-card";
import { RelatedListings } from "./related-listings";
import { useAuth } from "@/components/providers/auth-provider";
import { canUserDeleteListing } from "@/lib/marketplace-utils";

interface ListingDetailProps {
  listing: Listing;
}

export function ListingDetail({ listing }: ListingDetailProps) {
  const { user } = useAuth();
  const isOwner = canUserDeleteListing(listing, user?.id);

  return (
    <AppShell>
      <div className="mb-6">
        <Link href="/marketplace">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
            Back to Marketplace
          </Button>
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <ListingGallery listing={listing} />
          <ListingInfoPanel listing={listing} />
          <RelatedListings listing={listing} />
        </div>
        <div className="space-y-4">
          {isOwner ? (
            <ListingOwnerActions listing={listing} variant="detail" />
          ) : (
            <>
              <SellerSummaryCard listing={listing} />
              <ContactSellerPanel listing={listing} />
            </>
          )}
          <SafetyTipsCard />
        </div>
      </div>
    </AppShell>
  );
}
