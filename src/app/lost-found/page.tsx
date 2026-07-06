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
import { EmptyState } from "@/components/ui/empty-state";
import { DemoModeBadge } from "@/components/ui/demo-mode-badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { LostFoundCard } from "@/components/lost-found/lost-found-card";
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
  filterLostFoundItems,
  type LostFoundCategory,
  type LostFoundItemFilters,
  type LostFoundItemRecord,
  type LostFoundItemType,
} from "@/lib/services/lost-found-types";

function RealLostFoundBrowse() {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState<LostFoundItemRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<LostFoundCategory | "all">("all");
  const [location, setLocation] = useState("");

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

  const filters: LostFoundItemFilters = useMemo(
    () => ({
      query,
      itemType: activeTab as LostFoundItemType | "all",
      category,
      location,
    }),
    [query, activeTab, category, location]
  );

  const filtered = useMemo(() => filterLostFoundItems(items, filters), [items, filters]);
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

      <Tabs
        tabs={[
          { id: "all", label: "All" },
          { id: "lost", label: "Lost" },
          { id: "found", label: "Found" },
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        className="mb-4"
      />

      <div className="mb-4 grid gap-3 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SearchBar
            placeholder="Search title, description, or location..."
            value={query}
            onChange={(value) => setQuery(value)}
          />
        </div>
        <input
          type="text"
          placeholder="Filter by location/area"
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          className="h-11 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm"
          aria-label="Location filter"
        />
      </div>

      <FilterChips
        options={LOST_FOUND_CATEGORIES}
        value={category}
        onChange={setCategory}
        allLabel="All categories"
        size="sm"
        className="mb-6"
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
        <EmptyState
          icon={Search}
          title="No lost or found items yet"
          description="Post an item to help UCF students recover what matters."
          action={
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
  const [activeTab, setActiveTab] = useState("all");
  const [category, setCategory] = useState<LostFoundCategory | "all">("all");
  const [query, setQuery] = useState("");

  const sourceItems = useMemo(
    () => (demoEnabled ? lostFoundItems.map(mapMockLostFoundItemToRecord) : []),
    [demoEnabled]
  );

  const filters: LostFoundItemFilters = useMemo(
    () => ({
      query,
      itemType: activeTab as LostFoundItemType | "all",
      category,
    }),
    [query, activeTab, category]
  );

  const filtered = useMemo(() => filterLostFoundItems(sourceItems, filters), [sourceItems, filters]);
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
          <Tabs
            tabs={[
              { id: "all", label: "All" },
              { id: "lost", label: "Lost" },
              { id: "found", label: "Found" },
            ]}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            className="mb-4"
          />

          <div className="mb-4">
            <SearchBar
              placeholder="Search title, description, or location..."
              value={query}
              onChange={(value) => setQuery(value)}
            />
          </div>

          <FilterChips
            options={LOST_FOUND_CATEGORIES}
            value={category}
            onChange={setCategory}
            allLabel="All categories"
            size="sm"
            className="mb-6"
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
        <EmptyState
          icon={Search}
          title={demoEnabled ? "No items match your filters" : "No lost or found items yet"}
          description={
            demoEnabled
              ? "Try a different tab or category."
              : "Post an item to help UCF students recover what matters."
          }
          action={
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
