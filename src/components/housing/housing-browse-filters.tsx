"use client";

import { SearchBar } from "@/components/ui/search-bar";
import { BrowseSortSelect } from "@/components/browse/browse-sort-select";
import {
  HOUSING_SORT_OPTIONS,
  HOUSING_TYPE_OPTIONS,
  type HousingPostType,
  type HousingSortOption,
} from "@/lib/services/housing-types";

export type HousingBrowseUiState = {
  query: string;
  type: HousingPostType | "all";
  minRent: string;
  maxRent: string;
  sort: HousingSortOption;
};

export const DEFAULT_HOUSING_BROWSE: HousingBrowseUiState = {
  query: "",
  type: "all",
  minRent: "",
  maxRent: "",
  sort: "newest",
};

type HousingBrowseFiltersProps = {
  state: HousingBrowseUiState;
  onChange: (patch: Partial<HousingBrowseUiState>) => void;
};

export function HousingBrowseFilters({
  state,
  onChange,
}: HousingBrowseFiltersProps) {
  return (
    <div className="mb-4 space-y-3" data-testid="housing-browse-filters">
      <SearchBar
        placeholder="Search location, title, or tags..."
        value={state.query}
        onChange={(query) => onChange({ query })}
        ariaLabel="Search housing"
      />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <select
          value={state.type}
          onChange={(event) => onChange({ type: event.target.value as HousingPostType | "all" })}
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
        <input
          type="number"
          min="0"
          placeholder="Min rent"
          value={state.minRent}
          onChange={(event) => onChange({ minRent: event.target.value })}
          className="h-11 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm"
          aria-label="Minimum rent"
        />
        <input
          type="number"
          min="0"
          placeholder="Max rent"
          value={state.maxRent}
          onChange={(event) => onChange({ maxRent: event.target.value })}
          className="h-11 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm"
          aria-label="Maximum rent"
        />
        <BrowseSortSelect
          value={state.sort}
          options={HOUSING_SORT_OPTIONS}
          onChange={(sort) => onChange({ sort: sort as HousingSortOption })}
        />
      </div>
    </div>
  );
}

export function housingUiToFilters(state: HousingBrowseUiState) {
  return {
    query: state.query,
    type: state.type,
    minRent: state.minRent.trim() ? Number(state.minRent) : undefined,
    maxRent: state.maxRent.trim() ? Number(state.maxRent) : undefined,
    sort: state.sort,
  };
}

export function parseHousingBrowseParams(params: URLSearchParams): Partial<HousingBrowseUiState> {
  return {
    query: params.get("search") ?? "",
    type: (params.get("type") as HousingPostType | "all") ?? "all",
    minRent: params.get("minRent") ?? "",
    maxRent: params.get("maxRent") ?? "",
    sort: (params.get("sort") as HousingSortOption) ?? "newest",
  };
}

export function serializeHousingBrowseState(state: HousingBrowseUiState) {
  return {
    search: state.query,
    type: state.type,
    minRent: state.minRent,
    maxRent: state.maxRent,
    sort: state.sort,
  };
}

export function isHousingBrowseActive(state: HousingBrowseUiState): boolean {
  return Boolean(
    state.query.trim() ||
      state.type !== "all" ||
      state.minRent.trim() ||
      state.maxRent.trim()
  );
}
