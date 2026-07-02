import type { Listing } from "@/lib/types";
import { formatDate, formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { MapPin, Eye, Heart, Calendar, Tag } from "lucide-react";
import { SaveListingButton } from "./save-listing-button";

const CONDITION_LABELS: Record<string, string> = {
  new: "New",
  "like-new": "Like New",
  good: "Good",
  fair: "Fair",
  poor: "Poor",
};

interface ListingInfoPanelProps {
  listing: Listing;
}

export function ListingInfoPanel({ listing }: ListingInfoPanelProps) {
  return (
    <div className="space-y-4" data-testid="listing-detail">
      <div className="flex items-start justify-between gap-4">
        <div>
          {listing.isFeatured && (
            <Badge variant="default" className="mb-2">
              Featured
            </Badge>
          )}
          <h1 className="text-2xl font-bold md:text-3xl">{listing.title}</h1>
        </div>
        <SaveListingButton listingId={listing.id} size="md" showLabel />
      </div>

      <p className="text-3xl font-bold text-gold">
        {formatPrice(listing.price)}
        {listing.isNegotiable && (
          <span className="ml-2 text-sm font-normal text-muted">Negotiable</span>
        )}
      </p>

      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary">{CONDITION_LABELS[listing.condition]}</Badge>
        <Badge variant="outline">{listing.category}</Badge>
        {listing.status !== "active" && (
          <Badge variant="warning">{listing.status}</Badge>
        )}
      </div>

      <div className="grid gap-2 text-sm text-muted sm:grid-cols-2">
        <span className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-gold" />
          {listing.location} · {listing.campusArea}
        </span>
        <span className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gold" />
          Posted {formatDate(listing.postedAt)}
        </span>
        <span className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-gold" />
          {listing.views} views
        </span>
        <span className="flex items-center gap-2">
          <Heart className="h-4 w-4 text-gold" />
          {listing.savedCount} saves
        </span>
      </div>

      <div>
        <h2 className="mb-2 font-semibold">Description</h2>
        <p className="text-sm leading-relaxed text-muted">{listing.description}</p>
      </div>

      {listing.tags.length > 0 && (
        <div>
          <h2 className="mb-2 flex items-center gap-2 font-semibold">
            <Tag className="h-4 w-4 text-gold" />
            Tags
          </h2>
          <div className="flex flex-wrap gap-2">
            {listing.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {listing.pickupOptions.length > 0 && (
        <div>
          <h2 className="mb-2 font-semibold">Pickup Options</h2>
          <ul className="space-y-1 text-sm text-muted">
            {listing.pickupOptions.map((opt) => (
              <li key={opt}>• {opt}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
