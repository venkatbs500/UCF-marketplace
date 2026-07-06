"use client";

import Link from "next/link";
import type { CampusEventRecord } from "@/lib/services/events-types";
import {
  CAMPUS_EVENT_TYPE_LABELS,
  formatEventTimeRange,
} from "@/lib/services/events-types";
import { formatDate, formatRelativeTime, cn } from "@/lib/utils";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Calendar, Clock, MapPin } from "lucide-react";

function isImageUrl(value: string): boolean {
  return value.startsWith("http://") || value.startsWith("https://");
}

interface EventCardProps {
  event: CampusEventRecord;
  showOwnerBadge?: boolean;
}

export function EventCard({ event, showOwnerBadge = false }: EventCardProps) {
  const image = event.images[0];
  const showImage = image && isImageUrl(image);

  return (
    <Card hover className="flex h-full flex-col" data-testid={`event-card-${event.id}`}>
      <Link
        href={`/events/${event.id}`}
        className="flex flex-1 flex-col"
        data-testid={`event-detail-link-${event.id}`}
      >
        <div className="relative mb-3 flex h-32 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-gold/10 to-transparent">
          {showImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt="" className="h-full w-full object-cover" />
          ) : (
            <Calendar className="h-10 w-10 text-gold/40" />
          )}
          {showOwnerBadge && (
            <Badge className="absolute left-3 top-3" variant="outline">
              Your event
            </Badge>
          )}
        </div>
        <CardContent className="flex-1">
          <div className="mb-2 flex items-start justify-between gap-2">
            <h3 className="line-clamp-2 font-semibold">{event.title}</h3>
            <Badge variant="secondary" className="shrink-0 text-[10px]">
              {CAMPUS_EVENT_TYPE_LABELS[event.eventType]}
            </Badge>
          </div>
          <p className="mb-3 line-clamp-2 text-sm text-muted">{event.description}</p>
          <div className="space-y-1.5 text-xs text-muted">
            {event.eventDate && (
              <div className="flex items-center gap-2">
                <Calendar className="h-3 w-3 text-gold" />
                {formatDate(event.eventDate)}
              </div>
            )}
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3 text-gold" />
              {formatEventTimeRange(event)}
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-3 w-3 text-gold" />
              {event.location || "Campus location TBD"}
            </div>
          </div>
          {event.host && (
            <p className="mt-2 text-xs text-muted">Hosted by {event.host}</p>
          )}
          {event.status !== "active" && (
            <Badge variant="outline" className="mt-2 text-[10px] capitalize">
              {event.status}
            </Badge>
          )}
        </CardContent>
      </Link>
      <CardFooter className="justify-between border-t border-white/5 pt-3">
        <div className="flex items-center gap-2">
          <Avatar
            initials={event.organizer.avatarInitials}
            size="sm"
            verified={event.organizer.isVerifiedStudent}
          />
          <span className="text-xs">{event.organizer.name}</span>
        </div>
        <span className={cn("text-xs text-muted")}>{formatRelativeTime(event.createdAt)}</span>
      </CardFooter>
    </Card>
  );
}
