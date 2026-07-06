"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Briefcase, PlusCircle, Shield } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { SectionHeading } from "@/components/ui/section-heading";
import { SearchBar } from "@/components/ui/search-bar";
import { FilterChips } from "@/components/ui/filter-chips";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { DemoModeBadge } from "@/components/ui/demo-mode-badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { JobCard } from "@/components/jobs/job-card";
import { JOB_FILTERS } from "@/lib/constants";
import { isDemoDataEnabledWithOverride } from "@/lib/product-mode";
import { usesSupabaseJobs } from "@/lib/jobs-mode";
import { useAuth } from "@/components/providers/auth-provider";
import { buildSignInUrl } from "@/lib/auth";
import { campusJobs } from "@/lib/mock-data";
import { getCampusJobs, mapMockCampusJobToRecord } from "@/lib/services/jobs-service";
import {
  CAMPUS_JOB_TYPE_OPTIONS,
  filterCampusJobs,
  mapMockJobTypeToCampusJobType,
  type CampusJobFilters,
  type CampusJobRecord,
  type CampusJobType,
} from "@/lib/services/jobs-types";

const DEMO_FILTER_OPTIONS = JOB_FILTERS.map((filter) => ({
  id: mapMockJobTypeToCampusJobType(filter.id),
  label: filter.label,
}));

function RealJobsBrowse() {
  const { isAuthenticated } = useAuth();
  const [jobs, setJobs] = useState<CampusJobRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [jobType, setJobType] = useState<CampusJobType | "all">("all");
  const [location, setLocation] = useState("");
  const [remoteOnly, setRemoteOnly] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void getCampusJobs().then((result) => {
      if (cancelled) return;
      setJobs(result.jobs);
      setError(result.error ?? null);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const filters: CampusJobFilters = useMemo(
    () => ({
      query,
      jobType,
      location,
      remoteOnly,
    }),
    [query, jobType, location, remoteOnly]
  );

  const filtered = useMemo(() => filterCampusJobs(jobs, filters), [jobs, filters]);
  const postHref = isAuthenticated ? "/jobs/new" : buildSignInUrl("/jobs/new");

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <SectionHeading
            title="Find student jobs and gigs"
            subtitle="Campus roles, part-time work, research, and student-friendly opportunities"
          />
        </div>
        <Link href={postHref}>
          <Button data-testid="post-job-cta">
            <PlusCircle className="h-4 w-4" />
            Post a job
          </Button>
        </Link>
      </div>

      <div className="mb-6 rounded-2xl border border-gold/20 bg-gold/5 p-4">
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

      <div className="mb-4 grid gap-3 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SearchBar
            placeholder="Search title, organization, pay, or skills..."
            value={query}
            onChange={(value) => setQuery(value)}
          />
        </div>
        <input
          type="text"
          placeholder="Filter by location"
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          className="h-11 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm"
          aria-label="Location filter"
        />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-4">
        <select
          value={jobType}
          onChange={(event) => setJobType(event.target.value as CampusJobType | "all")}
          className="h-11 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm"
          aria-label="Job type filter"
        >
          <option value="all">All job types</option>
          {CAMPUS_JOB_TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm text-muted">
          <input
            type="checkbox"
            checked={remoteOnly}
            onChange={(event) => setRemoteOnly(event.target.checked)}
            className="rounded border-white/20"
          />
          Remote only
        </label>
      </div>

      {loading && <LoadingSpinner className="min-h-[30vh]" label="Loading jobs..." />}

      {error && !loading && (
        <p role="alert" className="mb-4 text-sm text-red-400">
          We could not load jobs. Please try again.
        </p>
      )}

      {!loading && filtered.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <EmptyState
          icon={Briefcase}
          title="No jobs posted yet"
          description="Post a campus job, part-time role, research opening, or student gig."
          action={
            <Link href={postHref}>
              <Button>Post a job</Button>
            </Link>
          }
        />
      )}
    </>
  );
}

function DemoJobsBrowse() {
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth();
  const demoEnabled = isDemoDataEnabledWithOverride(searchParams);
  const [query, setQuery] = useState("");
  const [jobType, setJobType] = useState<CampusJobType | "all">("all");

  const sourceJobs = useMemo(
    () => (demoEnabled ? campusJobs.map(mapMockCampusJobToRecord) : []),
    [demoEnabled]
  );

  const filters: CampusJobFilters = useMemo(
    () => ({
      query,
      jobType,
    }),
    [query, jobType]
  );

  const filtered = useMemo(() => filterCampusJobs(sourceJobs, filters), [sourceJobs, filters]);
  const postHref = isAuthenticated ? "/jobs/new" : buildSignInUrl("/jobs/new");

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <SectionHeading
            title="Find student jobs and gigs"
            subtitle="Gigs, part-time, research, and freelance opportunities"
          />
          <DemoModeBadge />
        </div>
        <Link href={postHref}>
          <Button data-testid="post-job-cta">
            <PlusCircle className="h-4 w-4" />
            Post a job
          </Button>
        </Link>
      </div>

      {demoEnabled && (
        <>
          <div className="mb-6">
            <SearchBar
              placeholder="Search jobs, companies, or skills..."
              value={query}
              onChange={(value) => setQuery(value)}
            />
          </div>

          <FilterChips
            options={DEMO_FILTER_OPTIONS}
            value={jobType}
            onChange={setJobType}
            allLabel="All jobs"
            className="mb-8"
          />
        </>
      )}

      {filtered.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Briefcase}
          title={demoEnabled ? "No jobs match your search" : "No jobs posted yet"}
          description={
            demoEnabled
              ? "Try a different search or filter."
              : "Post a campus job, part-time role, research opening, or student gig."
          }
          action={
            !demoEnabled ? (
              <Link href={postHref}>
                <Button>Post a job</Button>
              </Link>
            ) : undefined
          }
        />
      )}
    </>
  );
}

function JobsPageContent() {
  const supabaseMode = usesSupabaseJobs();
  return <AppShell>{supabaseMode ? <RealJobsBrowse /> : <DemoJobsBrowse />}</AppShell>;
}

export default function JobsPage() {
  return (
    <Suspense
      fallback={
        <AppShell>
          <SectionHeading title="Jobs" subtitle="Loading..." />
        </AppShell>
      }
    >
      <JobsPageContent />
    </Suspense>
  );
}
