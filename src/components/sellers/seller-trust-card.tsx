import type { SellerProfile } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, ShoppingBag, Shield } from "lucide-react";

interface SellerTrustCardProps {
  seller: SellerProfile;
}

export function SellerTrustCard({ seller }: SellerTrustCardProps) {
  return (
    <Card>
      <CardContent className="space-y-4 pt-5">
        <div className="text-center">
          <p className="text-3xl font-bold text-gold">{seller.trustScore}</p>
          <p className="text-xs text-muted">Trust Score</p>
        </div>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2">
            <span className="flex items-center gap-2 text-muted">
              <Clock className="h-4 w-4 text-gold" />
              Response time
            </span>
            <span className="font-medium">{seller.responseTime}</span>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2">
            <span className="flex items-center gap-2 text-muted">
              <ShoppingBag className="h-4 w-4 text-gold" />
              Completed sales
            </span>
            <span className="font-medium">{seller.completedSales}</span>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2">
            <span className="flex items-center gap-2 text-muted">
              <Shield className="h-4 w-4 text-gold" />
              Verified
            </span>
            <span className="font-medium">{seller.verified ? "Yes" : "Pending"}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
