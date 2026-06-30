import Link from "next/link";
import type { Listing } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Star, ChevronRight } from "lucide-react";

interface SellerSummaryCardProps {
  listing: Listing;
}

export function SellerSummaryCard({ listing }: SellerSummaryCardProps) {
  return (
    <Card>
      <CardContent className="pt-5">
        <div className="mb-4 flex items-center gap-3">
          <Avatar initials={listing.sellerAvatarInitials} size="lg" verified />
          <div className="flex-1">
            <p className="font-semibold">{listing.sellerName}</p>
            <p className="text-xs text-muted">
              {listing.sellerMajor} · {listing.sellerYear}
            </p>
            <div className="mt-1 flex items-center gap-1 text-xs">
              <Star className="h-3 w-3 fill-gold text-gold" />
              <span className="font-medium">{listing.sellerRating}</span>
            </div>
          </div>
        </div>
        <Link
          href={`/sellers/${listing.sellerId}`}
          className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2 text-sm text-gold hover:bg-white/10"
        >
          View seller profile
          <ChevronRight className="h-4 w-4" />
        </Link>
      </CardContent>
    </Card>
  );
}
