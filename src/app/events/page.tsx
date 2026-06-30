"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { SectionHeading } from "@/components/ui/section-heading";
import { SearchBar } from "@/components/ui/search-bar";
import { FilterChips } from "@/components/ui/filter-chips";
import { EventCard } from "@/components/events/event-card";
import { campusEvents } from "@/lib/mock-data";
import { EVENT_FILTERS } from "@/lib/constants";
import type { EventType } from "@/lib/types";

export default function EventsPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<EventType | "all">("all");

  const filtered = campusEvents.filter((e) => {
    const matchesSearch =
      !search ||
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.host.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || e.type === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <AppShell>
      <SectionHeading
        title="Events"
        subtitle="Hackathons, career fairs, club events, sports, and more"
      />

      <div className="mb-6">
        <SearchBar
          placeholder="Search events, clubs, or locations..."
          value={search}
          onChange={setSearch}
        />
      </div>

      <FilterChips
        options={EVENT_FILTERS}
        value={filter}
        onChange={setFilter}
        allLabel="All Events"
        className="mb-8"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </AppShell>
  );
}
