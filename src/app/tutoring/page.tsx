"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BookOpen, PlusCircle } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { SectionHeading } from "@/components/ui/section-heading";
import { SearchBar } from "@/components/ui/search-bar";
import { FilterChips } from "@/components/ui/filter-chips";
import { DemoModeBadge } from "@/components/ui/demo-mode-badge";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { TutorCard } from "@/components/tutoring/tutor-card";
import { BrowseResultBar } from "@/components/browse/browse-result-bar";
import { BrowseEmptyState } from "@/components/browse/browse-empty-state";
import { BrowseSortSelect } from "@/components/browse/browse-sort-select";
import { useBrowseUrlState } from "@/hooks/use-browse-url-state";
import { tutors } from "@/lib/mock-data";
import { TUTORING_SUBJECTS } from "@/lib/constants";
import { isDemoDataEnabledWithOverride } from "@/lib/product-mode";
import { usesSupabaseTutoring } from "@/lib/tutoring-mode";
import { useAuth } from "@/components/providers/auth-provider";
import { buildSignInUrl } from "@/lib/auth";
import {
  getTutorProfiles,
  mapMockTutorProfileToItem,
} from "@/lib/services/tutoring-service";
import {
  filterAndSortTutorProfiles,
  TUTORING_FORMAT_OPTIONS,
  TUTOR_SORT_OPTIONS,
  type TutorProfileItem,
  type TutoringFormat,
  type TutorSortOption,
} from "@/lib/services/tutoring-types";

const SUBJECT_OPTIONS = TUTORING_SUBJECTS.map((subject) => ({
  id: subject,
  label: subject,
}));

const FORMAT_FILTER_OPTIONS = [
  { id: "all", label: "All formats" },
  ...TUTORING_FORMAT_OPTIONS.map((option) => ({ id: option.value, label: option.label })),
];

type TutoringBrowseUiState = {
  query: string;
  format: TutoringFormat | "all";
  minRate: string;
  maxRate: string;
  subject: string;
  sort: TutorSortOption;
};

const DEFAULT_TUTORING_BROWSE: TutoringBrowseUiState = {
  query: "",
  format: "all",
  minRate: "",
  maxRate: "",
  subject: "all",
  sort: "newest",
};

function parseTutoringParams(params: URLSearchParams): Partial<TutoringBrowseUiState> {
  return {
    query: params.get("search") ?? "",
    format: (params.get("format") as TutoringFormat | "all") ?? "all",
    minRate: params.get("minRate") ?? "",
    maxRate: params.get("maxRate") ?? "",
    subject: params.get("subject") ?? "all",
    sort: (params.get("sort") as TutorSortOption) ?? "newest",
  };
}

function serializeTutoringState(state: TutoringBrowseUiState) {
  return {
    search: state.query,
    format: state.format,
    minRate: state.minRate,
    maxRate: state.maxRate,
    subject: state.subject,
    sort: state.sort,
  };
}

function tutoringUiToFilters(state: TutoringBrowseUiState) {
  return {
    query: state.query,
    format: state.format,
    minRate: state.minRate.trim() ? Number(state.minRate) : undefined,
    maxRate: state.maxRate.trim() ? Number(state.maxRate) : undefined,
    sort: state.sort,
  };
}

function isTutoringBrowseActive(state: TutoringBrowseUiState): boolean {
  return Boolean(
    state.query.trim() ||
      state.format !== "all" ||
      state.minRate.trim() ||
      state.maxRate.trim() ||
      state.subject !== "all"
  );
}

