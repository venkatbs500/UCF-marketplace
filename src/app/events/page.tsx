"use client";

import { useMemo, useState } from "react";
import { Calendar } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { SectionHeading } from "@/components/ui/section-heading";
import { SearchBar } from "@/components/ui/search-bar";
import { FilterChips } from "@/components/ui/filter-chips";
import { EmptyState } from "@/components/ui/empty-state";
import { DemoModeBadge } from "@/components/ui/demo-mode-badge";
import { Button } from "@/components/ui/button";
import { EventCard } from "@/components/events/event-card";
import { campusEvents } from "@/lib/mock-data";
import { EVENT_FILTERS } from "@/lib/constants";
import { isDemoDataEnabled } from "@/lib/product-mode";
import type { EventType } from "@/lib/types";

export default function EventsPage() {
  const demoEnabled = isDemoDataEnabled();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<EventType | "all">("all");

  const sourceEvents = useMemo(
    () => (demoEnabled ? campusEvents : []),
    [demoEnabled]
  );

  const filtered = useMemo(
    () =>
      sourceEvents.filter((e) => {
        const matchesSearch =
          !search ||
          e.title.toLowerCase().includes(search.toLowerCase()) ||
          e.host.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === "all" || e.type === filter;
        return matchesSearch && matchesFilter;
      }),
    [sourceEvents, search, filter]
  );

  const isRealEmpty = !demoEnabled && sourceEvents.length === 0;

  return (
    <AppShell>
      <div className="mb-6 space-y-2">
        <SectionHeading
          title="Events"
          subtitle="Hackathons, career fairs, club events, sports, and more"
        />
        <DemoModeBadge />
      </div>

      {demoEnabled && (
        <>
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
        </>
      )}

      {filtered.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Calendar}
          title={isRealEmpty ? "No events posted yet" : "No events match your search"}
          description={
            isRealEmpty
              ? "Club events, hackathons, career fairs, and campus meetups will appear here once real organizers start posting."
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
