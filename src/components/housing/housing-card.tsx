"use client";

import Link from "next/link";
import type { HousingPostItem } from "@/lib/services/housing-types";
import { HOUSING_TYPE_LABELS } from "@/lib/services/housing-types";
import { formatPrice, formatRelativeTime, cn } from "@/lib/utils";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Bed, Bath, MapPin, Calendar } from "lucide-react";

function isImageUrl(value: string): boolean {
  return value.startsWith("http://") || value.startsWith("https://");
}

interface HousingCardProps {
  post: HousingPostItem;
  showOwnerBadge?: boolean;
}

export function HousingCard({ post, showOwnerBadge = false }: HousingCardProps) {
  const image = post.images[0];
  const showImage = image && isImageUrl(image);

  return (
    <Card hover className="flex h-full flex-col" data-testid={`housing-card-${post.id}`}>
      <Link
        href={`/housing/${post.id}`}
        className="flex flex-1 flex-col"
        data-testid={`housing-detail-link-${post.id}`}
      >
        <div className="relative mb-3 flex h-32 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-white/5 to-white/10">
          {showImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-4xl opacity-30">🏠</span>
          )}
          {showOwnerBadge && (
            <Badge className="absolute left-3 top-3" variant="outline">
              Your post
            </Badge>
          )}
        </div>
        <CardContent className="flex-1">
          <div className="mb-1 flex items-start justify-between gap-2">
            <h3 className="line-clamp-2 font-semibold">{post.title}</h3>
            <Badge variant="secondary" className="shrink-0 text-[10px]">
              {HOUSING_TYPE_LABELS[post.type]}
            </Badge>
          </div>
          <p className="mb-2 text-lg font-bold text-gold">
            {post.rent != null ? `${formatPrice(post.rent)}/mo` : "Rent TBD"}
          </p>
          <div className="mb-3 flex flex-wrap gap-2 text-xs text-muted">
            {post.bedrooms != null && (
              <span className="flex items-center gap-1">
                <Bed className="h-3 w-3" /> {post.bedrooms} bed
              </span>
            )}
            {post.bathrooms != null && (
              <span className="flex items-center gap-1">
                <Bath className="h-3 w-3" /> {post.bathrooms} bath
              </span>
            )}
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" /> {post.location}
            </span>
            {post.moveInDate && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" /> {post.moveInDate}
              </span>
            )}
          </div>
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {post.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-[10px]">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Link>
      <CardFooter className="justify-between border-t border-white/5 pt-3">
        <div className="flex items-center gap-2">
          <Avatar
            initials={post.poster.avatarInitials}
            size="sm"
            verified={post.poster.isVerifiedStudent}
          />
          <span className="text-xs">{post.poster.name}</span>
        </div>
        <span className={cn("text-xs text-muted")}>{formatRelativeTime(post.createdAt)}</span>
      </CardFooter>
    </Card>
  );
}
