"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  CAMPUS_JOB_TYPE_OPTIONS,
  type CampusJobRecord,
  type CampusJobType,
  type CreateCampusJobInput,
  type UpdateCampusJobInput,
} from "@/lib/services/jobs-types";
import { createCampusJob, updateCampusJob } from "@/lib/services/jobs-service";

type CampusJobFormProps = {
  userId: string;
  mode: "create" | "edit";
  initialJob?: CampusJobRecord;
};

type FormState = {
  title: string;
  organization: string;
  jobType: CampusJobType;
  pay: string;
  location: string;
  isRemote: boolean;
  timeCommitment: string;
  description: string;
  requirements: string;
  applicationUrl: string;
  applicationInstructions: string;
  tags: string;
};

function toFormState(job?: CampusJobRecord): FormState {
  return {
    title: job?.title ?? "",
    organization: job?.organization ?? "",
    jobType: job?.jobType ?? "campus",
    pay: job?.pay ?? "",
    location: job?.location ?? "",
    isRemote: job?.isRemote ?? false,
    timeCommitment: job?.timeCommitment ?? "",
    description: job?.description ?? "",
    requirements: job?.requirements ?? "",
    applicationUrl: job?.applicationUrl ?? "",
    applicationInstructions: job?.applicationInstructions ?? "",
    tags: job?.tags.join(", ") ?? "",
  };
}

