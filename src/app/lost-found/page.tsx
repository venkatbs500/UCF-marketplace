"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PlusCircle, Search, Shield } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { SectionHeading } from "@/components/ui/section-heading";
import { Tabs } from "@/components/ui/tabs";
import { SearchBar } from "@/components/ui/search-bar";
import { FilterChips } from "@/components/ui/filter-chips";
import { Button } from "@/components/ui/button";
import { DemoModeBadge } from "@/components/ui/demo-mode-badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { LostFoundCard } from "@/components/lost-found/lost-found-card";
import { BrowseResultBar } from "@/components/browse/browse-result-bar";
import { BrowseEmptyState } from "@/components/browse/browse-empty-state";
import { BrowseSortSelect } from "@/components/browse/browse-sort-select";
import { useBrowseUrlState } from "@/hooks/use-browse-url-state";
import { LOST_FOUND_CATEGORIES } from "@/lib/constants";
import { isDemoDataEnabledWithOverride } from "@/lib/product-mode";
import { usesSupabaseLostFound } from "@/lib/lost-found-mode";
import { useAuth } from "@/components/providers/auth-provider";
import { buildSignInUrl } from "@/lib/auth";
import { lostFoundItems } from "@/lib/mock-data";
import {
  getLostFoundItems,
  mapMockLostFoundItemToRecord,
} from "@/lib/services/lost-found-service";
import {
  filterAndSortLostFoundItems,
  isLostFoundFilterActive,
  LOST_FOUND_SORT_OPTIONS,
  type LostFoundCategory,
  type LostFoundItemFilters,
  type LostFoundItemRecord,
  type LostFoundItemType,
  type LostFoundSortOption,
} from "@/lib/services/lost-found-types";

type LostFoundBrowseUiState = {
  query: string;
  itemType: LostFoundItemType | "all";
  category: LostFoundCategory | "all";
  location: string;
  sort: LostFoundSortOption;
};

const DEFAULT_LOST_FOUND_BROWSE: LostFoundBrowseUiState = {
  query: "",
  itemType: "all",
  category: "all",
  location: "",
  sort: "newest",
};

function parseLostFoundParams(params: URLSearchParams): Partial<LostFoundBrowseUiState> {
  return {
    query: params.get("search") ?? "",
    itemType: (params.get("type") as LostFoundItemType | "all") ?? "all",
    category: (params.get("category") as LostFoundCategory | "all") ?? "all",
    location: params.get("location") ?? "",
    sort: (params.get("sort") as LostFoundSortOption) ?? "newest",
  };
}

function serializeLostFoundState(state: LostFoundBrowseUiState) {
  return {
    search: state.query,
    type: state.itemType,
    category: state.category,
    location: state.location,
    sort: state.sort,
  };
}

function browseUiToFilters(state: LostFoundBrowseUiState): LostFoundItemFilters {
  return {
    query: state.query,
    itemType: state.itemType,
    category: state.category,
    location: state.location,
    sort: state.sort,
  };
}

