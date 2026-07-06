"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Calendar } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { AuthGuard } from "@/components/auth/auth-guard";
import { SectionHeading } from "@/components/ui/section-heading";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { CampusEventForm } from "@/components/events/campus-event-form";
import { useAuth } from "@/components/providers/auth-provider";
import { usesSupabaseEvents } from "@/lib/events-mode";
import { getCampusEventById } from "@/lib/services/events-service";
import type { CampusEventRecord } from "@/lib/services/events-types";

function EditEventSupabaseForm({ eventId, userId }: { eventId: string; userId: string }) {
  const [event, setEvent] = useState<CampusEventRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void getCampusEventById(eventId, userId).then((result) => {
      if (cancelled) return;
      setEvent(result.event);
      setError(result.error ?? null);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [eventId, userId]);

  if (loading) {
    return (
      <AppShell>
        <LoadingSpinner className="min-h-[40vh]" label="Loading event..." />
      </AppShell>
    );
  }

  if (!event || event.postedBy !== userId) {
    return (
      <AppShell>
        <EmptyState
          icon={Calendar}
          title="You can only edit your own events"
          description={error ?? "This event may not exist or is no longer available."}
          action={
            <Link href="/events">
              <Button>Back to events</Button>
            </Link>
          }
        />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <SectionHeading title="Edit event" subtitle={event.title} />
      <div className="mx-auto max-w-2xl">
        <CampusEventForm userId={userId} mode="edit" initialEvent={event} />
      </div>
    </AppShell>
  );
}

function EditEventContent() {
  const params = useParams();
  const eventId = params.eventId as string;
  const { user } = useAuth();
  const supabaseMode = usesSupabaseEvents();

  if (!supabaseMode) {
    return (
      <AppShell>
        <EmptyState
          icon={Calendar}
          title="Edit unavailable in demo mode"
          description="Event editing is enabled in Supabase real mode."
          action={
            <Link href="/events">
              <Button>Back to events</Button>
            </Link>
          }
        />
      </AppShell>
    );
  }

  if (!user?.id) return null;

  return <EditEventSupabaseForm eventId={eventId} userId={user.id} />;
}

export default function EditEventPage() {
  return (
    <AuthGuard>
      <EditEventContent />
    </AuthGuard>
  );
}
