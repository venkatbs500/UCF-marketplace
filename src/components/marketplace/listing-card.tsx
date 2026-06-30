"use client";

import Link from "next/link";
import type { Listing } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { ProtectedActionButton } from "@/components/auth/protected-action-button";
import { SaveListingButton } from "./save-listing-button";
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
}

export function ListingCard({ listing }: ListingCardProps) {
  const image = listing.images[0] ?? "📦";

  return (
    <Link href={`/marketplace/${listing.id}`} className="block">
      <Card hover className="flex h-full flex-col">
        <div className="relative mb-3 flex h-36 items-center justify-center rounded-xl bg-gradient-to-br from-white/5 to-white/10 text-5xl">
          {image}
          {listing.isFeatured && (
            <Badge className="absolute top-3 right-3" variant="default">
              Featured
            </Badge>
          )}
        </div>
        <CardContent className="flex-1">
          <div className="mb-2 flex items-start justify-between gap-2">
            <h3 className="line-clamp-2 text-sm font-semibold">{listing.title}</h3>
            <SaveListingButton listingId={listing.id} />
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
        <CardFooter
          className="flex-col items-stretch gap-2 border-t border-white/5 pt-3"
          onClick={(e) => e.preventDefault()}
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
          <ProtectedActionButton
            variant="secondary"
            size="sm"
            className="w-full"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            Message Seller
          </ProtectedActionButton>
        </CardFooter>
      </Card>
    </Link>
  );
}
