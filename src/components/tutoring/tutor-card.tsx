"use client";

import Link from "next/link";
import type { TutorProfileItem } from "@/lib/services/tutoring-types";
import { TUTORING_FORMAT_LABELS } from "@/lib/services/tutoring-types";
import { formatPrice } from "@/lib/utils";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Clock, Star } from "lucide-react";

interface TutorCardProps {
  profile: TutorProfileItem;
  showOwnerBadge?: boolean;
  showDemoRatings?: boolean;
}

export function TutorCard({
  profile,
  showOwnerBadge = false,
  showDemoRatings = false,
}: TutorCardProps) {
  const showRating = showDemoRatings
    ? profile.reviewCount > 0
    : profile.reviewCount > 0 && profile.rating > 0;

  return (
    <Card hover className="flex h-full flex-col" data-testid={`tutor-card-${profile.id}`}>
      <Link
        href={`/tutoring/${profile.id}`}
        className="flex flex-1 flex-col"
        data-testid={`tutor-detail-link-${profile.id}`}
      >
        <CardContent className="flex-1">
          <div className="mb-4 flex items-center gap-3">
            <Avatar
              initials={profile.tutor.avatarInitials}
              size="lg"
              verified={profile.tutor.isVerifiedStudent}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-start gap-2">
                <h3 className="line-clamp-2 font-semibold">{profile.displayName}</h3>
                {showOwnerBadge && (
                  <Badge variant="outline" className="shrink-0 text-[10px]">
                    Your profile
                  </Badge>
                )}
              </div>
              {(profile.tutor.major || profile.tutor.year) && (
                <p className="text-xs text-muted">
                  {[profile.tutor.major, profile.tutor.year].filter(Boolean).join(" · ")}
                </p>
              )}
              {showRating && (
                <div className="mt-1 flex items-center gap-1 text-xs">
                  <Star className="h-3 w-3 fill-gold text-gold" />
                  <span className="font-medium">{profile.rating.toFixed(1)}</span>
                  <span className="text-muted">({profile.reviewCount} reviews)</span>
                </div>
              )}
            </div>
          </div>

          <p className="mb-3 line-clamp-3 text-sm text-muted">{profile.bio}</p>

          <div className="mb-3 flex flex-wrap gap-1">
            {profile.subjects.slice(0, 4).map((subject) => (
              <Badge key={subject} variant="default">
                {subject}
              </Badge>
            ))}
          </div>

          <div className="mb-2 flex flex-wrap gap-2 text-xs text-muted">
            <Badge variant="secondary" className="text-[10px]">
              {TUTORING_FORMAT_LABELS[profile.tutoringFormat]}
            </Badge>
            {profile.availability.length > 0 && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {profile.availability.slice(0, 2).join(" · ")}
              </span>
            )}
          </div>

          <p className="text-lg font-bold text-gold">
            {profile.hourlyRate != null ? `${formatPrice(profile.hourlyRate)}/hr` : "Rate TBD"}
          </p>
        </CardContent>
      </Link>
      <CardFooter className="border-t border-white/5 pt-3 text-xs text-muted">
        Verified student tutor
      </CardFooter>
    </Card>
  );
}
