import type { ApartmentReview } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Star, ThumbsUp, ThumbsDown } from "lucide-react";

interface ApartmentReviewCardProps {
  review: ApartmentReview;
}

export function ApartmentReviewCard({ review }: ApartmentReviewCardProps) {
  return (
    <Card>
      <CardContent>
        <div className="mb-3 flex items-start justify-between">
          <div>
            <h3 className="font-semibold">{review.apartmentName}</h3>
            <p className="text-xs text-muted">{review.location}</p>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-gold text-gold" />
            <span className="font-bold">{review.rating}</span>
          </div>
        </div>
        <p className="mb-3 text-sm text-muted">{review.review}</p>
        <div className="mb-3 grid grid-cols-2 gap-3">
          <div>
            <p className="mb-1 flex items-center gap-1 text-xs font-medium text-green-400">
              <ThumbsUp className="h-3 w-3" /> Pros
            </p>
            <div className="flex flex-wrap gap-1">
              {review.pros.map((p) => (
                <Badge key={p} variant="success">
                  {p}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-1 flex items-center gap-1 text-xs font-medium text-red-400">
              <ThumbsDown className="h-3 w-3" /> Cons
            </p>
            <div className="flex flex-wrap gap-1">
              {review.cons.map((c) => (
                <Badge key={c} variant="destructive">
                  {c}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-white/5 pt-3">
          <div className="flex items-center gap-2">
            <Avatar initials={review.reviewer.avatar} size="sm" />
            <span className="text-xs">{review.reviewer.name}</span>
          </div>
          <span className="text-xs text-gold">
            Rent: {formatPrice(review.rent)}/mo
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
