"use client";

import Link from "next/link";
import type { CampusJobRecord } from "@/lib/services/jobs-types";
import { CAMPUS_JOB_TYPE_LABELS } from "@/lib/services/jobs-types";
import { formatRelativeTime, cn } from "@/lib/utils";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { MapPin, Clock, DollarSign } from "lucide-react";

interface JobCardProps {
  job: CampusJobRecord;
  showOwnerBadge?: boolean;
}

export function JobCard({ job, showOwnerBadge = false }: JobCardProps) {
  const locationLabel = job.isRemote
    ? job.location.trim()
      ? `Remote · ${job.location}`
      : "Remote"
    : job.location || "On campus";

  return (
    <Card hover className="flex h-full flex-col" data-testid={`job-card-${job.id}`}>
      <Link
        href={`/jobs/${job.id}`}
        className="flex flex-1 flex-col"
        data-testid={`job-detail-link-${job.id}`}
      >
        <CardContent className="flex-1">
          <div className="mb-2 flex items-start justify-between gap-2">
            <h3 className="line-clamp-2 font-semibold">{job.title}</h3>
            <Badge variant="default" className="shrink-0 text-[10px]">
              {CAMPUS_JOB_TYPE_LABELS[job.jobType]}
            </Badge>
          </div>
          <p className="mb-2 text-sm text-muted">{job.organization}</p>
          <p className="mb-3 line-clamp-2 text-sm text-muted">{job.description}</p>
          <div className="mb-3 flex flex-wrap gap-3 text-xs text-muted">
            {job.pay && (
              <span className="flex items-center gap-1">
                <DollarSign className="h-3 w-3 text-gold" /> {job.pay}
              </span>
            )}
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" /> {locationLabel}
            </span>
            {job.timeCommitment && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" /> {job.timeCommitment}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-1">
            {job.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-[10px]">
                {tag}
              </Badge>
            ))}
            {job.status !== "active" && (
              <Badge variant="outline" className="text-[10px] capitalize">
                {job.status}
              </Badge>
            )}
          </div>
          {showOwnerBadge && (
            <Badge variant="outline" className="mt-2 text-[10px]">
              Your post
            </Badge>
          )}
        </CardContent>
      </Link>
      <CardFooter className="justify-between border-t border-white/5 pt-3">
        <div className="flex items-center gap-2">
          <Avatar
            initials={job.poster.avatarInitials}
            size="sm"
            verified={job.poster.isVerifiedStudent}
          />
          <span className="text-xs">{job.poster.name}</span>
        </div>
        <span className={cn("text-xs text-muted")}>{formatRelativeTime(job.createdAt)}</span>
      </CardFooter>
    </Card>
  );
}
