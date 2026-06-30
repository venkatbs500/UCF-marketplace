"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { SectionHeading } from "@/components/ui/section-heading";
import { SearchBar } from "@/components/ui/search-bar";
import { FilterChips } from "@/components/ui/filter-chips";
import { DiscountCard } from "@/components/discounts/discount-card";
import { studentDiscounts } from "@/lib/mock-data";
import { DISCOUNT_CATEGORIES } from "@/lib/constants";
import type { DiscountCategory } from "@/lib/types";

export default function DiscountsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<DiscountCategory | "all">("all");

  const filtered = studentDiscounts.filter((d) => {
    const matchesSearch =
      !search ||
      d.businessName.toLowerCase().includes(search.toLowerCase()) ||
      d.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "all" || d.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <AppShell>
      <SectionHeading
        title="Student Discounts"
        subtitle="Verified deals from local businesses near campus"
      />

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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((discount) => (
          <DiscountCard key={discount.id} discount={discount} />
        ))}
      </div>
    </AppShell>
  );
}