function LostFoundBrowseFilters({
  state,
  onChange,
  showLocation = true,
}: {
  state: LostFoundBrowseUiState;
  onChange: (patch: Partial<LostFoundBrowseUiState>) => void;
  showLocation?: boolean;
}) {
  return (
    <div className="mb-4 space-y-3" data-testid="lost-found-browse-filters">
      <Tabs
        tabs={[
          { id: "all", label: "All" },
          { id: "lost", label: "Lost" },
          { id: "found", label: "Found" },
        ]}
        activeTab={state.itemType}
        onTabChange={(tab) => onChange({ itemType: tab as LostFoundItemType | "all" })}
      />

      <div className={showLocation ? "grid gap-3 lg:grid-cols-3" : undefined}>
        <div className={showLocation ? "lg:col-span-2" : undefined}>
          <SearchBar
            placeholder="Search title, description, or location..."
            value={state.query}
            onChange={(query) => onChange({ query })}
            ariaLabel="Search lost and found"
          />
        </div>
        {showLocation && (
          <input
            type="text"
            placeholder="Filter by location/area"
            value={state.location}
            onChange={(event) => onChange({ location: event.target.value })}
            className="h-11 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm"
            aria-label="Location filter"
          />
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <BrowseSortSelect
          value={state.sort}
          options={LOST_FOUND_SORT_OPTIONS}
          onChange={(sort) => onChange({ sort: sort as LostFoundSortOption })}
        />
      </div>

      <FilterChips
        options={LOST_FOUND_CATEGORIES}
        value={state.category}
        onChange={(category) => onChange({ category })}
        allLabel="All categories"
        size="sm"
      />
    </div>
  );
}

function RealLostFoundBrowse() {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState<LostFoundItemRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [browseState, setBrowseState, resetBrowseState] = useBrowseUrlState({
    defaults: DEFAULT_LOST_FOUND_BROWSE,
    parse: parseLostFoundParams,
    serialize: serializeLostFoundState,
  });

  useEffect(() => {
    let cancelled = false;
    void getLostFoundItems().then((result) => {
      if (cancelled) return;
      setItems(result.items);
      setError(result.error ?? null);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const filters = useMemo(() => browseUiToFilters(browseState), [browseState]);
  const filtered = useMemo(
    () => filterAndSortLostFoundItems(items, filters),
    [items, filters]
  );
  const filtersActive = isLostFoundFilterActive(filters);
  const postHref = isAuthenticated ? "/lost-found/new" : buildSignInUrl("/lost-found/new");

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <SectionHeading
            title="Lost something? Found something?"
            subtitle="Help fellow students recover lost items on campus"
          />
        </div>
        <Link href={postHref}>
          <Button data-testid="post-lost-found-cta">
            <PlusCircle className="h-4 w-4" />
            Post lost/found item
          </Button>
        </Link>
      </div>

      <div className="mb-6 rounded-2xl border border-gold/20 bg-gold/5 p-4">
        <div className="flex items-start gap-3">
          <Shield className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
          <div className="space-y-1 text-sm text-muted">
            <p className="font-medium text-foreground">Safety & trust</p>
            <p>Do not share full identifying details publicly.</p>
            <p>Ask claimants to verify ownership before returning IDs or valuables.</p>
            <p>Meet in public campus areas.</p>
          </div>
        </div>
      </div>

      <LostFoundBrowseFilters state={browseState} onChange={setBrowseState} />

      <BrowseResultBar
        count={filtered.length}
        singular="item"
        plural="items"
        filtersActive={filtersActive}
        onReset={resetBrowseState}
      />

      {loading && <LoadingSpinner className="min-h-[30vh]" label="Loading lost & found items..." />}

      {error && !loading && (
        <p role="alert" className="mb-4 text-sm text-red-400">
          We could not load lost & found items. Please try again.
        </p>
      )}

      {!loading && filtered.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <LostFoundCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <BrowseEmptyState
          icon={Search}
          totalCount={items.length}
          filteredCount={filtered.length}
          filtersActive={filtersActive}
          moduleLabel="item"
          moduleLabelPlural="items"
          emptyAllTitle="No lost or found items yet"
          emptyAllDescription="Post an item to help UCF students recover what matters."
          emptyFilterTitle="No items match your filters"
          emptyFilterDescription="Try clearing search or changing tab, category, or location filters."
          onReset={resetBrowseState}
          createAction={
            <Link href={postHref}>
              <Button>Post lost/found item</Button>
            </Link>
          }
        />
      )}
    </>
  );
}

function DemoLostFoundBrowse() {
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth();
  const demoEnabled = isDemoDataEnabledWithOverride(searchParams);
  const [browseState, setBrowseState, resetBrowseState] = useBrowseUrlState({
    defaults: DEFAULT_LOST_FOUND_BROWSE,
    parse: parseLostFoundParams,
    serialize: serializeLostFoundState,
  });

  const sourceItems = useMemo(
    () => (demoEnabled ? lostFoundItems.map(mapMockLostFoundItemToRecord) : []),
    [demoEnabled]
  );

  const filters = useMemo(() => browseUiToFilters(browseState), [browseState]);
  const filtered = useMemo(
    () => filterAndSortLostFoundItems(sourceItems, filters),
    [sourceItems, filters]
  );
  const filtersActive = isLostFoundFilterActive(filters);
  const postHref = isAuthenticated ? "/lost-found/new" : buildSignInUrl("/lost-found/new");

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <SectionHeading
            title="Lost something? Found something?"
            subtitle="Help fellow students recover lost items on campus"
          />
          <DemoModeBadge />
        </div>
        <Link href={postHref}>
          <Button data-testid="post-lost-found-cta">
            <PlusCircle className="h-4 w-4" />
            Post lost/found item
          </Button>
        </Link>
      </div>

      <div className="mb-6 rounded-2xl border border-gold/20 bg-gold/5 p-4">
        <div className="flex items-start gap-3">
          <Shield className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
          <div className="space-y-1 text-sm text-muted">
            <p className="font-medium text-foreground">Safety & trust</p>
            <p>Always meet in public campus locations. Verify identity before returning items.</p>
          </div>
        </div>
      </div>

      {demoEnabled && (
        <>
          <LostFoundBrowseFilters
            state={browseState}
            onChange={setBrowseState}
            showLocation={false}
          />
          <BrowseResultBar
            count={filtered.length}
            singular="item"
            plural="items"
            filtersActive={filtersActive}
            onReset={resetBrowseState}
          />
        </>
      )}

      {filtered.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <LostFoundCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <BrowseEmptyState
          icon={Search}
          totalCount={sourceItems.length}
          filteredCount={filtered.length}
          filtersActive={filtersActive}
          moduleLabel="item"
          moduleLabelPlural="items"
          emptyAllTitle="No lost or found items yet"
          emptyAllDescription="Post an item to help UCF students recover what matters."
          emptyFilterTitle="No items match your filters"
          emptyFilterDescription="Try a different tab or category."
          onReset={resetBrowseState}
          createAction={
            !demoEnabled ? (
              <Link href={postHref}>
                <Button>Post lost/found item</Button>
              </Link>
            ) : undefined
          }
        />
      )}
    </>
  );
}

function LostFoundPageContent() {
  const supabaseMode = usesSupabaseLostFound();
  return <AppShell>{supabaseMode ? <RealLostFoundBrowse /> : <DemoLostFoundBrowse />}</AppShell>;
}

export default function LostFoundPage() {
  return (
    <Suspense
      fallback={
        <AppShell>
          <SectionHeading title="Lost & Found" subtitle="Loading..." />
        </AppShell>
      }
    >
      <LostFoundPageContent />
    </Suspense>
  );
}
