import type { ListingDraft } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";
import { MARKETPLACE_CATEGORIES } from "@/lib/constants";

const CONDITION_LABELS: Record<string, string> = {
  new: "New",
  "like-new": "Like New",
  good: "Good",
  fair: "Fair",
  poor: "Poor",
};

interface ListingPreviewCardProps {
  draft: ListingDraft;
  sellerName?: string;
  sellerInitials?: string;
  previewImageUrls?: string[];
}

export function ListingPreviewCard({
  draft,
  sellerName = "You",
  sellerInitials = "YO",
  previewImageUrls,
}: ListingPreviewCardProps) {
  const category = MARKETPLACE_CATEGORIES.find((c) => c.id === draft.category);
  const image = previewImageUrls?.[0] ?? draft.images[0] ?? "📦";
  const price = draft.price === "" ? 0 : Number(draft.price);
  const isUrlImage = typeof image === "string" && image.startsWith("http");

  return (
    <Card className="max-w-md">
      <div className="flex h-40 items-center justify-center overflow-hidden rounded-t-2xl bg-gradient-to-br from-white/10 to-white/5 text-6xl">
        {isUrlImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="" className="h-full w-full object-cover" />
        ) : (
          image
        )}
      </div>
      <CardContent className="space-y-3 pt-4">
        <h3 className="font-semibold">{draft.title || "Untitled listing"}</h3>
        <p className="text-xl font-bold text-gold">
          {formatPrice(Number.isNaN(price) ? 0 : price)}
          {draft.isNegotiable && (
            <span className="ml-2 text-xs font-normal text-muted">Negotiable</span>
          )}
        </p>
        <div className="flex flex-wrap gap-2">
          {draft.condition && (
            <Badge variant="secondary">
              {CONDITION_LABELS[draft.condition]}
            </Badge>
          )}
          {category && <Badge variant="outline">{category.label}</Badge>}
        </div>
        {draft.location && (
          <p className="flex items-center gap-1 text-xs text-muted">
            <MapPin className="h-3 w-3" />
            {draft.location}
            {draft.campusArea && ` · ${draft.campusArea}`}
          </p>
        )}
        {draft.description && (
          <p className="line-clamp-3 text-sm text-muted">{draft.description}</p>
        )}
        {draft.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {draft.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2 border-t border-white/5 pt-3 text-xs text-muted">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold/10 font-semibold text-gold">
            {sellerInitials}
          </span>
          {sellerName}
        </div>
      </CardContent>
    </Card>
  );
}
