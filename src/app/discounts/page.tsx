"use client";

import { useMemo, useState } from "react";
import { Tag } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { SectionHeading } from "@/components/ui/section-heading";
import { SearchBar } from "@/components/ui/search-bar";
import { FilterChips } from "@/components/ui/filter-chips";
import { EmptyState } from "@/components/ui/empty-state";
import { DemoModeBadge } from "@/components/ui/demo-mode-badge";
import { Button } from "@/components/ui/button";
import { DiscountCard } from "@/components/discounts/discount-card";
import { studentDiscounts } from "@/lib/mock-data";
import { DISCOUNT_CATEGORIES } from "@/lib/constants";
import { isDemoDataEnabled } from "@/lib/product-mode";
import type { DiscountCategory } from "@/lib/types";

export default function DiscountsPage() {
  const demoEnabled = isDemoDataEnabled();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<DiscountCategory | "all">("all");

  const sourceDiscounts = useMemo(
    () => (demoEnabled ? studentDiscounts : []),
    [demoEnabled]
  );

  const filtered = useMemo(
    () =>
      sourceDiscounts.filter((d) => {
        const matchesSearch =
          !search ||
          d.businessName.toLowerCase().includes(search.toLowerCase()) ||
          d.description.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = category === "all" || d.category === category;
        return matchesSearch && matchesCategory;
      }),
    [sourceDiscounts, search, category]
  );

  const isRealEmpty = !demoEnabled && sourceDiscounts.length === 0;

  return (
    <AppShell>
      <div className="mb-6 space-y-2">
        <SectionHeading
          title="Student Discounts"
          subtitle="Verified deals from local businesses near campus"
        />
        <DemoModeBadge />
      </div>

      {demoEnabled && (
        <>
          <div className="mb-6">
            <SearchBar
              placeholder="Search businesses or deals..."
              value={search}
              onChange={setSearch}
            />
          </div>

          <FilterChips
            options={DISCOUNT_CATEGORIES}
            value={category}
            onChange={setCategory}
            allLabel="All Deals"
            className="mb-8"
          />
        </>
      )}

      {filtered.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((discount) => (
            <DiscountCard key={discount.id} discount={discount} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Tag}
          title={
            isRealEmpty ? "Student discounts are coming soon" : "No deals match your search"
          }
          description={
            isRealEmpty
              ? "Local businesses will be able to offer verified student deals here."
              : "Try a different search or category."
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
