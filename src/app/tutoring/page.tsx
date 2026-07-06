"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BookOpen, PlusCircle } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { SectionHeading } from "@/components/ui/section-heading";
import { SearchBar } from "@/components/ui/search-bar";
import { FilterChips } from "@/components/ui/filter-chips";
import { EmptyState } from "@/components/ui/empty-state";
import { DemoModeBadge } from "@/components/ui/demo-mode-badge";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { TutorCard } from "@/components/tutoring/tutor-card";
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
  filterTutorProfiles,
  TUTORING_FORMAT_OPTIONS,
  type TutorProfileFilters,
  type TutorProfileItem,
  type TutoringFormat,
} from "@/lib/services/tutoring-types";

const SUBJECT_OPTIONS = TUTORING_SUBJECTS.map((subject) => ({
  id: subject,
  label: subject,
}));

const FORMAT_FILTER_OPTIONS = [
  { id: "all", label: "All formats" },
  ...TUTORING_FORMAT_OPTIONS.map((option) => ({ id: option.value, label: option.label })),
];

function RealTutoringBrowse() {
  const { isAuthenticated } = useAuth();
  const [profiles, setProfiles] = useState<TutorProfileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [format, setFormat] = useState<TutoringFormat | "all">("all");
  const [minRate, setMinRate] = useState("");
  const [maxRate, setMaxRate] = useState("");

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

  const filters: TutorProfileFilters = useMemo(
    () => ({
      query,
      format,
      minRate: minRate.trim() ? Number(minRate) : undefined,
      maxRate: maxRate.trim() ? Number(maxRate) : undefined,
    }),
    [query, format, minRate, maxRate]
  );

  const filtered = useMemo(() => filterTutorProfiles(profiles, filters), [profiles, filters]);
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

      <div className="mb-6 grid gap-3 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <SearchBar
            placeholder="Search tutors, subjects, or courses..."
            value={query}
            onChange={setQuery}
          />
        </div>
        <select
          value={format}
          onChange={(event) => setFormat(event.target.value as TutoringFormat | "all")}
          className="h-11 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm"
          aria-label="Tutoring format filter"
        >
          {FORMAT_FILTER_OPTIONS.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            min="0"
            placeholder="Min rate"
            value={minRate}
            onChange={(event) => setMinRate(event.target.value)}
            className="h-11 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm"
            aria-label="Minimum hourly rate"
          />
          <input
            type="number"
            min="0"
            placeholder="Max rate"
            value={maxRate}
            onChange={(event) => setMaxRate(event.target.value)}
            className="h-11 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm"
            aria-label="Maximum hourly rate"
          />
        </div>
      </div>

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
        <EmptyState
          icon={BookOpen}
          title="No tutors yet"
          description="Be the first to offer tutoring for UCF students."
          action={
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
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState<string | "all">("all");

  const sourceProfiles = useMemo(
    () => (demoEnabled ? tutors.map(mapMockTutorProfileToItem) : []),
    [demoEnabled]
  );

  const filtered = useMemo(
    () =>
      sourceProfiles.filter((profile) => {
        const matchesSearch =
          !search ||
          profile.displayName.toLowerCase().includes(search.toLowerCase()) ||
          profile.subjects.some((s) => s.toLowerCase().includes(search.toLowerCase()));
        const matchesSubject = subject === "all" || profile.subjects.includes(subject);
        return matchesSearch && matchesSubject;
      }),
    [sourceProfiles, search, subject]
  );

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

      <div className="mb-6">
        <SearchBar
          placeholder="Search tutors or subjects..."
          value={search}
          onChange={setSearch}
        />
      </div>

      <FilterChips
        options={SUBJECT_OPTIONS}
        value={subject}
        onChange={setSubject}
        allLabel="All Subjects"
        className="mb-8"
      />

      {filtered.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((profile) => (
            <TutorCard key={profile.id} profile={profile} showDemoRatings />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={BookOpen}
          title={demoEnabled ? "No tutors match your search" : "No tutors listed yet"}
          description={
            demoEnabled
              ? "Try a different subject or search term."
              : "Verified students will soon be able to offer tutoring by subject."
          }
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
