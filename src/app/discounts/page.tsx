"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PlusCircle, Shield, Tag } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { SectionHeading } from "@/components/ui/section-heading";
import { SearchBar } from "@/components/ui/search-bar";
import { FilterChips } from "@/components/ui/filter-chips";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { DemoModeBadge } from "@/components/ui/demo-mode-badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { DiscountCard } from "@/components/discounts/discount-card";
import { isDemoDataEnabledWithOverride } from "@/lib/product-mode";
import { usesSupabaseDiscounts } from "@/lib/discounts-mode";
import { useAuth } from "@/components/providers/auth-provider";
import { buildSignInUrl } from "@/lib/auth";
import { studentDiscounts } from "@/lib/mock-data";
import {
  getStudentDiscounts,
  mapMockStudentDiscountToRecord,
} from "@/lib/services/discounts-service";
import {
  STUDENT_DISCOUNT_TYPE_OPTIONS,
  filterStudentDiscounts,
  mapMockDiscountCategoryToType,
  type StudentDiscountFilters,
  type StudentDiscountRecord,
  type StudentDiscountType,
} from "@/lib/services/discounts-types";
import { DISCOUNT_CATEGORIES } from "@/lib/constants";

const DEMO_FILTER_OPTIONS = DISCOUNT_CATEGORIES.map((filter) => ({
  id: mapMockDiscountCategoryToType(filter.id),
  label: filter.label,
}));

function RealDiscountsBrowse() {
  const { isAuthenticated } = useAuth();
  const [discounts, setDiscounts] = useState<StudentDiscountRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [discountType, setDiscountType] = useState<StudentDiscountType | "all">("all");
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [localOnly, setLocalOnly] = useState(false);
  const [expiringSoon, setExpiringSoon] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void getStudentDiscounts().then((result) => {
      if (cancelled) return;
      setDiscounts(result.discounts);
      setError(result.error ?? null);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const filters: StudentDiscountFilters = useMemo(
    () => ({
      query,
      discountType,
      onlineOnly,
      localOnly,
      expiringSoon,
    }),
    [query, discountType, onlineOnly, localOnly, expiringSoon]
  );

  const filtered = useMemo(
    () => filterStudentDiscounts(discounts, filters),
    [discounts, filters]
  );
  const postHref = isAuthenticated ? "/discounts/new" : buildSignInUrl("/discounts/new");

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <SectionHeading
            title="Student discounts and deals"
            subtitle="Student-shared promos, local offers, and campus-friendly savings"
          />
        </div>
        <Link href={postHref}>
          <Button data-testid="post-discount-cta">
            <PlusCircle className="h-4 w-4" />
            Post a discount
          </Button>
        </Link>
      </div>

      <div className="mb-6 rounded-2xl border border-gold/20 bg-gold/5 p-4">
        <div className="flex items-start gap-3">
          <Shield className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
          <div className="space-y-1 text-sm text-muted">
            <p className="font-medium text-foreground">Discount safety</p>
            <p>Verify deals before paying.</p>
            <p>Be careful with off-platform links.</p>
            <p>Report suspicious discounts.</p>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <SearchBar
          placeholder="Search businesses, deals, or promo codes..."
          value={query}
          onChange={(value) => setQuery(value)}
        />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-4">
        <select
          value={discountType}
          onChange={(event) =>
            setDiscountType(event.target.value as StudentDiscountType | "all")
          }
          className="h-11 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm"
          aria-label="Discount category filter"
        >
          <option value="all">All categories</option>
          {STUDENT_DISCOUNT_TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm text-muted">
          <input
            type="checkbox"
            checked={onlineOnly}
            onChange={(event) => {
              setOnlineOnly(event.target.checked);
              if (event.target.checked) setLocalOnly(false);
            }}
            className="rounded border-white/20"
          />
          Online only
        </label>
        <label className="flex items-center gap-2 text-sm text-muted">
          <input
            type="checkbox"
            checked={localOnly}
            onChange={(event) => {
              setLocalOnly(event.target.checked);
              if (event.target.checked) setOnlineOnly(false);
            }}
            className="rounded border-white/20"
          />
          Local only
        </label>
        <label className="flex items-center gap-2 text-sm text-muted">
          <input
            type="checkbox"
            checked={expiringSoon}
            onChange={(event) => setExpiringSoon(event.target.checked)}
            className="rounded border-white/20"
          />
          Expiring soon
        </label>
      </div>

      {loading && <LoadingSpinner className="min-h-[30vh]" label="Loading discounts..." />}

      {error && !loading && (
        <p role="alert" className="mb-4 text-sm text-red-400">
          We could not load discounts. Please try again.
        </p>
      )}

      {!loading && filtered.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((discount) => (
            <DiscountCard key={discount.id} discount={discount} />
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <EmptyState
          icon={Tag}
          title="No discounts posted yet"
          description="Post a student deal, promo code, or local UCF-friendly offer."
          action={
            <Link href={postHref}>
              <Button>Post a discount</Button>
            </Link>
          }
        />
      )}
    </>
  );
}

function DemoDiscountsBrowse() {
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth();
  const demoEnabled = isDemoDataEnabledWithOverride(searchParams);
  const [query, setQuery] = useState("");
  const [discountType, setDiscountType] = useState<StudentDiscountType | "all">("all");

  const sourceDiscounts = useMemo(
    () =>
      demoEnabled
        ? studentDiscounts.map((discount, index) =>
            mapMockStudentDiscountToRecord(discount, index)
          )
        : [],
    [demoEnabled]
  );

  const filters: StudentDiscountFilters = useMemo(
    () => ({
      query,
      discountType,
    }),
    [query, discountType]
  );

  const filtered = useMemo(
    () => filterStudentDiscounts(sourceDiscounts, filters),
    [sourceDiscounts, filters]
  );
  const postHref = isAuthenticated ? "/discounts/new" : buildSignInUrl("/discounts/new");

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <SectionHeading
            title="Student discounts and deals"
            subtitle="Food, fitness, tech, printing, and more near campus"
          />
          <DemoModeBadge />
        </div>
        <Link href={postHref}>
          <Button data-testid="post-discount-cta">
            <PlusCircle className="h-4 w-4" />
            Post a discount
          </Button>
        </Link>
      </div>

      <div className="mb-6">
        <SearchBar
          placeholder="Search businesses or deals..."
          value={query}
          onChange={setQuery}
        />
      </div>

      <FilterChips
        options={DEMO_FILTER_OPTIONS}
        value={discountType}
        onChange={setDiscountType}
        allLabel="All Deals"
        className="mb-8"
      />

      {filtered.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((discount) => (
            <DiscountCard key={discount.id} discount={discount} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Tag}
          title={demoEnabled ? "No deals match your search" : "No discounts posted yet"}
          description={
            demoEnabled
              ? "Try a different search or category."
              : "Post a student deal, promo code, or local UCF-friendly offer."
          }
        />
      )}
    </>
  );
}

function DiscountsPageContent() {
  const supabaseMode = usesSupabaseDiscounts();
  return supabaseMode ? <RealDiscountsBrowse /> : <DemoDiscountsBrowse />;
}

export default function DiscountsPage() {
  return (
    <AppShell>
      <Suspense fallback={<LoadingSpinner className="min-h-[30vh]" label="Loading..." />}>
        <DiscountsPageContent />
      </Suspense>
    </AppShell>
  );
}
