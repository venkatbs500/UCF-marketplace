"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { SectionHeading } from "@/components/ui/section-heading";
import { SearchBar } from "@/components/ui/search-bar";
import { FilterChips } from "@/components/ui/filter-chips";
import { JobCard } from "@/components/jobs/job-card";
import { campusJobs } from "@/lib/mock-data";
import { JOB_FILTERS } from "@/lib/constants";
import type { JobType } from "@/lib/types";

export default function JobsPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<JobType | "all">("all");

  const filtered = campusJobs.filter((j) => {
    const matchesSearch =
      !search ||
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.company.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || j.type === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <AppShell>
      <SectionHeading
        title="Campus Jobs"
        subtitle="Gigs, part-time, research, and freelance opportunities"
      />

      <div className="mb-6">
        <SearchBar
          placeholder="Search jobs, companies, or skills..."
          value={search}
          onChange={setSearch}
        />
      </div>

      <FilterChips
        options={JOB_FILTERS}
        value={filter}
        onChange={setFilter}
        allLabel="All Jobs"
        className="mb-8"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
    </AppShell>
  );
}
