"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  ExternalLink,
  MapPin,
  Pencil,
  Shield,
  Trash2,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { SectionHeading } from "@/components/ui/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ReportDialog } from "@/components/safety/report-dialog";
import { MessageEventOrganizerButton } from "@/components/events/message-event-organizer-button";
import { useAuth } from "@/components/providers/auth-provider";
import {
  deleteCampusEvent,
  getCampusEventById,
  markCampusEventCancelled,
} from "@/lib/services/events-service";
import {
  CAMPUS_EVENT_TYPE_LABELS,
  formatEventTimeRange,
  type CampusEventRecord,
} from "@/lib/services/events-types";
import { formatDate, formatRelativeTime } from "@/lib/utils";

function isImageUrl(value: string): boolean {
  return value.startsWith("http://") || value.startsWith("https://");
}

export function CampusEventDetailView({ eventId }: { eventId: string }) {
  const router = useRouter();
  const { user } = useAuth();
  const [event, setEvent] = useState<CampusEventRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void getCampusEventById(eventId, user?.id).then((result) => {
      if (cancelled) return;
      setEvent(result.event);
      setError(result.error ?? null);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [eventId, user?.id]);

  const isOwner = Boolean(user?.id && event?.postedBy === user.id);

  const handleMarkCancelled = async () => {
    if (!user?.id || !event) return;
    const result = await markCampusEventCancelled(event.id, user.id);
    if (!result.success) {
      setActionError(result.error ?? "We could not update this event.");
      return;
    }
    router.push("/events");
  };

  const handleDelete = async () => {
    if (!user?.id || !event) return;
    const result = await deleteCampusEvent(event.id, user.id);
    if (!result.success) {
      setActionError(result.error ?? "We could not delete this event.");
      return;
    }
    router.push("/events");
  };

  if (loading) {
    return (
      <AppShell>
        <LoadingSpinner className="min-h-[40vh]" label="Loading event..." />
      </AppShell>
    );
  }

  if (!event) {
    return (
      <AppShell>
        <EmptyState
          icon={Calendar}
          title="Event not found"
          description={error ?? "This event may have been removed or is no longer available."}
          action={
            <Link href="/events">
              <Button>Back to events</Button>
            </Link>
          }
        />
      </AppShell>
    );
  }

  const images = event.images.filter(isImageUrl);

  return (
    <AppShell>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <SectionHeading title={event.title} subtitle="Campus event" />
        <Link href="/events">
          <Button variant="secondary" size="sm">
            Back to events
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="grid gap-3 sm:grid-cols-2">
            {images.length > 0 ? (
              images.map((image) => (
                <div
                  key={image}
                  className="overflow-hidden rounded-2xl border border-white/10 bg-white/5"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={image} alt="" className="h-48 w-full object-cover sm:h-56" />
                </div>
              ))
            ) : (
              <div className="flex h-48 items-center justify-center rounded-2xl border border-white/10 bg-gold/5 sm:col-span-2">
                <Calendar className="h-12 w-12 text-gold/40" />
              </div>
            )}
          </div>

          <Card data-testid="event-detail">
            <CardContent className="space-y-4 pt-6">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{CAMPUS_EVENT_TYPE_LABELS[event.eventType]}</Badge>
                {event.status !== "active" && (
                  <Badge variant="outline" className="capitalize">
                    {event.status}
                  </Badge>
                )}
                {isOwner && (
                  <Badge variant="outline" data-testid="event-owner-badge">
                    Your event
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-muted">
                {event.eventDate && (
                  <span className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {formatDate(event.eventDate)}
                  </span>
                )}
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {formatEventTimeRange(event)}
                </span>
                <span className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {event.location || "Campus location TBD"}
                </span>
              </div>

              {event.host && (
                <p className="text-sm text-muted">Hosted by {event.host}</p>
              )}

              <p className="whitespace-pre-wrap text-sm leading-relaxed">{event.description}</p>

              {event.externalUrl && (
                <div className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <a
                    href={event.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-gold hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open external event page
                  </a>
                  <p className="text-xs text-muted">
                    Knight Market cannot verify external event pages yet.
                  </p>
                </div>
              )}

              <div className="rounded-2xl border border-gold/20 bg-gold/5 p-4">
                <div className="flex items-start gap-3">
                  <Shield className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
                  <div className="space-y-1 text-sm text-muted">
                    <p className="font-medium text-foreground">Event safety</p>
                    <p>Meet in public campus spaces.</p>
                    <p>Be careful with off-platform links.</p>
                    <p>Report suspicious events.</p>
                  </div>
                </div>
              </div>

              <p className="text-xs text-muted">
                Posted {formatRelativeTime(event.createdAt)} · Updated{" "}
                {formatRelativeTime(event.updatedAt)}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="space-y-4 pt-6">
              <div className="flex items-center gap-3">
                <Avatar
                  initials={event.organizer.avatarInitials}
                  verified={event.organizer.isVerifiedStudent}
                />
                <div>
                  <p className="font-semibold">{event.organizer.name}</p>
                  <p className="text-xs text-muted">Verified student organizer</p>
                </div>
              </div>

              {isOwner ? (
                <div className="space-y-2">
                  <Link href={`/events/${event.id}/edit`}>
                    <Button variant="secondary" className="w-full">
                      <Pencil className="h-4 w-4" />
                      Edit event
                    </Button>
                  </Link>
                  {event.status === "active" && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => void handleMarkCancelled()}
                    >
                      Mark cancelled
                    </Button>
                  )}
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => setConfirmDelete(true)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete event
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <MessageEventOrganizerButton
                    eventId={event.id}
                    organizerId={event.postedBy}
                    eventTitle={event.title}
                    className="w-full"
                  />
                  <p className="text-xs text-muted">
                    Ask about timing, location, or how to participate. No private email is shown
                    here.
                  </p>
                  {user?.id && (
                    <ReportDialog
                      targetType="campus_event"
                      targetId={event.id}
                      buttonLabel="Report event"
                      variant="outline"
                      className="w-full"
                    />
                  )}
                </div>
              )}

              {actionError && (
                <p role="alert" className="text-xs text-red-400">
                  {actionError}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete event?"
        description="This cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        destructive
        onConfirm={() => {
          setConfirmDelete(false);
          void handleDelete();
        }}
        onCancel={() => setConfirmDelete(false)}
      />
    </AppShell>
  );
}
