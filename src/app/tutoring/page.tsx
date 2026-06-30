"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { SectionHeading } from "@/components/ui/section-heading";
import { SearchBar } from "@/components/ui/search-bar";
import { FilterChips } from "@/components/ui/filter-chips";
import { TutorCard } from "@/components/tutoring/tutor-card";
import { tutors } from "@/lib/mock-data";
import { TUTORING_SUBJECTS } from "@/lib/constants";

const SUBJECT_OPTIONS = TUTORING_SUBJECTS.map((subject) => ({
  id: subject,
  label: subject,
}));

export default function TutoringPage() {
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState<string | "all">("all");

  const filtered = tutors.filter((t) => {
    const matchesSearch =
      !search ||
      t.user.name.toLowerCase().includes(search.toLowerCase()) ||
      t.subjects.some((s) => s.toLowerCase().includes(search.toLowerCase()));
    const matchesSubject = subject === "all" || t.subjects.includes(subject);
    return matchesSearch && matchesSubject;
  });

  return (
    <AppShell>
      <SectionHeading
        title="Tutoring"
        subtitle="Book verified student tutors by subject"
      />

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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((tutor) => (
          <TutorCard key={tutor.id} tutor={tutor} />
        ))}
      </div>
    </AppShell>
  );
}
