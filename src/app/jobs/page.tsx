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
import { DemoModeBadge } from "@/components/ui/demo-mode-badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { JobCard } from "@/components/jobs/job-card";
import { BrowseResultBar } from "@/components/browse/browse-result-bar";
import { BrowseEmptyState } from "@/components/browse/browse-empty-state";
import { BrowseSortSelect } from "@/components/browse/browse-sort-select";
import { useBrowseUrlState } from "@/hooks/use-browse-url-state";
import { JOB_FILTERS } from "@/lib/constants";
import { isDemoDataEnabledWithOverride } from "@/lib/product-mode";
import { usesSupabaseJobs } from "@/lib/jobs-mode";
import { useAuth } from "@/components/providers/auth-provider";
import { buildSignInUrl } from "@/lib/auth";
import { campusJobs } from "@/lib/mock-data";
import { getCampusJobs, mapMockCampusJobToRecord } from "@/lib/services/jobs-service";
import {
  CAMPUS_JOB_SORT_OPTIONS,
  CAMPUS_JOB_TYPE_OPTIONS,
  filterAndSortCampusJobs,
  isCampusJobFilterActive,
  mapMockJobTypeToCampusJobType,
  type CampusJobFilters,
  type CampusJobRecord,
  type CampusJobSortOption,
  type CampusJobType,
} from "@/lib/services/jobs-types";

const DEMO_FILTER_OPTIONS = JOB_FILTERS.map((filter) => ({
  id: mapMockJobTypeToCampusJobType(filter.id),
  label: filter.label,
}));

type JobsBrowseUiState = {
  query: string;
  jobType: CampusJobType | "all";
  location: string;
  remoteOnly: boolean;
  sort: CampusJobSortOption;
};

const DEFAULT_JOBS_BROWSE: JobsBrowseUiState = {
  query: "",
  jobType: "all",
  location: "",
  remoteOnly: false,
  sort: "newest",
};

function parseJobsParams(params: URLSearchParams): Partial<JobsBrowseUiState> {
  return {
    query: params.get("search") ?? "",
    jobType: (params.get("jobType") as CampusJobType | "all") ?? "all",
    location: params.get("location") ?? "",
    remoteOnly: params.get("remoteOnly") === "true",
    sort: (params.get("sort") as CampusJobSortOption) ?? "newest",
  };
}

function serializeJobsState(state: JobsBrowseUiState) {
  return {
    search: state.query,
    jobType: state.jobType,
    location: state.location,
    remoteOnly: state.remoteOnly ? "true" : undefined,
    sort: state.sort,
  };
}

function browseUiToFilters(state: JobsBrowseUiState): CampusJobFilters {
  return {
    query: state.query,
    jobType: state.jobType,
    location: state.location,
    remoteOnly: state.remoteOnly,
    sort: state.sort,
  };
}

function JobsBrowseFilters({
  state,
  onChange,
  demoMode = false,
}: {
  state: JobsBrowseUiState;
  onChange: (patch: Partial<JobsBrowseUiState>) => void;
  demoMode?: boolean;
}) {
  return (
    <div className="mb-4 space-y-3" data-testid="jobs-browse-filters">
      <div className={demoMode ? undefined : "grid gap-3 lg:grid-cols-3"}>
        <div className={demoMode ? undefined : "lg:col-span-2"}>
          <SearchBar
            placeholder={
              demoMode
                ? "Search jobs, companies, or skills..."
                : "Search title, organization, pay, or skills..."
            }
            value={state.query}
            onChange={(query) => onChange({ query })}
            ariaLabel="Search jobs"
          />
        </div>
        {!demoMode && (
          <input
            type="text"
            placeholder="Filter by location"
            value={state.location}
            onChange={(event) => onChange({ location: event.target.value })}
            className="h-11 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm"
            aria-label="Location filter"
          />
        )}
      </div>

      {demoMode ? (
        <FilterChips
          options={DEMO_FILTER_OPTIONS}
          value={state.jobType}
          onChange={(jobType) => onChange({ jobType })}
          allLabel="All jobs"
        />
      ) : (
        <div className="flex flex-wrap items-center gap-4">
          <select
            value={state.jobType}
            onChange={(event) =>
              onChange({ jobType: event.target.value as CampusJobType | "all" })
            }
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
              checked={state.remoteOnly}
              onChange={(event) => onChange({ remoteOnly: event.target.checked })}
              className="rounded border-white/20"
            />
            Remote only
          </label>
          <BrowseSortSelect
            value={state.sort}
            options={CAMPUS_JOB_SORT_OPTIONS}
            onChange={(sort) => onChange({ sort: sort as CampusJobSortOption })}
          />
        </div>
      )}

      {demoMode && (
        <BrowseSortSelect
          value={state.sort}
          options={CAMPUS_JOB_SORT_OPTIONS}
          onChange={(sort) => onChange({ sort: sort as CampusJobSortOption })}
        />
      )}
    </div>
  );
}

