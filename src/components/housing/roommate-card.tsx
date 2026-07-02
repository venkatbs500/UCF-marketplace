"use client";

import type { RoommateProfile } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { ComingSoonAction } from "@/components/ui/coming-soon-action";
import { COMING_SOON_MESSAGES } from "@/lib/coming-soon-messages";
import { MapPin, Calendar, Sparkles } from "lucide-react";

interface RoommateCardProps {
  profile: RoommateProfile;
}

export function RoommateCard({ profile }: RoommateCardProps) {
  return (
    <Card hover>
      <CardContent>
        <div className="mb-4 flex items-center gap-3">
          <Avatar
            initials={profile.user.avatar}
            size="lg"
            verified={profile.user.verified}
          />
          <div>
            <h3 className="font-semibold">{profile.user.name}</h3>
            <p className="text-xs text-muted">
              {profile.user.major} · {profile.user.year}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-1 rounded-xl bg-gold/10 px-2 py-1">
            <Sparkles className="h-3 w-3 text-gold" />
            <span className="text-xs font-bold text-gold">
              {profile.compatibility}%
            </span>
          </div>
        </div>
        <p className="mb-3 text-sm text-muted">{profile.bio}</p>
        <div className="mb-3 flex flex-wrap gap-2 text-xs text-muted">
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" /> {profile.preferredLocation}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" /> Move-in: {profile.moveInDate}
          </span>
        </div>
        <p className="mb-3 text-sm font-medium text-gold">
          Budget: {formatPrice(profile.budget)}/mo
        </p>
        <div className="flex flex-wrap gap-1">
          {profile.lifestyle.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="border-t border-white/5 pt-3">
        <ComingSoonAction
          size="sm"
          className="w-full"
          comingSoonMessage={COMING_SOON_MESSAGES.contactRoommate}
        >
          Connect
        </ComingSoonAction>
      </CardFooter>
    </Card>
  );
}
