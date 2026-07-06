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
import { DemoModeBadge } from "@/components/ui/demo-mode-badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { DiscountCard } from "@/components/discounts/discount-card";
import { BrowseResultBar } from "@/components/browse/browse-result-bar";
import { BrowseEmptyState } from "@/components/browse/browse-empty-state";
import { BrowseSortSelect } from "@/components/browse/browse-sort-select";
import { useBrowseUrlState } from "@/hooks/use-browse-url-state";
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
  STUDENT_DISCOUNT_SORT_OPTIONS,
  STUDENT_DISCOUNT_TYPE_LABELS,
  STUDENT_DISCOUNT_TYPE_OPTIONS,
  filterAndSortStudentDiscounts,
  isStudentDiscountFilterActive,
  mapMockDiscountCategoryToType,
  type StudentDiscountFilters,
  type StudentDiscountRecord,
  type StudentDiscountSortOption,
  type StudentDiscountType,
} from "@/lib/services/discounts-types";
import { DISCOUNT_CATEGORIES } from "@/lib/constants";

const DEMO_FILTER_OPTIONS = (() => {
  const seen = new Set<StudentDiscountType>();
  const options: Array<{ id: StudentDiscountType; label: string }> = [];
  for (const filter of DISCOUNT_CATEGORIES) {
    const id = mapMockDiscountCategoryToType(filter.id);
    if (seen.has(id)) continue;
    seen.add(id);
    options.push({ id, label: STUDENT_DISCOUNT_TYPE_LABELS[id] ?? filter.label });
  }
  return options;
})();

type DiscountsBrowseUiState = {
  query: string;
  discountType: StudentDiscountType | "all";
  onlineOnly: boolean;
  localOnly: boolean;
  expiringSoon: boolean;
  sort: StudentDiscountSortOption;
};

const DEFAULT_DISCOUNTS_BROWSE: DiscountsBrowseUiState = {
  query: "",
  discountType: "all",
  onlineOnly: false,
  localOnly: false,
  expiringSoon: false,
  sort: "newest",
};

function parseDiscountsParams(params: URLSearchParams): Partial<DiscountsBrowseUiState> {
  return {
    query: params.get("search") ?? "",
    discountType: (params.get("discountType") as StudentDiscountType | "all") ?? "all",
    onlineOnly: params.get("onlineOnly") === "true",
    localOnly: params.get("localOnly") === "true",
    expiringSoon: params.get("expiringSoon") === "true",
    sort: (params.get("sort") as StudentDiscountSortOption) ?? "newest",
  };
}

function serializeDiscountsState(state: DiscountsBrowseUiState) {
  return {
    search: state.query,
    discountType: state.discountType,
    onlineOnly: state.onlineOnly ? "true" : undefined,
    localOnly: state.localOnly ? "true" : undefined,
    expiringSoon: state.expiringSoon ? "true" : undefined,
    sort: state.sort,
  };
}

function browseUiToFilters(state: DiscountsBrowseUiState): StudentDiscountFilters {
  return {
    query: state.query,
    discountType: state.discountType,
    onlineOnly: state.onlineOnly,
    localOnly: state.localOnly,
    expiringSoon: state.expiringSoon,
    sort: state.sort,
  };
}

