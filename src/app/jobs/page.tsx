"use client";

import { useMemo, useState } from "react";
import { Briefcase } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { SectionHeading } from "@/components/ui/section-heading";
import { SearchBar } from "@/components/ui/search-bar";
import { FilterChips } from "@/components/ui/filter-chips";
import { EmptyState } from "@/components/ui/empty-state";
import { DemoModeBadge } from "@/components/ui/demo-mode-badge";
import { Button } from "@/components/ui/button";
import { JobCard } from "@/components/jobs/job-card";
import { campusJobs } from "@/lib/mock-data";
import { JOB_FILTERS } from "@/lib/constants";
import { isDemoDataEnabled } from "@/lib/product-mode";
import type { JobType } from "@/lib/types";

export default function JobsPage() {
  const demoEnabled = isDemoDataEnabled();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<JobType | "all">("all");

  const sourceJobs = useMemo(
    () => (demoEnabled ? campusJobs : []),
    [demoEnabled]
  );

  const filtered = useMemo(
    () =>
      sourceJobs.filter((j) => {
        const matchesSearch =
          !search ||
          j.title.toLowerCase().includes(search.toLowerCase()) ||
          j.company.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === "all" || j.type === filter;
        return matchesSearch && matchesFilter;
      }),
    [sourceJobs, search, filter]
  );

  const isRealEmpty = !demoEnabled && sourceJobs.length === 0;

  return (
    <AppShell>
      <div className="mb-6 space-y-2">
        <SectionHeading
          title="Campus Jobs"
          subtitle="Gigs, part-time, research, and freelance opportunities"
        />
        <DemoModeBadge />
      </div>

      {demoEnabled && (
        <>
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
          title={isRealEmpty ? "No campus jobs posted yet" : "No jobs match your search"}
          description={
            isRealEmpty
              ? "Verified employers and students will be able to post gigs, research roles, and part-time opportunities here soon."
              : "Try a different search or filter."
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
