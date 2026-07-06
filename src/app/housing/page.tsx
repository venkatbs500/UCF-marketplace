"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Home, MapPin, PlusCircle, Users, Star, FileText } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { SectionHeading } from "@/components/ui/section-heading";
import { Tabs } from "@/components/ui/tabs";
import { SearchBar } from "@/components/ui/search-bar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { DemoModeBadge } from "@/components/ui/demo-mode-badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { HousingCard } from "@/components/housing/housing-card";
import { RoommateCard } from "@/components/housing/roommate-card";
import { ApartmentReviewCard } from "@/components/housing/apartment-review-card";
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
  filterHousingPosts,
  HOUSING_TYPE_OPTIONS,
  type HousingPostFilters,
  type HousingPostItem,
  type HousingPostType,
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
  const [query, setQuery] = useState("");
  const [type, setType] = useState<HousingPostType | "all">("all");
  const [minRent, setMinRent] = useState("");
  const [maxRent, setMaxRent] = useState("");

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

  const filters: HousingPostFilters = useMemo(
    () => ({
      query,
      type,
      minRent: minRent.trim() ? Number(minRent) : undefined,
      maxRent: maxRent.trim() ? Number(maxRent) : undefined,
    }),
    [query, type, minRent, maxRent]
  );

  const filtered = useMemo(() => filterHousingPosts(posts, filters), [posts, filters]);

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

      <div className="mb-6 grid gap-3 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <SearchBar
            placeholder="Search location, title, or tags..."
            value={query}
            onChange={(value) => setQuery(value)}
          />
        </div>
        <select
          value={type}
          onChange={(event) => setType(event.target.value as HousingPostType | "all")}
          className="h-11 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm"
          aria-label="Housing type filter"
        >
          <option value="all">All types</option>
          {HOUSING_TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            min="0"
            placeholder="Min rent"
            value={minRent}
            onChange={(event) => setMinRent(event.target.value)}
            className="h-11 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm"
            aria-label="Minimum rent"
          />
          <input
            type="number"
            min="0"
            placeholder="Max rent"
            value={maxRent}
            onChange={(event) => setMaxRent(event.target.value)}
            className="h-11 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm"
            aria-label="Maximum rent"
          />
        </div>
      </div>

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
        <HousingTabEmpty
          icon={Home}
          title="No housing posts yet"
          description="Be the first to post a sublease, room, or apartment lead."
          action={
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
  const postHref = isAuthenticated ? "/housing/new" : buildSignInUrl("/housing/new");

  const subleases = demoEnabled
    ? housingPosts
        .filter((p) => p.type === "sublease")
        .map(mapMockHousingPostToItem)
    : [];
  const transfers = demoEnabled
    ? housingPosts
        .filter((p) => p.type === "lease-transfer")
        .map(mapMockHousingPostToItem)
    : [];
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

      <div className="mb-6">
        <SearchBar placeholder="Search by location, price, or amenities..." />
      </div>

      <Tabs
        tabs={[...HOUSING_TABS]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        className="mb-8"
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {activeTab === "subleases" &&
            (subleases.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {subleases.map((post) => (
                  <HousingCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <HousingTabEmpty
                icon={Home}
                title="No housing posts yet"
                description="Verified students will soon be able to post subleases and room openings near campus."
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
            (transfers.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {transfers.map((post) => (
                  <HousingCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <HousingTabEmpty
                icon={FileText}
                title="No lease transfers yet"
                description="Lease transfer posts will appear here when students publish them."
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