function RealJobsBrowse() {
  const { isAuthenticated } = useAuth();
  const [jobs, setJobs] = useState<CampusJobRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [browseState, setBrowseState, resetBrowseState] = useBrowseUrlState({
    defaults: DEFAULT_JOBS_BROWSE,
    parse: parseJobsParams,
    serialize: serializeJobsState,
  });

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

  const filters = useMemo(() => browseUiToFilters(browseState), [browseState]);
  const filtered = useMemo(
    () => filterAndSortCampusJobs(jobs, filters),
    [jobs, filters]
  );
  const filtersActive = isCampusJobFilterActive(filters);
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

      <JobsBrowseFilters state={browseState} onChange={setBrowseState} />

      <BrowseResultBar
        count={filtered.length}
        singular="job"
        plural="jobs"
        filtersActive={filtersActive}
        onReset={resetBrowseState}
      />

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
        <BrowseEmptyState
          icon={Briefcase}
          totalCount={jobs.length}
          filteredCount={filtered.length}
          filtersActive={filtersActive}
          moduleLabel="job"
          moduleLabelPlural="jobs"
          emptyAllTitle="No jobs posted yet"
          emptyAllDescription="Post a campus job, part-time role, research opening, or student gig."
          emptyFilterTitle="No jobs match your filters"
          emptyFilterDescription="Try clearing search or changing job type, location, or remote filters."
          onReset={resetBrowseState}
          createAction={
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
  const [browseState, setBrowseState, resetBrowseState] = useBrowseUrlState({
    defaults: DEFAULT_JOBS_BROWSE,
    parse: parseJobsParams,
    serialize: serializeJobsState,
  });

  const sourceJobs = useMemo(
    () => (demoEnabled ? campusJobs.map(mapMockCampusJobToRecord) : []),
    [demoEnabled]
  );

  const filters = useMemo(() => browseUiToFilters(browseState), [browseState]);
  const filtered = useMemo(
    () => filterAndSortCampusJobs(sourceJobs, filters),
    [sourceJobs, filters]
  );
  const filtersActive = isCampusJobFilterActive(filters);
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
          <JobsBrowseFilters state={browseState} onChange={setBrowseState} demoMode />
          <BrowseResultBar
            count={filtered.length}
            singular="job"
            plural="jobs"
            filtersActive={filtersActive}
            onReset={resetBrowseState}
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
        <BrowseEmptyState
          icon={Briefcase}
          totalCount={sourceJobs.length}
          filteredCount={filtered.length}
          filtersActive={filtersActive}
          moduleLabel="job"
          moduleLabelPlural="jobs"
          emptyAllTitle="No jobs posted yet"
          emptyAllDescription="Post a campus job, part-time role, research opening, or student gig."
          emptyFilterTitle="No jobs match your search"
          emptyFilterDescription="Try a different search or filter."
          onReset={resetBrowseState}
          createAction={
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
