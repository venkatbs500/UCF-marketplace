import type { SellerReview } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";
import { MessageSquare } from "lucide-react";

interface SellerReviewsSectionProps {
  reviews: SellerReview[];
}

export function SellerReviewsSection({ reviews }: SellerReviewsSectionProps) {
  if (reviews.length === 0) {
    return (
      <EmptyState
        icon={MessageSquare}
        title="No reviews yet"
        description="This seller hasn't received reviews yet."
      />
    );
  }

  return (
    <section>
      <h2 className="mb-4 text-xl font-bold">Reviews ({reviews.length})</h2>
      <div className="space-y-3">
        {reviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="py-4">
              <div className="flex items-start gap-3">
                <Avatar initials={review.reviewerInitials} size="sm" />
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-sm">{review.reviewerName}</span>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-gold text-gold" />
                      ))}
                    </div>
                  </div>
                  {review.listingTitle && (
                    <p className="text-xs text-gold">Re: {review.listingTitle}</p>
                  )}
                  <p className="mt-1 text-sm text-muted">{review.comment}</p>
                  <p className="mt-2 text-xs text-muted">
                    {formatDate(review.createdAt)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
