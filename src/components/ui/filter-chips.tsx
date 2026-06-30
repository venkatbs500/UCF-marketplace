"use client";

import { filterChipClass } from "@/lib/filter-styles";
import { cn } from "@/lib/utils";

export type FilterChipOption<T extends string> = {
  id: T;
  label: string;
};

interface FilterChipsProps<T extends string> {
  options: readonly FilterChipOption<T>[];
  value: T | "all";
  onChange: (value: T | "all") => void;
  allLabel?: string;
  showAll?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export function FilterChips<T extends string>({
  options,
  value,
  onChange,
  allLabel = "All",
  showAll = true,
  size = "md",
  className,
}: FilterChipsProps<T>) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {showAll && (
        <button
          type="button"
          onClick={() => onChange("all")}
          className={filterChipClass(value === "all", size)}
        >
          {allLabel}
        </button>
      )}
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onChange(option.id)}
          className={filterChipClass(value === option.id, size)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