function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function CampusJobForm({ userId, mode, initialJob }: CampusJobFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(() => toFormState(initialJob));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!form.title.trim() || !form.organization.trim() || !form.description.trim()) {
      setError("Please fill in title, organization, and description.");
      return;
    }

    if (!form.isRemote && !form.location.trim()) {
      setError("Please add a location or mark the role as remote.");
      return;
    }

    if (form.applicationUrl.trim() && !isValidUrl(form.applicationUrl.trim())) {
      setError("Please enter a valid application URL starting with http:// or https://.");
      return;
    }

    const tags = form.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    setLoading(true);

    if (mode === "create") {
      const input: CreateCampusJobInput = {
        postedBy: userId,
        title: form.title,
        organization: form.organization,
        jobType: form.jobType,
        pay: form.pay,
        location: form.isRemote && !form.location.trim() ? "Remote" : form.location,
        isRemote: form.isRemote,
        timeCommitment: form.timeCommitment,
        description: form.description,
        requirements: form.requirements,
        applicationUrl: form.applicationUrl.trim() || null,
        applicationInstructions: form.applicationInstructions,
        tags,
        status: "active",
      };
      const result = await createCampusJob(input);
      setLoading(false);
      if (!result.job) {
        setError(result.error ?? "We could not create your job post. Please try again.");
        return;
      }
      router.push(`/jobs/${result.job.id}`);
      return;
    }

    const updateInput: UpdateCampusJobInput = {
      title: form.title,
      organization: form.organization,
      jobType: form.jobType,
      pay: form.pay,
      location: form.isRemote && !form.location.trim() ? "Remote" : form.location,
      isRemote: form.isRemote,
      timeCommitment: form.timeCommitment,
      description: form.description,
      requirements: form.requirements,
      applicationUrl: form.applicationUrl.trim() || null,
      applicationInstructions: form.applicationInstructions,
      tags,
    };
    const result = await updateCampusJob(initialJob!.id, userId, updateInput);
    setLoading(false);
    if (!result.job) {
      setError(result.error ?? "We could not update your job post. Please try again.");
      return;
    }
    router.push(`/jobs/${result.job.id}`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="rounded-2xl border border-gold/20 bg-gold/5 p-4 text-sm text-muted">
            Never pay to apply for a job. Be careful with off-platform links. Report suspicious
            postings.
          </div>

          <div>
            <label htmlFor="job-title" className="mb-2 block text-sm font-medium">
              Job title
            </label>
            <Input
              id="job-title"
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              placeholder="e.g. Campus tour guide"
              required
            />
          </div>

          <div>
            <label htmlFor="job-organization" className="mb-2 block text-sm font-medium">
              Organization / company
            </label>
            <Input
              id="job-organization"
              value={form.organization}
              onChange={(event) =>
                setForm((current) => ({ ...current, organization: event.target.value }))
              }
              placeholder="e.g. UCF department, student org, local business"
              required
            />
          </div>

          <label className="block space-y-2 text-sm">
            <span className="font-medium">Job type</span>
            <select
              value={form.jobType}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  jobType: event.target.value as CampusJobType,
                }))
              }
              className="h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-4"
            >
              {CAMPUS_JOB_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="job-pay" className="mb-2 block text-sm font-medium">
                Pay / rate (optional)
              </label>
              <Input
                id="job-pay"
                value={form.pay}
                onChange={(event) => setForm((current) => ({ ...current, pay: event.target.value }))}
                placeholder="e.g. $15/hr"
              />
            </div>
            <div>
              <label htmlFor="job-time" className="mb-2 block text-sm font-medium">
                Time commitment (optional)
              </label>
              <Input
                id="job-time"
                value={form.timeCommitment}
                onChange={(event) =>
                  setForm((current) => ({ ...current, timeCommitment: event.target.value }))
                }
                placeholder="e.g. 10 hrs/week"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isRemote}
              onChange={(event) =>
                setForm((current) => ({ ...current, isRemote: event.target.checked }))
              }
              className="rounded border-white/20"
            />
            Remote or hybrid role
          </label>

          <div>
            <label htmlFor="job-location" className="mb-2 block text-sm font-medium">
              Location / area
            </label>
            <Input
              id="job-location"
              value={form.location}
              onChange={(event) =>
                setForm((current) => ({ ...current, location: event.target.value }))
              }
              placeholder={form.isRemote ? "Optional city or campus area" : "e.g. Student Union"}
            />
          </div>

          <label className="block space-y-2 text-sm">
            <span className="font-medium">Description</span>
            <textarea
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({ ...current, description: event.target.value }))
              }
              rows={4}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
              placeholder="What will the student do? Include schedule notes if helpful."
              required
            />
          </label>

          <label className="block space-y-2 text-sm">
            <span className="font-medium">Requirements (optional)</span>
            <textarea
              value={form.requirements}
              onChange={(event) =>
                setForm((current) => ({ ...current, requirements: event.target.value }))
              }
              rows={3}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
              placeholder="Skills, year level, availability, etc."
            />
          </label>

          <div>
            <label htmlFor="job-application-url" className="mb-2 block text-sm font-medium">
              Application URL (optional)
            </label>
            <Input
              id="job-application-url"
              type="url"
              value={form.applicationUrl}
              onChange={(event) =>
                setForm((current) => ({ ...current, applicationUrl: event.target.value }))
              }
              placeholder="https://example.com/apply"
            />
            <p className="mt-1 text-xs text-muted">
              Knight Market cannot verify external application pages yet.
            </p>
          </div>

          <label className="block space-y-2 text-sm">
            <span className="font-medium">Application instructions (optional)</span>
            <textarea
              value={form.applicationInstructions}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  applicationInstructions: event.target.value,
                }))
              }
              rows={2}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
              placeholder="How should students apply or what to include in a message?"
            />
          </label>

          <div>
            <label htmlFor="job-tags" className="mb-2 block text-sm font-medium">
              Tags (optional)
            </label>
            <Input
              id="job-tags"
              value={form.tags}
              onChange={(event) => setForm((current) => ({ ...current, tags: event.target.value }))}
              placeholder="Flexible, On Campus, Resume Builder"
            />
          </div>
        </CardContent>
      </Card>

      {error && (
        <p role="alert" className="text-sm text-red-400">
          {error}
        </p>
      )}

      <Button type="submit" disabled={loading} className="w-full">
        {loading
          ? mode === "create"
            ? "Posting…"
            : "Saving…"
          : mode === "create"
            ? "Post job"
            : "Save changes"}
      </Button>
    </form>
  );
}
