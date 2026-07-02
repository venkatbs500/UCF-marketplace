"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BookOpen } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { SectionHeading } from "@/components/ui/section-heading";
import { SearchBar } from "@/components/ui/search-bar";
import { FilterChips } from "@/components/ui/filter-chips";
import { EmptyState } from "@/components/ui/empty-state";
import { DemoModeBadge } from "@/components/ui/demo-mode-badge";
import { Button } from "@/components/ui/button";
import { TutorCard } from "@/components/tutoring/tutor-card";
import { tutors } from "@/lib/mock-data";
import { TUTORING_SUBJECTS } from "@/lib/constants";
import { isDemoDataEnabledWithOverride } from "@/lib/product-mode";

const SUBJECT_OPTIONS = TUTORING_SUBJECTS.map((subject) => ({
  id: subject,
  label: subject,
}));

function TutoringPageContent() {
  const searchParams = useSearchParams();
  const demoEnabled = isDemoDataEnabledWithOverride(searchParams);
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState<string | "all">("all");

  const sourceTutors = useMemo(
    () => (demoEnabled ? tutors : []),
    [demoEnabled]
  );

  const filtered = useMemo(
    () =>
      sourceTutors.filter((t) => {
        const matchesSearch =
          !search ||
          t.user.name.toLowerCase().includes(search.toLowerCase()) ||
          t.subjects.some((s) => s.toLowerCase().includes(search.toLowerCase()));
        const matchesSubject = subject === "all" || t.subjects.includes(subject);
        return matchesSearch && matchesSubject;
      }),
    [sourceTutors, search, subject]
  );

  const isRealEmpty = !demoEnabled && sourceTutors.length === 0;

  return (
    <AppShell>
      <div className="mb-6 space-y-2">
        <SectionHeading
          title="Tutoring"
          subtitle="Book verified student tutors by subject"
        />
        <DemoModeBadge />
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
          {filtered.map((tutor) => (
            <TutorCard key={tutor.id} tutor={tutor} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={BookOpen}
          title={isRealEmpty ? "No tutors listed yet" : "No tutors match your search"}
          description={
            isRealEmpty
              ? "Verified students will soon be able to offer tutoring by subject."
              : "Try a different subject or search term."
          }
          action={
            isRealEmpty ? (
              <Button variant="outline" disabled>
                Coming soon
              </Button>
            ) : undefined
          }
        />
      )}
    </AppShell>
  );
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
