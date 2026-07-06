"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Briefcase, Clock, DollarSign, ExternalLink, MapPin, Pencil, Shield, Trash2 } from "lucide-react";
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
import { MessageJobPosterButton } from "@/components/jobs/message-job-poster-button";
import { useAuth } from "@/components/providers/auth-provider";
import {
  deleteCampusJob,
  getCampusJobById,
  markCampusJobClosed,
} from "@/lib/services/jobs-service";
import { CAMPUS_JOB_TYPE_LABELS, type CampusJobRecord } from "@/lib/services/jobs-types";
import { formatRelativeTime } from "@/lib/utils";

export function CampusJobDetailView({ jobId }: { jobId: string }) {
  const router = useRouter();
  const { user } = useAuth();
  const [job, setJob] = useState<CampusJobRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void getCampusJobById(jobId, user?.id).then((result) => {
      if (cancelled) return;
      setJob(result.job);
      setError(result.error ?? null);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [jobId, user?.id]);

  const isOwner = Boolean(user?.id && job?.postedBy === user.id);

  const handleMarkClosed = async () => {
    if (!user?.id || !job) return;
    const result = await markCampusJobClosed(job.id, user.id);
    if (!result.success) {
      setActionError(result.error ?? "We could not update this job.");
      return;
    }
    router.push("/jobs");
  };

  const handleDelete = async () => {
    if (!user?.id || !job) return;
    const result = await deleteCampusJob(job.id, user.id);
    if (!result.success) {
      setActionError(result.error ?? "We could not delete this job.");
      return;
    }
    router.push("/jobs");
  };

  if (loading) {
    return (
      <AppShell>
        <LoadingSpinner className="min-h-[40vh]" label="Loading job..." />
      </AppShell>
    );
  }

  if (!job) {
    return (
      <AppShell>
        <EmptyState
          icon={Briefcase}
          title="Job not found"
          description={error ?? "This job may have been removed or is no longer available."}
          action={
            <Link href="/jobs">
              <Button>Back to jobs</Button>
            </Link>
          }
        />
      </AppShell>
    );
  }

  const locationLabel = job.isRemote
    ? job.location.trim()
      ? `Remote · ${job.location}`
      : "Remote"
    : job.location || "On campus";

  return (
    <AppShell>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <SectionHeading title={job.title} subtitle={job.organization} />
        <Link href="/jobs">
          <Button variant="secondary" size="sm">
            Back to jobs
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card data-testid="job-detail">
            <CardContent className="space-y-4 pt-6">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="default">{CAMPUS_JOB_TYPE_LABELS[job.jobType]}</Badge>
                {job.status !== "active" && (
                  <Badge variant="secondary" className="capitalize">
                    {job.status}
                  </Badge>
                )}
                {isOwner && (
                  <Badge variant="outline" data-testid="job-owner-badge">
                    Your post
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-muted">
                {job.pay && (
                  <span className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gold" />
                    {job.pay}
                  </span>
                )}
                <span className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {locationLabel}
                </span>
                {job.timeCommitment && (
                  <span className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {job.timeCommitment}
                  </span>
                )}
              </div>

              <div>
                <h3 className="mb-2 font-semibold">Description</h3>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{job.description}</p>
              </div>

              {job.requirements && (
                <div>
                  <h3 className="mb-2 font-semibold">Requirements</h3>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{job.requirements}</p>
                </div>
              )}

              {(job.applicationUrl || job.applicationInstructions) && (
                <div className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <h3 className="font-semibold">How to apply</h3>
                  {job.applicationInstructions && (
                    <p className="text-sm text-muted">{job.applicationInstructions}</p>
                  )}
                  {job.applicationUrl && (
                    <a
                      href={job.applicationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-gold hover:underline"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Open application page
                    </a>
                  )}
                  <p className="text-xs text-muted">
                    Knight Market cannot verify external application pages yet.
                  </p>
                </div>
              )}

              {job.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {job.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="rounded-2xl border border-gold/20 bg-gold/5 p-4">
                <div className="flex items-start gap-3">
                  <Shield className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
                  <div className="space-y-1 text-sm text-muted">
                    <p className="font-medium text-foreground">Job safety</p>
                    <p>Never pay to apply for a job.</p>
                    <p>Be careful with off-platform links.</p>
                    <p>Report suspicious postings.</p>
                  </div>
                </div>
              </div>

              <p className="text-xs text-muted">
                Posted {formatRelativeTime(job.createdAt)} · Updated{" "}
                {formatRelativeTime(job.updatedAt)}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="space-y-4 pt-6">
              <div className="flex items-center gap-3">
                <Avatar
                  initials={job.poster.avatarInitials}
                  verified={job.poster.isVerifiedStudent}
                />
                <div>
                  <p className="font-semibold">{job.poster.name}</p>
                  <p className="text-xs text-muted">Verified student poster</p>
                </div>
              </div>

              {isOwner ? (
                <div className="space-y-2">
                  <Link href={`/jobs/${job.id}/edit`}>
                    <Button variant="secondary" className="w-full">
                      <Pencil className="h-4 w-4" />
                      Edit job
                    </Button>
                  </Link>
                  {job.status === "active" && (
                    <Button variant="outline" className="w-full" onClick={() => void handleMarkClosed()}>
                      Mark closed
                    </Button>
                  )}
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => setConfirmDelete(true)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete job
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <MessageJobPosterButton
                    jobId={job.id}
                    posterId={job.postedBy}
                    jobTitle={job.title}
                    className="w-full"
                  />
                  <p className="text-xs text-muted">
                    Ask about schedule, requirements, or how to apply. No private email is shown
                    here.
                  </p>
                  {user?.id && (
                    <ReportDialog
                      targetType="campus_job"
                      targetId={job.id}
                      buttonLabel="Report job"
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
        title="Delete job post?"
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
