import type { StudentDiscount } from "@/lib/types";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Tag, Shield, Copy } from "lucide-react";

interface DiscountCardProps {
  discount: StudentDiscount;
}

export function DiscountCard({ discount }: DiscountCardProps) {
  return (
    <Card hover>
      <CardContent>
        <div className="mb-2 flex items-start justify-between gap-2">
          <h3 className="font-semibold">{discount.businessName}</h3>
          {discount.verified && (
            <Badge variant="success">
              <Shield className="mr-1 h-3 w-3" />
              Verified
            </Badge>
          )}
        </div>
        <p className="mb-3 text-sm text-muted">{discount.description}</p>
        <div className="mb-3 flex items-center gap-2">
          <Tag className="h-4 w-4 text-gold" />
          <span className="text-lg font-bold text-gold">{discount.discount}</span>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-muted">
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" /> {discount.location}
          </span>
          <Badge variant="secondary">{discount.category}</Badge>
        </div>
        {discount.code && (
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2">
            <code className="text-sm font-mono text-gold">{discount.code}</code>
            <Copy className="h-3.5 w-3.5 text-muted cursor-pointer hover:text-gold" />
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t border-white/5 pt-3">
        <Button size="sm" className="w-full">
          Redeem Deal
        </Button>
      </CardFooter>
    </Card>
  );
}
