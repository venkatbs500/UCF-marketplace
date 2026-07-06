"use client";

import Link from "next/link";
import type { StudentDiscountRecord } from "@/lib/services/discounts-types";
import {
  STUDENT_DISCOUNT_TYPE_LABELS,
} from "@/lib/services/discounts-types";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Calendar, Globe, MapPin, Tag } from "lucide-react";

interface DiscountCardProps {
  discount: StudentDiscountRecord;
  showOwnerBadge?: boolean;
}

export function DiscountCard({ discount, showOwnerBadge = false }: DiscountCardProps) {
  const locationLabel = discount.isOnline
    ? discount.location.trim()
      ? `Online · ${discount.location}`
      : "Online"
    : discount.location || "Near campus";

  return (
    <Card hover className="flex h-full flex-col" data-testid={`discount-card-${discount.id}`}>
      <Link
        href={`/discounts/${discount.id}`}
        className="flex flex-1 flex-col"
        data-testid={`discount-detail-link-${discount.id}`}
      >
        <CardContent className="flex-1">
          <div className="mb-2 flex items-start justify-between gap-2">
            <div>
              <h3 className="line-clamp-2 font-semibold">{discount.title}</h3>
              <p className="text-sm text-muted">{discount.businessName}</p>
            </div>
            {showOwnerBadge && (
              <Badge variant="outline" className="shrink-0">
                Your deal
              </Badge>
            )}
          </div>
          <div className="mb-3 flex items-center gap-2">
            <Tag className="h-4 w-4 shrink-0 text-gold" />
            <span className="text-lg font-bold text-gold">{discount.discountValue}</span>
          </div>
          <p className="mb-3 line-clamp-2 text-sm text-muted">{discount.description}</p>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
            <Badge variant="secondary">{STUDENT_DISCOUNT_TYPE_LABELS[discount.discountType]}</Badge>
            {discount.isOnline ? (
              <span className="flex items-center gap-1">
                <Globe className="h-3 w-3" /> Online
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {locationLabel}
              </span>
            )}
            {discount.expiresAt && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Expires {formatDate(discount.expiresAt.split("T")[0])}
              </span>
            )}
          </div>
          {discount.promoCode && (
            <div className="mt-3 rounded-xl bg-white/5 px-3 py-2">
              <code className="text-sm font-mono text-gold">{discount.promoCode}</code>
            </div>
          )}
          {discount.status !== "active" && (
            <Badge variant="outline" className="mt-2 text-[10px] capitalize">
              {discount.status}
            </Badge>
          )}
        </CardContent>
      </Link>
      <CardFooter className="justify-between border-t border-white/5 pt-3">
        <div className="flex items-center gap-2">
          <Avatar
            initials={discount.poster.avatarInitials}
            size="sm"
            verified={discount.poster.isVerifiedStudent}
          />
          <span className="text-xs">{discount.poster.name}</span>
        </div>
        <span className="text-xs text-muted">{formatRelativeTime(discount.createdAt)}</span>
      </CardFooter>
    </Card>
  );
}
