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
import { DemoModeBadge } from "@/components/ui/demo-mode-badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { EventCard } from "@/components/events/event-card";
import { BrowseResultBar } from "@/components/browse/browse-result-bar";
import { BrowseEmptyState } from "@/components/browse/browse-empty-state";
import { BrowseSortSelect } from "@/components/browse/browse-sort-select";
import { useBrowseUrlState } from "@/hooks/use-browse-url-state";
import { EVENT_FILTERS } from "@/lib/constants";
import { isDemoDataEnabledWithOverride } from "@/lib/product-mode";
import { usesSupabaseEvents } from "@/lib/events-mode";
import { useAuth } from "@/components/providers/auth-provider";
import { buildSignInUrl } from "@/lib/auth";
import { campusEvents } from "@/lib/mock-data";
import { getCampusEvents, mapMockCampusEventToRecord } from "@/lib/services/events-service";
import {
  CAMPUS_EVENT_SORT_OPTIONS,
  CAMPUS_EVENT_TYPE_OPTIONS,
  filterAndSortCampusEvents,
  isCampusEventFilterActive,
  mapMockEventTypeToCampusEventType,
  type CampusEventFilters,
  type CampusEventRecord,
  type CampusEventSortOption,
  type CampusEventType,
} from "@/lib/services/events-types";

const DEMO_FILTER_OPTIONS = EVENT_FILTERS.map((filter) => ({
  id: mapMockEventTypeToCampusEventType(filter.id),
  label: filter.label,
}));

type EventsBrowseUiState = {
  query: string;
  eventType: CampusEventType | "all";
  location: string;
  upcomingOnly: boolean;
  sort: CampusEventSortOption;
};

const DEFAULT_EVENTS_BROWSE_REAL: EventsBrowseUiState = {
  query: "",
  eventType: "all",
  location: "",
  upcomingOnly: true,
  sort: "upcoming",
};

const DEFAULT_EVENTS_BROWSE_DEMO: EventsBrowseUiState = {
  query: "",
  eventType: "all",
  location: "",
  upcomingOnly: false,
  sort: "upcoming",
};

function parseEventsParams(
  params: URLSearchParams,
  defaults: EventsBrowseUiState
): Partial<EventsBrowseUiState> {
  const upcomingParam = params.get("upcomingOnly");
  return {
    query: params.get("search") ?? "",
    eventType: (params.get("eventType") as CampusEventType | "all") ?? "all",
    location: params.get("location") ?? "",
    upcomingOnly:
      upcomingParam === null ? defaults.upcomingOnly : upcomingParam !== "false",
    sort: (params.get("sort") as CampusEventSortOption) ?? defaults.sort,
  };
}

function serializeEventsState(state: EventsBrowseUiState, defaults: EventsBrowseUiState) {
  return {
    search: state.query,
    eventType: state.eventType,
    location: state.location,
    upcomingOnly: state.upcomingOnly === defaults.upcomingOnly ? undefined : String(state.upcomingOnly),
    sort: state.sort,
  };
}

function browseUiToFilters(state: EventsBrowseUiState): CampusEventFilters {
  return {
    query: state.query,
    eventType: state.eventType,
    location: state.location,
    upcomingOnly: state.upcomingOnly,
    sort: state.sort,
  };
}

