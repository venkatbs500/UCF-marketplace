"use client";

import type { CampusJob } from "@/lib/types";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { ProtectedActionButton } from "@/components/auth/protected-action-button";
import { MapPin, Clock, DollarSign } from "lucide-react";

const typeLabels: Record<string, string> = {
  "campus-gig": "Campus Gig",
  "part-time": "Part-Time",
  research: "Research",
  freelance: "Freelance",
};

interface JobCardProps {
  job: CampusJob;
}

export function JobCard({ job }: JobCardProps) {
  return (
    <Card hover>
      <CardContent>
        <div className="mb-2 flex items-start justify-between gap-2">
          <h3 className="font-semibold">{job.title}</h3>
          <Badge variant="default">{typeLabels[job.type]}</Badge>
        </div>
        <p className="mb-2 text-sm text-muted">{job.company}</p>
        <p className="mb-3 line-clamp-2 text-sm text-muted">{job.description}</p>
        <div className="mb-3 flex flex-wrap gap-3 text-xs text-muted">
          <span className="flex items-center gap-1">
            <DollarSign className="h-3 w-3 text-gold" /> {job.pay}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" /> {job.location}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" /> {job.timeCommitment}
          </span>
        </div>
        <div className="flex flex-wrap gap-1">
          {job.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="justify-between border-t border-white/5 pt-3">
        <div className="flex items-center gap-2">
          <Avatar initials={job.postedBy.avatar} size="sm" />
          <span className="text-xs">{job.postedBy.name}</span>
        </div>
        <ProtectedActionButton size="sm" variant="outline" unlockedLabel="Ready">
          Apply
        </ProtectedActionButton>
      </CardFooter>
    </Card>
  );
}
