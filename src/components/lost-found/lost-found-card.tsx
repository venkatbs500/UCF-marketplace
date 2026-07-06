"use client";

import Link from "next/link";
import type { LostFoundItemRecord } from "@/lib/services/lost-found-types";
import { LOST_FOUND_CATEGORY_LABELS } from "@/lib/services/lost-found-types";
import { formatDate, formatRelativeTime, cn } from "@/lib/utils";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { MapPin, Calendar, AlertCircle, CheckCircle } from "lucide-react";

function isImageUrl(value: string): boolean {
  return value.startsWith("http://") || value.startsWith("https://");
}

interface LostFoundCardProps {
  item: LostFoundItemRecord;
  showOwnerBadge?: boolean;
}

export function LostFoundCard({ item, showOwnerBadge = false }: LostFoundCardProps) {
  const isLost = item.itemType === "lost";
  const image = item.images[0];
  const showImage = image && isImageUrl(image);

  return (
    <Card hover className="flex h-full flex-col" data-testid={`lost-found-card-${item.id}`}>
      <Link
        href={`/lost-found/${item.id}`}
        className="flex flex-1 flex-col"
        data-testid={`lost-found-detail-link-${item.id}`}
      >
        <div className="relative mb-3 flex h-32 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-white/5 to-white/10">
          {showImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-4xl opacity-30">{isLost ? "🔍" : "📦"}</span>
          )}
          {showOwnerBadge && (
            <Badge className="absolute left-3 top-3" variant="outline">
              Your post
            </Badge>
          )}
          <Badge
            variant={isLost ? "warning" : "success"}
            className="absolute right-3 top-3 text-[10px]"
          >
            {isLost ? (
              <>
                <AlertCircle className="mr-1 h-3 w-3" /> Lost
              </>
            ) : (
              <>
                <CheckCircle className="mr-1 h-3 w-3" /> Found
              </>
            )}
          </Badge>
        </div>
        <CardContent className="flex-1">
          <h3 className="mb-2 line-clamp-2 font-semibold">{item.title}</h3>
          <p className="mb-3 line-clamp-2 text-sm text-muted">{item.description}</p>
          <div className="mb-2 flex flex-wrap gap-3 text-xs text-muted">
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" /> {item.location || "Campus area"}
            </span>
            {item.itemDate && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" /> {formatDate(item.itemDate)}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-[10px]">
              {LOST_FOUND_CATEGORY_LABELS[item.category]}
            </Badge>
            {item.status !== "active" && (
              <Badge variant="secondary" className="text-[10px] capitalize">
                {item.status}
              </Badge>
            )}
          </div>
        </CardContent>
      </Link>
      <CardFooter className="justify-between border-t border-white/5 pt-3">
        <div className="flex items-center gap-2">
          <Avatar
            initials={item.poster.avatarInitials}
            size="sm"
            verified={item.poster.isVerifiedStudent}
          />
          <span className="text-xs">{item.poster.name}</span>
        </div>
        <span className={cn("text-xs text-muted")}>{formatRelativeTime(item.createdAt)}</span>
      </CardFooter>
    </Card>
  );
}
