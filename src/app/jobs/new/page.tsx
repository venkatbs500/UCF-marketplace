"use client";

import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { AuthGuard } from "@/components/auth/auth-guard";
import { SectionHeading } from "@/components/ui/section-heading";
import { Button } from "@/components/ui/button";
import { DemoModeBadge } from "@/components/ui/demo-mode-badge";
import { CampusJobForm } from "@/components/jobs/campus-job-form";
import { useAuth } from "@/components/providers/auth-provider";
import { usesSupabaseJobs } from "@/lib/jobs-mode";

function NewJobContent() {
  const { user } = useAuth();
  const supabaseMode = usesSupabaseJobs();

  if (!supabaseMode) {
    return (
      <AppShell>
        <SectionHeading
          title="Post a job"
          subtitle="Campus jobs save to Supabase in real product mode"
        />
        <DemoModeBadge />
        <div className="mt-6 rounded-2xl border border-gold/20 bg-gold/5 p-6 text-sm text-muted">
          Demo preview only. Switch to Supabase real mode to publish campus jobs.
        </div>
        <Link href="/jobs" className="mt-4 inline-block">
          <Button variant="secondary">Back to jobs</Button>
        </Link>
      </AppShell>
    );
  }

  if (!user?.id) return null;

  return (
    <AppShell>
      <SectionHeading
        title="Post a job"
        subtitle="Share a campus job, part-time role, research opening, or student gig"
      />
      <div className="mx-auto max-w-2xl">
        <CampusJobForm userId={user.id} mode="create" />
      </div>
    </AppShell>
  );
}

export default function NewJobPage() {
  return (
    <AuthGuard>
      <NewJobContent />
    </AuthGuard>
  );
}
