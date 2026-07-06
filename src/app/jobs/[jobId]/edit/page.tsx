"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Briefcase } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { AuthGuard } from "@/components/auth/auth-guard";
import { SectionHeading } from "@/components/ui/section-heading";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { CampusJobForm } from "@/components/jobs/campus-job-form";
import { useAuth } from "@/components/providers/auth-provider";
import { usesSupabaseJobs } from "@/lib/jobs-mode";
import { getCampusJobById } from "@/lib/services/jobs-service";
import type { CampusJobRecord } from "@/lib/services/jobs-types";

function EditJobSupabaseForm({ jobId, userId }: { jobId: string; userId: string }) {
  const [job, setJob] = useState<CampusJobRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void getCampusJobById(jobId, userId).then((result) => {
      if (cancelled) return;
      setJob(result.job);
      setError(result.error ?? null);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [jobId, userId]);

  if (loading) {
    return (
      <AppShell>
        <LoadingSpinner className="min-h-[40vh]" label="Loading job..." />
      </AppShell>
    );
  }

  if (!job || job.postedBy !== userId) {
    return (
      <AppShell>
        <EmptyState
          icon={Briefcase}
          title="You can only edit your own job posts"
          description={error ?? "This job may not exist or is no longer available."}
          action={
            <Link href="/jobs">
              <Button>Back to jobs</Button>
            </Link>
          }
        />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <SectionHeading title="Edit job" subtitle={job.title} />
      <div className="mx-auto max-w-2xl">
        <CampusJobForm userId={userId} mode="edit" initialJob={job} />
      </div>
    </AppShell>
  );
}

function EditJobContent() {
  const params = useParams();
  const jobId = params.jobId as string;
  const { user } = useAuth();
  const supabaseMode = usesSupabaseJobs();

  if (!supabaseMode) {
    return (
      <AppShell>
        <EmptyState
          icon={Briefcase}
          title="Edit unavailable in demo mode"
          description="Job editing is enabled in Supabase real mode."
          action={
            <Link href="/jobs">
              <Button>Back to jobs</Button>
            </Link>
          }
        />
      </AppShell>
    );
  }

  if (!user?.id) return null;

  return <EditJobSupabaseForm jobId={jobId} userId={user.id} />;
}

export default function EditJobPage() {
  return (
    <AuthGuard>
      <EditJobContent />
    </AuthGuard>
  );
}
