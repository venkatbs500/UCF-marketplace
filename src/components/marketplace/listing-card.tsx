"use client";

import Link from "next/link";
import type { Listing } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { ComingSoonAction } from "@/components/ui/coming-soon-action";
import { COMING_SOON_MESSAGES } from "@/lib/coming-soon-messages";
import { SaveListingButton } from "./save-listing-button";
import { ListingOwnerActions } from "./listing-owner-actions";
import { useAuth } from "@/components/providers/auth-provider";
import { canUserDeleteListing } from "@/lib/marketplace-utils";
import { MapPin, MessageCircle, Star } from "lucide-react";

const conditionLabels: Record<string, string> = {
  new: "New",
  "like-new": "Like New",
  good: "Good",
  fair: "Fair",
  poor: "Poor",
};

interface ListingCardProps {
  listing: Listing;
  ownerActionVariant?: "card" | "profile";
}

export function ListingCard({
  listing,
  ownerActionVariant = "card",
}: ListingCardProps) {
  const { user } = useAuth();
  const image = listing.images[0] ?? "📦";
  const isOwner = canUserDeleteListing(listing, user?.id);
  const detailHref = `/marketplace/${listing.id}`;

  return (
    <Card
      hover
      className="relative flex h-full flex-col"
      data-testid={`listing-card-${listing.id}`}
    >
      <Link
        href={detailHref}
        data-testid={`listing-detail-link-${listing.id}`}
        className="absolute inset-0 z-0 rounded-[inherit] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        aria-label={`View listing: ${listing.title}`}
      />

      <div className="pointer-events-none relative z-[1] flex flex-1 flex-col">
        <div className="relative mb-3 flex h-36 items-center justify-center rounded-xl bg-gradient-to-br from-white/5 to-white/10 text-5xl">
          {image}
          {isOwner && (
            <Badge className="absolute top-3 left-3" variant="outline">
              Your listing
            </Badge>
          )}
          {listing.isFeatured && (
            <Badge className="absolute top-3 right-3" variant="default">
              Featured
            </Badge>
          )}
          {isOwner && (
            <div
              className="pointer-events-auto absolute bottom-3 right-3"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
              }}
            >
              <ListingOwnerActions
                listing={listing}
                variant={ownerActionVariant}
              />
            </div>
          )}
        </div>

        <CardContent className="flex-1">
          <div className="mb-2 flex items-start justify-between gap-2">
            <h3 className="line-clamp-2 flex-1 text-sm font-semibold">
              {listing.title}
            </h3>
            {!isOwner && (
              <div className="pointer-events-auto shrink-0">
                <SaveListingButton listingId={listing.id} />
              </div>
            )}
          </div>
          <p className="mb-2 text-lg font-bold text-gold">
            {formatPrice(listing.price)}
          </p>
          <div className="mb-2 flex flex-wrap gap-1.5">
            <Badge variant="secondary">{conditionLabels[listing.condition]}</Badge>
            <Badge variant="outline">{listing.category}</Badge>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted">
            <MapPin className="h-3 w-3" />
            {listing.location}
          </div>
        </CardContent>
      </div>

      {!isOwner && (
        <CardFooter
          className="pointer-events-auto relative z-10 flex-col items-stretch gap-2 border-t border-white/5 pt-3"
          onClick={(event) => {
            event.stopPropagation();
          }}
        >
          <div className="flex items-center gap-2">
            <Avatar initials={listing.sellerAvatarInitials} size="sm" verified />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium">{listing.sellerName}</p>
              <div className="flex items-center gap-1 text-xs text-muted">
                <Star className="h-3 w-3 fill-gold text-gold" />
                {listing.sellerRating}
              </div>
            </div>
          </div>
          <ComingSoonAction
            variant="secondary"
            size="sm"
            className="w-full"
            comingSoonMessage={COMING_SOON_MESSAGES.messageSeller}
          >
            <MessageCircle className="h-3.5 w-3.5" />
            Message Seller
          </ComingSoonAction>
        </CardFooter>
      )}
    </Card>
  );
}
