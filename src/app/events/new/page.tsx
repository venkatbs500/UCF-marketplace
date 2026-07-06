"use client";

import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { AuthGuard } from "@/components/auth/auth-guard";
import { SectionHeading } from "@/components/ui/section-heading";
import { Button } from "@/components/ui/button";
import { DemoModeBadge } from "@/components/ui/demo-mode-badge";
import { CampusEventForm } from "@/components/events/campus-event-form";
import { useAuth } from "@/components/providers/auth-provider";
import { usesSupabaseEvents } from "@/lib/events-mode";

function NewEventContent() {
  const { user } = useAuth();
  const supabaseMode = usesSupabaseEvents();

  if (!supabaseMode) {
    return (
      <AppShell>
        <SectionHeading
          title="Post an event"
          subtitle="Campus events save to Supabase in real product mode"
        />
        <DemoModeBadge />
        <div className="mt-6 rounded-2xl border border-gold/20 bg-gold/5 p-6 text-sm text-muted">
          Demo preview only. Switch to Supabase real mode to publish campus events.
        </div>
        <Link href="/events" className="mt-4 inline-block">
          <Button variant="secondary">Back to events</Button>
        </Link>
      </AppShell>
    );
  }

  if (!user?.id) return null;

  return (
    <AppShell>
      <SectionHeading
        title="Post an event"
        subtitle="Share a club meeting, study session, career event, or campus hangout"
      />
      <div className="mx-auto max-w-2xl">
        <CampusEventForm userId={user.id} mode="create" />
      </div>
    </AppShell>
  );
}

export default function NewEventPage() {
  return (
    <AuthGuard>
      <NewEventContent />
    </AuthGuard>
  );
}
