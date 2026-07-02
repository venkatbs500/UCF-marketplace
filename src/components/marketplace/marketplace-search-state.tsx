"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { ListingSortOption, MarketplaceCategory, ListingCondition } from "@/lib/types";
import { SearchBar } from "@/components/ui/search-bar";
import { FilterChips } from "@/components/ui/filter-chips";
import {
  CAMPUS_AREA_FILTER_OPTIONS,
  CONDITION_FILTER_OPTIONS,
  LISTING_SORT_OPTIONS,
} from "@/lib/marketplace-utils";
import { cn } from "@/lib/utils";
import { MarketplaceFilters } from "./marketplace-filters";

export type MarketplaceSearchState = {
  search: string;
  category: MarketplaceCategory | "all";
  condition: ListingCondition | "all";
  campusArea: string;
  sort: ListingSortOption;
};

export const DEFAULT_MARKETPLACE_SEARCH: MarketplaceSearchState = {
  search: "",
  category: "all",
  condition: "all",
  campusArea: "all",
  sort: "newest",
};

interface MarketplaceSearchControlsProps {
  state: MarketplaceSearchState;
  onChange: (patch: Partial<MarketplaceSearchState>) => void;
}

export function MarketplaceSearchControls({
  state,
  onChange,
}: MarketplaceSearchControlsProps) {
  const [sortOpen, setSortOpen] = useState(false);
  const sortLabel =
    LISTING_SORT_OPTIONS.find((o) => o.id === state.sort)?.label ?? "Newest";

  const conditionOptions = CONDITION_FILTER_OPTIONS.filter((o) => o.id !== "all");
  const campusOptions = CAMPUS_AREA_FILTER_OPTIONS.filter((o) => o.id !== "all");

  return (
    <div className="space-y-4">
      <SearchBar
        placeholder="Search title, description, location, tags..."
        value={state.search}
        onChange={(search) => onChange({ search })}
        ariaLabel="Search marketplace"
      />

      <MarketplaceFilters
        activeCategory={state.category}
        onCategoryChange={(category) => onChange({ category })}
      />

      <FilterChips
        options={conditionOptions}
        value={state.condition}
        onChange={(condition) =>
          onChange({ condition: condition as ListingCondition | "all" })
        }
        allLabel="All Conditions"
        size="sm"
      />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <FilterChips
          options={campusOptions}
          value={state.campusArea}
          onChange={(campusArea) => onChange({ campusArea })}
          allLabel="All Areas"
          size="sm"
        />

        <div className="relative">
          <button
            type="button"
            onClick={() => setSortOpen(!sortOpen)}
            className="flex shrink-0 items-center gap-2 rounded-2xl glass-card px-4 py-2 text-sm text-muted hover:text-foreground"
          >
            Sort: {sortLabel}
            <ChevronDown
              className={cn("h-4 w-4 transition-transform", sortOpen && "rotate-180")}
            />
          </button>
          {sortOpen && (
            <div className="absolute right-0 top-full z-20 mt-2 w-48 rounded-2xl glass-card border border-white/10 p-2 shadow-xl">
              {LISTING_SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    onChange({ sort: opt.id });
                    setSortOpen(false);
                  }}
                  className={cn(
                    "w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-white/5",
                    state.sort === opt.id && "bg-gold/10 text-gold"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
