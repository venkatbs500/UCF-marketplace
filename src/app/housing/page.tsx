"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Home, MapPin, PlusCircle, Users, Star, FileText } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { SectionHeading } from "@/components/ui/section-heading";
import { Tabs } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { DemoModeBadge } from "@/components/ui/demo-mode-badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { HousingCard } from "@/components/housing/housing-card";
import { RoommateCard } from "@/components/housing/roommate-card";
import { ApartmentReviewCard } from "@/components/housing/apartment-review-card";
import { BrowseResultBar } from "@/components/browse/browse-result-bar";
import { BrowseEmptyState } from "@/components/browse/browse-empty-state";
import {
  DEFAULT_HOUSING_BROWSE,
  HousingBrowseFilters,
  housingUiToFilters,
  isHousingBrowseActive,
  parseHousingBrowseParams,
  serializeHousingBrowseState,
} from "@/components/housing/housing-browse-filters";
import { useBrowseUrlState } from "@/hooks/use-browse-url-state";
import { HOUSING_TABS } from "@/lib/constants";
import {
  housingPosts,
  roommateProfiles,
  apartmentReviews,
} from "@/lib/mock-data";
import { isDemoDataEnabledWithOverride } from "@/lib/product-mode";
import { usesSupabaseHousing } from "@/lib/housing-mode";
import { useAuth } from "@/components/providers/auth-provider";
import { buildSignInUrl } from "@/lib/auth";
import { getHousingPosts, mapMockHousingPostToItem } from "@/lib/services/housing-service";
import {
  filterAndSortHousingPosts,
  type HousingPostItem,
} from "@/lib/services/housing-types";

function HousingTabEmpty({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <EmptyState icon={Icon} title={title} description={description} action={action} />
  );
}

