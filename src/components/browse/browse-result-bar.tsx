"use client";

import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatResultCount } from "@/lib/browse-utils";
import { BrowseSortSelect } from "./browse-sort-select";

type SortOption = { id: string; label: string };

type BrowseResultBarProps = {
  count: number;
  singular: string;
  plural?: string;
  filtersActive?: boolean;
  onReset?: () => void;
  sort?: string;
  sortOptions?: SortOption[];
  onSortChange?: (sort: string) => void;
  testId?: string;
};

export function BrowseResultBar({
  count,
  singular,
  plural,
  filtersActive = false,
  onReset,
  sort,
  sortOptions,
  onSortChange,
  testId = "browse-result-bar",
}: BrowseResultBarProps) {
  const showReset = filtersActive && onReset;
  const showSort = sortOptions && sortOptions.length > 0 && sort && onSortChange;

  return (
    <div
      className="mb-4 flex flex-wrap items-center justify-between gap-3"
      data-testid={testId}
    >
      <p className="text-sm text-muted" data-testid="browse-result-count">
        {count === 0
          ? filtersActive
            ? `No ${plural ?? `${singular}s`} match your filters`
            : `No ${plural ?? `${singular}s`} found`
          : formatResultCount(count, singular, plural)}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {showReset && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="gap-1.5"
            onClick={onReset}
            data-testid="browse-reset-filters"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset filters
          </Button>
        )}
        {showSort && (
          <BrowseSortSelect
            value={sort}
            options={sortOptions}
            onChange={onSortChange}
          />
        )}
      </div>
    </div>
  );
}
