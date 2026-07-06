"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Calendar, PlusCircle, Shield } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { SectionHeading } from "@/components/ui/section-heading";
import { SearchBar } from "@/components/ui/search-bar";
import { FilterChips } from "@/components/ui/filter-chips";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { DemoModeBadge } from "@/components/ui/demo-mode-badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { EventCard } from "@/components/events/event-card";
import { EVENT_FILTERS } from "@/lib/constants";
import { isDemoDataEnabledWithOverride } from "@/lib/product-mode";
import { usesSupabaseEvents } from "@/lib/events-mode";
import { useAuth } from "@/components/providers/auth-provider";
import { buildSignInUrl } from "@/lib/auth";
import { campusEvents } from "@/lib/mock-data";
import { getCampusEvents, mapMockCampusEventToRecord } from "@/lib/services/events-service";
import {
  CAMPUS_EVENT_TYPE_OPTIONS,
  filterCampusEvents,
  mapMockEventTypeToCampusEventType,
  type CampusEventFilters,
  type CampusEventRecord,
  type CampusEventType,
} from "@/lib/services/events-types";

const DEMO_FILTER_OPTIONS = EVENT_FILTERS.map((filter) => ({
  id: mapMockEventTypeToCampusEventType(filter.id),
  label: filter.label,
}));

function RealEventsBrowse() {
  const { isAuthenticated } = useAuth();
  const [events, setEvents] = useState<CampusEventRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [eventType, setEventType] = useState<CampusEventType | "all">("all");
  const [location, setLocation] = useState("");
  const [upcomingOnly, setUpcomingOnly] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void getCampusEvents().then((result) => {
      if (cancelled) return;
      setEvents(result.events);
      setError(result.error ?? null);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const filters: CampusEventFilters = useMemo(
    () => ({
      query,
      eventType,
      location,
      upcomingOnly,
    }),
    [query, eventType, location, upcomingOnly]
  );

  const filtered = useMemo(() => filterCampusEvents(events, filters), [events, filters]);
  const postHref = isAuthenticated ? "/events/new" : buildSignInUrl("/events/new");

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <SectionHeading
            title="Discover campus events"
            subtitle="Club meetings, study sessions, career events, and campus hangouts from verified students"
          />
        </div>
        <Link href={postHref}>
          <Button data-testid="post-event-cta">
            <PlusCircle className="h-4 w-4" />
            Post an event
          </Button>
        </Link>
      </div>

      <div className="mb-6 rounded-2xl border border-gold/20 bg-gold/5 p-4">
        <div className="flex items-start gap-3">
          <Shield className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
          <div className="space-y-1 text-sm text-muted">
            <p className="font-medium text-foreground">Event safety</p>
            <p>Meet in public campus spaces.</p>
            <p>Be careful with off-platform links.</p>
            <p>Report suspicious events.</p>
          </div>
        </div>
      </div>

      <div className="mb-4 grid gap-3 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SearchBar
            placeholder="Search events, clubs, or locations..."
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
          value={eventType}
          onChange={(event) => setEventType(event.target.value as CampusEventType | "all")}
          className="h-11 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm"
          aria-label="Event type filter"
        >
          <option value="all">All event types</option>
          {CAMPUS_EVENT_TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm text-muted">
          <input
            type="checkbox"
            checked={upcomingOnly}
            onChange={(event) => setUpcomingOnly(event.target.checked)}
            className="rounded border-white/20"
          />
          Upcoming only
        </label>
      </div>

      {loading && <LoadingSpinner className="min-h-[30vh]" label="Loading events..." />}

      {error && !loading && (
        <p role="alert" className="mb-4 text-sm text-red-400">
          We could not load events. Please try again.
        </p>
      )}

      {!loading && filtered.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <EmptyState
          icon={Calendar}
          title="No events posted yet"
          description="Post a club meeting, study session, career event, or campus hangout."
          action={
            <Link href={postHref}>
              <Button>Post an event</Button>
            </Link>
          }
        />
      )}
    </>
  );
}

function DemoEventsBrowse() {
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth();
  const demoEnabled = isDemoDataEnabledWithOverride(searchParams);
  const [query, setQuery] = useState("");
  const [eventType, setEventType] = useState<CampusEventType | "all">("all");

  const sourceEvents = useMemo(
    () =>
      demoEnabled
        ? campusEvents.map((event, index) => mapMockCampusEventToRecord(event, index))
        : [],
    [demoEnabled]
  );

  const filters: CampusEventFilters = useMemo(
    () => ({
      query,
      eventType,
      upcomingOnly: false,
    }),
    [query, eventType]
  );

  const filtered = useMemo(() => filterCampusEvents(sourceEvents, filters), [sourceEvents, filters]);
  const postHref = isAuthenticated ? "/events/new" : buildSignInUrl("/events/new");

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <SectionHeading
            title="Discover campus events"
            subtitle="Hackathons, career fairs, club events, sports, and more"
          />
          <DemoModeBadge />
        </div>
        <Link href={postHref}>
          <Button data-testid="post-event-cta">
            <PlusCircle className="h-4 w-4" />
            Post an event
          </Button>
        </Link>
      </div>

      {demoEnabled && (
        <>
          <div className="mb-6">
            <SearchBar
              placeholder="Search events, clubs, or locations..."
              value={query}
              onChange={(value) => setQuery(value)}
            />
          </div>

          <FilterChips
            options={DEMO_FILTER_OPTIONS}
            value={eventType}
            onChange={setEventType}
            allLabel="All events"
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
          title={demoEnabled ? "No events match your search" : "No events posted yet"}
          description={
            demoEnabled
              ? "Try a different search or filter."
              : "Post a club meeting, study session, career event, or campus hangout."
          }
          action={
            !demoEnabled ? (
              <Link href={postHref}>
                <Button>Post an event</Button>
              </Link>
            ) : undefined
          }
        />
      )}
    </>
  );
}

function EventsPageContent() {
  const supabaseMode = usesSupabaseEvents();
  return <AppShell>{supabaseMode ? <RealEventsBrowse /> : <DemoEventsBrowse />}</AppShell>;
}

export default function EventsPage() {
  return (
    <Suspense
      fallback={
        <AppShell>
          <SectionHeading title="Events" subtitle="Loading..." />
        </AppShell>
      }
    >
      <EventsPageContent />
    </Suspense>
  );
}