function TutoringBrowseFilters({
  state,
  onChange,
  showSubjectChips = false,
}: {
  state: TutoringBrowseUiState;
  onChange: (patch: Partial<TutoringBrowseUiState>) => void;
  showSubjectChips?: boolean;
}) {
  return (
    <div className="mb-4 space-y-3" data-testid="tutoring-browse-filters">
      <SearchBar
        placeholder="Search tutors, subjects, or courses..."
        value={state.query}
        onChange={(query) => onChange({ query })}
        ariaLabel="Search tutoring"
      />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <select
          value={state.format}
          onChange={(event) => onChange({ format: event.target.value as TutoringFormat | "all" })}
          className="h-11 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm"
          aria-label="Tutoring format filter"
        >
          {FORMAT_FILTER_OPTIONS.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
        <input
          type="number"
          min="0"
          placeholder="Min rate"
          value={state.minRate}
          onChange={(event) => onChange({ minRate: event.target.value })}
          className="h-11 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm"
          aria-label="Minimum hourly rate"
        />
        <input
          type="number"
          min="0"
          placeholder="Max rate"
          value={state.maxRate}
          onChange={(event) => onChange({ maxRate: event.target.value })}
          className="h-11 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm"
          aria-label="Maximum hourly rate"
        />
        <BrowseSortSelect
          value={state.sort}
          options={TUTOR_SORT_OPTIONS}
          onChange={(sort) => onChange({ sort: sort as TutorSortOption })}
        />
      </div>
      {showSubjectChips && (
        <FilterChips
          options={SUBJECT_OPTIONS}
          value={state.subject}
          onChange={(subject) => onChange({ subject })}
          allLabel="All Subjects"
          size="sm"
        />
      )}
    </div>
  );
}

function applySubjectFilter(profiles: TutorProfileItem[], subject: string) {
  if (subject === "all") return profiles;
  return profiles.filter((profile) => profile.subjects.includes(subject));
}

function RealTutoringBrowse() {
  const { isAuthenticated } = useAuth();
  const [profiles, setProfiles] = useState<TutorProfileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [browseState, setBrowseState, resetBrowseState] = useBrowseUrlState({
    defaults: DEFAULT_TUTORING_BROWSE,
    parse: parseTutoringParams,
    serialize: serializeTutoringState,
  });

  useEffect(() => {
    let cancelled = false;
    void getTutorProfiles().then((result) => {
      if (cancelled) return;
      setProfiles(result.profiles);
      setError(result.error ?? null);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const sorted = filterAndSortTutorProfiles(profiles, tutoringUiToFilters(browseState));
    return applySubjectFilter(sorted, browseState.subject);
  }, [profiles, browseState]);

  const filtersActive = isTutoringBrowseActive(browseState);
  const becomeHref = isAuthenticated ? "/tutoring/new" : buildSignInUrl("/tutoring/new");

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <SectionHeading
          title="Find student tutors"
          subtitle="Verified UCF students offering subject help"
        />
        <Link href={becomeHref}>
          <Button data-testid="become-tutor-cta">
            <PlusCircle className="h-4 w-4" />
            Become a tutor
          </Button>
        </Link>
      </div>

      <TutoringBrowseFilters state={browseState} onChange={setBrowseState} />

      <BrowseResultBar
        count={filtered.length}
        singular="tutor"
        filtersActive={filtersActive}
        onReset={resetBrowseState}
      />

      {loading && <LoadingSpinner className="min-h-[30vh]" label="Loading tutors..." />}

      {error && !loading && (
        <p role="alert" className="mb-4 text-sm text-red-400">
          We could not load tutor profiles. Please try again.
        </p>
      )}

      {!loading && filtered.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((profile) => (
            <TutorCard key={profile.id} profile={profile} />
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <BrowseEmptyState
          icon={BookOpen}
          totalCount={profiles.length}
          filteredCount={filtered.length}
          filtersActive={filtersActive}
          moduleLabel="tutor"
          moduleLabelPlural="tutors"
          emptyAllTitle="No tutors yet"
          emptyAllDescription="Be the first to offer tutoring for UCF students."
          emptyFilterTitle="No tutors match your filters"
          emptyFilterDescription="Try clearing search or changing format or rate filters."
          onReset={resetBrowseState}
          createAction={
            <Link href={becomeHref}>
              <Button>Become a tutor</Button>
            </Link>
          }
        />
      )}
    </>
  );
}

function DemoTutoringBrowse() {
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth();
  const demoEnabled = isDemoDataEnabledWithOverride(searchParams);
  const [browseState, setBrowseState, resetBrowseState] = useBrowseUrlState({
    defaults: DEFAULT_TUTORING_BROWSE,
    parse: parseTutoringParams,
    serialize: serializeTutoringState,
  });

  const sourceProfiles = useMemo(
    () => (demoEnabled ? tutors.map(mapMockTutorProfileToItem) : []),
    [demoEnabled]
  );

  const filtered = useMemo(() => {
    const sorted = filterAndSortTutorProfiles(sourceProfiles, tutoringUiToFilters(browseState));
    return applySubjectFilter(sorted, browseState.subject);
  }, [sourceProfiles, browseState]);

  const filtersActive = isTutoringBrowseActive(browseState);
  const becomeHref = isAuthenticated ? "/tutoring/new" : buildSignInUrl("/tutoring/new");

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <SectionHeading
            title="Find student tutors"
            subtitle="Book verified student tutors by subject"
          />
          <DemoModeBadge />
        </div>
        <Link href={becomeHref}>
          <Button data-testid="become-tutor-cta">
            <PlusCircle className="h-4 w-4" />
            Become a tutor
          </Button>
        </Link>
      </div>

      {demoEnabled && (
        <TutoringBrowseFilters
          state={browseState}
          onChange={setBrowseState}
          showSubjectChips
        />
      )}

      {demoEnabled && (
        <BrowseResultBar
          count={filtered.length}
          singular="tutor"
          filtersActive={filtersActive}
          onReset={resetBrowseState}
        />
      )}

      {filtered.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((profile) => (
            <TutorCard key={profile.id} profile={profile} showDemoRatings />
          ))}
        </div>
      ) : (
        <BrowseEmptyState
          icon={BookOpen}
          totalCount={sourceProfiles.length}
          filteredCount={filtered.length}
          filtersActive={filtersActive}
          moduleLabel="tutor"
          moduleLabelPlural="tutors"
          emptyAllTitle="No tutors listed yet"
          emptyAllDescription="Verified students will soon be able to offer tutoring by subject."
          emptyFilterTitle="No tutors match your search"
          emptyFilterDescription="Try a different subject or search term."
          onReset={resetBrowseState}
        />
      )}
    </>
  );
}

function TutoringPageContent() {
  const supabaseMode = usesSupabaseTutoring();
  return <AppShell>{supabaseMode ? <RealTutoringBrowse /> : <DemoTutoringBrowse />}</AppShell>;
}

export default function TutoringPage() {
  return (
    <Suspense
      fallback={
        <AppShell>
          <SectionHeading title="Tutoring" subtitle="Loading..." />
        </AppShell>
      }
    >
      <TutoringPageContent />
    </Suspense>
  );
}
