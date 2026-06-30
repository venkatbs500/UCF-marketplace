"use client";

import type { SellerProfile } from "@/lib/types";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Shield, Star, MapPin, Calendar } from "lucide-react";

interface SellerProfileHeaderProps {
  seller: SellerProfile;
}

export function SellerProfileHeader({ seller }: SellerProfileHeaderProps) {
  return (
    <div className="rounded-3xl glass-card p-6 md:p-8">
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <Avatar initials={seller.avatarInitials} size="lg" verified={seller.verified} />
        <div className="flex-1 text-center sm:text-left">
          <div className="mb-1 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <h1 className="text-2xl font-bold">{seller.name}</h1>
            {seller.verified && (
              <Badge variant="success">
                <Shield className="mr-1 h-3 w-3" />
                Verified Student
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted">
            {seller.major} · {seller.year}
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-2 sm:justify-start">
            <Badge variant="outline" className="gap-1">
              <MapPin className="h-3 w-3" />
              {seller.campusArea}
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Calendar className="h-3 w-3" />
              Joined {formatDate(seller.joinedAt)}
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Star className="h-3 w-3 fill-gold text-gold" />
              {seller.rating} ({seller.reviewCount})
            </Badge>
          </div>
          {seller.badges.length > 0 && (
            <div className="mt-3 flex flex-wrap justify-center gap-1.5 sm:justify-start">
              {seller.badges.map((badge) => (
                <Badge key={badge} variant="default">
                  {badge}
                </Badge>
              ))}
            </div>
          )}
          <p className="mt-3 text-sm text-muted">{seller.bio}</p>
        </div>
      </div>
    </div>
  );
}
