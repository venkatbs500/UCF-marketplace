"use client";

import { filterChipClass } from "@/lib/filter-styles";
import { MARKETPLACE_CATEGORIES } from "@/lib/constants";
import type { MarketplaceCategory } from "@/lib/types";

interface MarketplaceFiltersProps {
  activeCategory: MarketplaceCategory | "all";
  onCategoryChange: (category: MarketplaceCategory | "all") => void;
}

export function MarketplaceFilters({
  activeCategory,
  onCategoryChange,
}: MarketplaceFiltersProps) {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
      <button
        type="button"
        onClick={() => onCategoryChange("all")}
        className={filterChipClass(activeCategory === "all", "md")}
      >
        All
      </button>
      {MARKETPLACE_CATEGORIES.map((cat) => (
        <button
          key={cat.id}
          type="button"
          onClick={() => onCategoryChange(cat.id)}
          className={`${filterChipClass(activeCategory === cat.id, "md")} shrink-0`}
        >
          {cat.emoji} {cat.label}
        </button>
      ))}
    </div>
  );
}
