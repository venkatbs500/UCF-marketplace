"use client";

import type { CampusEvent } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProtectedActionButton } from "@/components/auth/protected-action-button";
import { Calendar, MapPin, Users, Clock } from "lucide-react";

const typeLabels: Record<string, string> = {
  club: "Club Event",
  hackathon: "Hackathon",
  "career-fair": "Career Fair",
  sports: "Sports",
  social: "Social",
};

interface EventCardProps {
  event: CampusEvent;
}

export function EventCard({ event }: EventCardProps) {
  return (
    <Card hover>
      <div className="mb-3 flex h-28 items-center justify-center rounded-xl bg-gradient-to-br from-gold/10 to-transparent">
        <Calendar className="h-10 w-10 text-gold/40" />
      </div>
      <CardContent>
        <div className="mb-2 flex items-start justify-between gap-2">
          <h3 className="font-semibold">{event.title}</h3>
          <Badge variant="secondary">{typeLabels[event.type]}</Badge>
        </div>
        <p className="mb-3 line-clamp-2 text-sm text-muted">{event.description}</p>
        <div className="space-y-1.5 text-xs text-muted">
          <div className="flex items-center gap-2">
            <Calendar className="h-3 w-3 text-gold" />
            {formatDate(event.date)}
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3 text-gold" />
            {event.time}
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-3 w-3 text-gold" />
            {event.location}
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-3 w-3 text-gold" />
            {event.attendeeCount}
            {event.maxAttendees ? ` / ${event.maxAttendees}` : ""} attending
          </div>
        </div>
        <p className="mt-2 text-xs text-muted">Hosted by {event.host}</p>
      </CardContent>
      <CardFooter className="border-t border-white/5 pt-3">
        <ProtectedActionButton size="sm" className="w-full" unlockedLabel="Ready">
          RSVP
        </ProtectedActionButton>
      </CardFooter>
    </Card>
  );
}
