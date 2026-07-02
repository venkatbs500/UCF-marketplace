"use client";

import type { HousingPost } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { ComingSoonAction } from "@/components/ui/coming-soon-action";
import { COMING_SOON_MESSAGES } from "@/lib/coming-soon-messages";
import { Bed, Bath, MapPin, Calendar } from "lucide-react";

interface HousingCardProps {
  post: HousingPost;
}

export function HousingCard({ post }: HousingCardProps) {
  return (
    <Card hover>
      <div className="mb-3 flex h-32 items-center justify-center rounded-xl bg-gradient-to-br from-white/5 to-white/10">
        <span className="text-4xl opacity-30">🏠</span>
      </div>
      <CardContent>
        <h3 className="mb-1 font-semibold">{post.title}</h3>
        <p className="mb-2 text-lg font-bold text-gold">
          {formatPrice(post.price)}/mo
        </p>
        <div className="mb-3 flex flex-wrap gap-2 text-xs text-muted">
          <span className="flex items-center gap-1">
            <Bed className="h-3 w-3" /> {post.bedrooms} bed
          </span>
          <span className="flex items-center gap-1">
            <Bath className="h-3 w-3" /> {post.bathrooms} bath
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" /> {post.location}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" /> {post.availableFrom}
          </span>
        </div>
        <div className="flex flex-wrap gap-1">
          {post.amenities.slice(0, 3).map((a) => (
            <Badge key={a} variant="secondary">
              {a}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="justify-between border-t border-white/5 pt-3">
        <div className="flex items-center gap-2">
          <Avatar initials={post.poster.avatar} size="sm" verified={post.poster.verified} />
          <span className="text-xs">{post.poster.name}</span>
        </div>
        <ComingSoonAction
          size="sm"
          variant="outline"
          comingSoonMessage={COMING_SOON_MESSAGES.contactHousing}
        >
          Contact
        </ComingSoonAction>
      </CardFooter>
    </Card>
  );
}