function DiscountsBrowseFilters({
  state,
  onChange,
  demoMode = false,
}: {
  state: DiscountsBrowseUiState;
  onChange: (patch: Partial<DiscountsBrowseUiState>) => void;
  demoMode?: boolean;
}) {
  return (
    <div className="mb-4 space-y-3" data-testid="discounts-browse-filters">
      <SearchBar
        placeholder={
          demoMode
            ? "Search businesses or deals..."
            : "Search businesses, deals, or promo codes..."
        }
        value={state.query}
        onChange={(query) => onChange({ query })}
        ariaLabel="Search discounts"
      />

      {demoMode ? (
        <FilterChips
          options={DEMO_FILTER_OPTIONS}
          value={state.discountType}
          onChange={(discountType) => onChange({ discountType })}
          allLabel="All Deals"
        />
      ) : (
        <div className="flex flex-wrap items-center gap-4">
          <select
            value={state.discountType}
            onChange={(event) =>
              onChange({ discountType: event.target.value as StudentDiscountType | "all" })
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
              checked={state.onlineOnly}
              onChange={(event) => {
                onChange({
                  onlineOnly: event.target.checked,
                  localOnly: event.target.checked ? false : state.localOnly,
                });
              }}
              className="rounded border-white/20"
            />
            Online only
          </label>
          <label className="flex items-center gap-2 text-sm text-muted">
            <input
              type="checkbox"
              checked={state.localOnly}
              onChange={(event) => {
                onChange({
                  localOnly: event.target.checked,
                  onlineOnly: event.target.checked ? false : state.onlineOnly,
                });
              }}
              className="rounded border-white/20"
            />
            Local only
          </label>
          <label className="flex items-center gap-2 text-sm text-muted">
            <input
              type="checkbox"
              checked={state.expiringSoon}
              onChange={(event) => onChange({ expiringSoon: event.target.checked })}
              className="rounded border-white/20"
            />
            Expiring soon
          </label>
          <BrowseSortSelect
            value={state.sort}
            options={STUDENT_DISCOUNT_SORT_OPTIONS}
            onChange={(sort) => onChange({ sort: sort as StudentDiscountSortOption })}
          />
        </div>
      )}

      {demoMode && (
        <BrowseSortSelect
          value={state.sort}
          options={STUDENT_DISCOUNT_SORT_OPTIONS}
          onChange={(sort) => onChange({ sort: sort as StudentDiscountSortOption })}
        />
      )}
    </div>
  );
}

function RealDiscountsBrowse() {
  const { isAuthenticated } = useAuth();
  const [discounts, setDiscounts] = useState<StudentDiscountRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [browseState, setBrowseState, resetBrowseState] = useBrowseUrlState({
    defaults: DEFAULT_DISCOUNTS_BROWSE,
    parse: parseDiscountsParams,
    serialize: serializeDiscountsState,
  });

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

  const filters = useMemo(() => browseUiToFilters(browseState), [browseState]);
  const filtered = useMemo(
    () => filterAndSortStudentDiscounts(discounts, filters),
    [discounts, filters]
  );
  const filtersActive = isStudentDiscountFilterActive(filters);
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

      <DiscountsBrowseFilters state={browseState} onChange={setBrowseState} />

      <BrowseResultBar
        count={filtered.length}
        singular="discount"
        plural="discounts"
        filtersActive={filtersActive}
        onReset={resetBrowseState}
      />

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
        <BrowseEmptyState
          icon={Tag}
          totalCount={discounts.length}
          filteredCount={filtered.length}
          filtersActive={filtersActive}
          moduleLabel="discount"
          moduleLabelPlural="discounts"
          emptyAllTitle="No discounts posted yet"
          emptyAllDescription="Post a student deal, promo code, or local UCF-friendly offer."
          emptyFilterTitle="No discounts match your filters"
          emptyFilterDescription="Try clearing search or changing category or deal filters."
          onReset={resetBrowseState}
          createAction={
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
  const [browseState, setBrowseState, resetBrowseState] = useBrowseUrlState({
    defaults: DEFAULT_DISCOUNTS_BROWSE,
    parse: parseDiscountsParams,
    serialize: serializeDiscountsState,
  });

  const sourceDiscounts = useMemo(
    () =>
      demoEnabled
        ? studentDiscounts.map((discount, index) =>
            mapMockStudentDiscountToRecord(discount, index)
          )
        : [],
    [demoEnabled]
  );

  const filters = useMemo(() => browseUiToFilters(browseState), [browseState]);
  const filtered = useMemo(
    () => filterAndSortStudentDiscounts(sourceDiscounts, filters),
    [sourceDiscounts, filters]
  );
  const filtersActive = isStudentDiscountFilterActive(filters);
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

      <DiscountsBrowseFilters state={browseState} onChange={setBrowseState} demoMode />

      {demoEnabled && (
        <BrowseResultBar
          count={filtered.length}
          singular="discount"
          plural="discounts"
          filtersActive={filtersActive}
          onReset={resetBrowseState}
        />
      )}

      {filtered.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((discount) => (
            <DiscountCard key={discount.id} discount={discount} />
          ))}
        </div>
      ) : (
        <BrowseEmptyState
          icon={Tag}
          totalCount={sourceDiscounts.length}
          filteredCount={filtered.length}
          filtersActive={filtersActive}
          moduleLabel="discount"
          moduleLabelPlural="discounts"
          emptyAllTitle="No discounts posted yet"
          emptyAllDescription="Post a student deal, promo code, or local UCF-friendly offer."
          emptyFilterTitle="No deals match your search"
          emptyFilterDescription="Try a different search or category."
          onReset={resetBrowseState}
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