function EventsBrowseFilters({
  state,
  onChange,
  demoMode = false,
}: {
  state: EventsBrowseUiState;
  onChange: (patch: Partial<EventsBrowseUiState>) => void;
  demoMode?: boolean;
}) {
  return (
    <div className="mb-4 space-y-3" data-testid="events-browse-filters">
      <div className={demoMode ? undefined : "grid gap-3 lg:grid-cols-3"}>
        <div className={demoMode ? undefined : "lg:col-span-2"}>
          <SearchBar
            placeholder="Search events, clubs, or locations..."
            value={state.query}
            onChange={(query) => onChange({ query })}
            ariaLabel="Search events"
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
          value={state.eventType}
          onChange={(eventType) => onChange({ eventType })}
          allLabel="All events"
        />
      ) : (
        <div className="flex flex-wrap items-center gap-4">
          <select
            value={state.eventType}
            onChange={(event) =>
              onChange({ eventType: event.target.value as CampusEventType | "all" })
            }
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
              checked={state.upcomingOnly}
              onChange={(event) => onChange({ upcomingOnly: event.target.checked })}
              className="rounded border-white/20"
            />
            Upcoming only
          </label>
          <BrowseSortSelect
            value={state.sort}
            options={CAMPUS_EVENT_SORT_OPTIONS}
            onChange={(sort) => onChange({ sort: sort as CampusEventSortOption })}
          />
        </div>
      )}

      {demoMode && (
        <BrowseSortSelect
          value={state.sort}
          options={CAMPUS_EVENT_SORT_OPTIONS}
          onChange={(sort) => onChange({ sort: sort as CampusEventSortOption })}
        />
      )}
    </div>
  );
}

function RealEventsBrowse() {
  const { isAuthenticated } = useAuth();
  const [events, setEvents] = useState<CampusEventRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [browseState, setBrowseState, resetBrowseState] = useBrowseUrlState({
    defaults: DEFAULT_EVENTS_BROWSE_REAL,
    parse: (params) => parseEventsParams(params, DEFAULT_EVENTS_BROWSE_REAL),
    serialize: (state) => serializeEventsState(state, DEFAULT_EVENTS_BROWSE_REAL),
  });

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

  const filters = useMemo(() => browseUiToFilters(browseState), [browseState]);
  const filtered = useMemo(
    () => filterAndSortCampusEvents(events, filters),
    [events, filters]
  );
  const filtersActive = isCampusEventFilterActive(filters);
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

      <EventsBrowseFilters state={browseState} onChange={setBrowseState} />

      <BrowseResultBar
        count={filtered.length}
        singular="event"
        plural="events"
        filtersActive={filtersActive}
        onReset={resetBrowseState}
      />

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
        <BrowseEmptyState
          icon={Calendar}
          totalCount={events.length}
          filteredCount={filtered.length}
          filtersActive={filtersActive}
          moduleLabel="event"
          moduleLabelPlural="events"
          emptyAllTitle="No events posted yet"
          emptyAllDescription="Post a club meeting, study session, career event, or campus hangout."
          emptyFilterTitle="No events match your filters"
          emptyFilterDescription="Try clearing search or changing event type, location, or date filters."
          onReset={resetBrowseState}
          createAction={
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
  const [browseState, setBrowseState, resetBrowseState] = useBrowseUrlState({
    defaults: DEFAULT_EVENTS_BROWSE_DEMO,
    parse: (params) => parseEventsParams(params, DEFAULT_EVENTS_BROWSE_DEMO),
    serialize: (state) => serializeEventsState(state, DEFAULT_EVENTS_BROWSE_DEMO),
  });

  const sourceEvents = useMemo(
    () =>
      demoEnabled
        ? campusEvents.map((event, index) => mapMockCampusEventToRecord(event, index))
        : [],
    [demoEnabled]
  );

  const filters = useMemo(() => browseUiToFilters(browseState), [browseState]);
  const filtered = useMemo(
    () => filterAndSortCampusEvents(sourceEvents, filters),
    [sourceEvents, filters]
  );
  const filtersActive = isCampusEventFilterActive(filters);
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
          <EventsBrowseFilters state={browseState} onChange={setBrowseState} demoMode />
          <BrowseResultBar
            count={filtered.length}
            singular="event"
            plural="events"
            filtersActive={filtersActive}
            onReset={resetBrowseState}
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
        <BrowseEmptyState
          icon={Calendar}
          totalCount={sourceEvents.length}
          filteredCount={filtered.length}
          filtersActive={filtersActive}
          moduleLabel="event"
          moduleLabelPlural="events"
          emptyAllTitle="No events posted yet"
          emptyAllDescription="Post a club meeting, study session, career event, or campus hangout."
          emptyFilterTitle="No events match your search"
          emptyFilterDescription="Try a different search or filter."
          onReset={resetBrowseState}
          createAction={
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
