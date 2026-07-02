"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowRight, Package } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { Button } from "@/components/ui/button";
import { DemoModeBadge } from "@/components/ui/demo-mode-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ListingCard } from "@/components/marketplace/listing-card";
import { useUserListings } from "@/components/providers/user-listings-provider";
import { listings } from "@/lib/mock-data";
import { getBrowseListings } from "@/lib/marketplace-utils";
import { isDemoDataEnabled } from "@/lib/product-mode";

export function ProductPreviewGrid() {
  const demoEnabled = isDemoDataEnabled();
  const { userListings } = useUserListings();

  const realListings = useMemo(
    () => getBrowseListings(userListings, { includeDemo: false }),
    [userListings]
  );

  if (!demoEnabled) {
    return (
      <section>
        <div className="mb-4 space-y-2">
          <SectionHeading
            title="Student Marketplace"
            subtitle="Buy and sell with verified UCF students"
          />
        </div>
        {realListings.length > 0 ? (
          <>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-muted">
                {realListings.length} student listing
                {realListings.length !== 1 ? "s" : ""} live on Knight Market
              </p>
              <Link
                href="/marketplace"
                className="flex items-center gap-1 text-sm font-medium text-gold hover:underline"
              >
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {realListings.slice(0, 4).map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          </>
        ) : (
          <EmptyState
            icon={Package}
            title="Be the first to post"
            description="Verified students will power the marketplace. Post the first real listing to get started."
            action={
              <Link href="/sell">
                <Button>Post a listing</Button>
              </Link>
            }
          />
        )}
      </section>
    );
  }

  const featured = listings.filter((l) => l.isFeatured).slice(0, 4);

  return (
    <section>
      <div className="mb-4 space-y-2">
        <SectionHeading
          title="Trending on Campus"
          subtitle="What students are buying and selling right now"
          action={
            <Link
              href="/marketplace"
              className="flex items-center gap-1 text-sm font-medium text-gold hover:underline"
            >
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />
        <DemoModeBadge />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {featured.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </section>
  );
}