function RealHousingBrowse() {
  const { isAuthenticated } = useAuth();
  const [posts, setPosts] = useState<HousingPostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [browseState, setBrowseState, resetBrowseState] = useBrowseUrlState({
    defaults: DEFAULT_HOUSING_BROWSE,
    parse: parseHousingBrowseParams,
    serialize: serializeHousingBrowseState,
  });

  useEffect(() => {
    let cancelled = false;
    void getHousingPosts().then((result) => {
      if (cancelled) return;
      setPosts(result.posts);
      setError(result.error ?? null);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const filters = useMemo(() => housingUiToFilters(browseState), [browseState]);
  const filtered = useMemo(
    () => filterAndSortHousingPosts(posts, filters),
    [posts, filters]
  );
  const filtersActive = isHousingBrowseActive(browseState);
  const postHref = isAuthenticated ? "/housing/new" : buildSignInUrl("/housing/new");

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <SectionHeading
            title="Find housing near UCF"
            subtitle="Subleases, rooms, and lease transfers from verified students"
          />
        </div>
        <Link href={postHref}>
          <Button data-testid="post-housing-cta">
            <PlusCircle className="h-4 w-4" />
            Post housing
          </Button>
        </Link>
      </div>

      <HousingBrowseFilters state={browseState} onChange={setBrowseState} />

      <BrowseResultBar
        count={filtered.length}
        singular="housing post"
        plural="housing posts"
        filtersActive={filtersActive}
        onReset={resetBrowseState}
      />

      {loading && <LoadingSpinner className="min-h-[30vh]" label="Loading housing posts..." />}

      {error && !loading && (
        <p role="alert" className="mb-4 text-sm text-red-400">
          We could not load housing posts. Please try again.
        </p>
      )}

      {!loading && filtered.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((post) => (
            <HousingCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <BrowseEmptyState
          icon={Home}
          totalCount={posts.length}
          filteredCount={filtered.length}
          filtersActive={filtersActive}
          moduleLabel="housing post"
          moduleLabelPlural="housing posts"
          emptyAllTitle="No housing posts yet"
          emptyAllDescription="Be the first to post a sublease, room, or apartment lead."
          emptyFilterTitle="No housing posts match your filters"
          emptyFilterDescription="Try clearing search or changing type or rent filters."
          onReset={resetBrowseState}
          createAction={
            <Link href={postHref}>
              <Button>Post housing</Button>
            </Link>
          }
        />
      )}

      <Card className="mt-8 flex flex-col items-center justify-center p-8 text-center">
        <Users className="mb-3 h-8 w-8 text-gold/50" />
        <h3 className="mb-1 font-semibold">Roommate matching is coming next</h3>
        <p className="text-sm text-muted">
          Housing Phase 1 covers student housing posts. Compatibility matching stays on the roadmap.
        </p>
      </Card>
    </>
  );
}

function DemoHousingBrowse() {
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth();
  const demoEnabled = isDemoDataEnabledWithOverride(searchParams);
  const [activeTab, setActiveTab] = useState("subleases");
  const [browseState, setBrowseState, resetBrowseState] = useBrowseUrlState({
    defaults: DEFAULT_HOUSING_BROWSE,
    parse: parseHousingBrowseParams,
    serialize: serializeHousingBrowseState,
  });
  const postHref = isAuthenticated ? "/housing/new" : buildSignInUrl("/housing/new");

  const allDemoPosts = useMemo(
    () => (demoEnabled ? housingPosts.map(mapMockHousingPostToItem) : []),
    [demoEnabled]
  );

  const tabPosts = useMemo(() => {
    if (activeTab === "subleases") {
      return allDemoPosts.filter((post) => post.type === "sublease");
    }
    if (activeTab === "transfers") {
      return allDemoPosts.filter((post) => post.type === "lease_transfer");
    }
    return [];
  }, [activeTab, allDemoPosts]);

  const filteredPosts = useMemo(
    () => filterAndSortHousingPosts(tabPosts, housingUiToFilters(browseState)),
    [tabPosts, browseState]
  );
  const filtersActive = isHousingBrowseActive(browseState);
  const showHousingFilters = demoEnabled && (activeTab === "subleases" || activeTab === "transfers");

  const roommates = demoEnabled ? roommateProfiles : [];
  const reviews = demoEnabled ? apartmentReviews : [];

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <SectionHeading
            title="Find housing near UCF"
            subtitle="Subleases, roommates, apartment reviews, and lease transfers"
          />
          <DemoModeBadge />
        </div>
        <Link href={postHref}>
          <Button data-testid="post-housing-cta">
            <PlusCircle className="h-4 w-4" />
            Post housing
          </Button>
        </Link>
      </div>

      <Tabs
        tabs={[...HOUSING_TABS]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        className="mb-6"
      />

      {showHousingFilters && (
        <>
          <HousingBrowseFilters state={browseState} onChange={setBrowseState} />
          <BrowseResultBar
            count={filteredPosts.length}
            singular="housing post"
            plural="housing posts"
            filtersActive={filtersActive}
            onReset={resetBrowseState}
          />
        </>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {activeTab === "subleases" &&
            (filteredPosts.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {filteredPosts.map((post) => (
                  <HousingCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <BrowseEmptyState
                icon={Home}
                totalCount={tabPosts.length}
                filteredCount={filteredPosts.length}
                filtersActive={filtersActive}
                moduleLabel="housing post"
                moduleLabelPlural="housing posts"
                emptyAllTitle="No housing posts yet"
                emptyAllDescription="Verified students will soon be able to post subleases and room openings near campus."
                emptyFilterTitle="No housing posts match your filters"
                emptyFilterDescription="Try clearing search or changing your filters."
                onReset={resetBrowseState}
              />
            ))}

          {activeTab === "roommates" &&
            (roommates.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {roommates.map((profile) => (
                  <RoommateCard key={profile.id} profile={profile} />
                ))}
              </div>
            ) : (
              <HousingTabEmpty
                icon={Users}
                title="Roommate matching is coming next"
                description="Compatibility-based roommate matching is not part of Housing Phase 1."
              />
            ))}

          {activeTab === "reviews" &&
            (reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <ApartmentReviewCard key={review.id} review={review} />
                ))}
              </div>
            ) : (
              <HousingTabEmpty
                icon={Star}
                title="No apartment reviews yet"
                description="Student-written apartment reviews will help you choose where to live near UCF."
              />
            ))}

          {activeTab === "transfers" &&
            (filteredPosts.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {filteredPosts.map((post) => (
                  <HousingCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <BrowseEmptyState
                icon={FileText}
                totalCount={tabPosts.length}
                filteredCount={filteredPosts.length}
                filtersActive={filtersActive}
                moduleLabel="housing post"
                moduleLabelPlural="housing posts"
                emptyAllTitle="No lease transfers yet"
                emptyAllDescription="Lease transfer posts will appear here when students publish them."
                emptyFilterTitle="No lease transfers match your filters"
                emptyFilterDescription="Try clearing search or changing your filters."
                onReset={resetBrowseState}
              />
            ))}
        </div>

        <Card className="flex h-64 flex-col items-center justify-center text-center lg:h-auto">
          <MapPin className="mb-3 h-10 w-10 text-gold/40" />
          <h3 className="mb-1 font-semibold">Campus Map</h3>
          <p className="text-sm text-muted">
            Interactive housing map coming soon. Browse listings near campus.
          </p>
        </Card>
      </div>
    </>
  );
}

function HousingPageContent() {
  const supabaseMode = usesSupabaseHousing();
  return (
    <AppShell>
      {supabaseMode ? <RealHousingBrowse /> : <DemoHousingBrowse />}
    </AppShell>
  );
}

export default function HousingPage() {
  return (
    <Suspense
      fallback={
        <AppShell>
          <SectionHeading title="Housing" subtitle="Loading..." />
        </AppShell>
      }
    >
      <HousingPageContent />
    </Suspense>
  );
}
