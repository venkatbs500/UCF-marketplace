"use client";

type BrowseSortSelectProps = {
  value: string;
  options: Array<{ id: string; label: string }>;
  onChange: (value: string) => void;
  label?: string;
};

export function BrowseSortSelect({
  value,
  options,
  onChange,
  label = "Sort results",
}: BrowseSortSelectProps) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-10 min-w-[10rem] rounded-2xl border border-white/10 bg-white/5 px-3 text-sm"
      aria-label={label}
      data-testid="browse-sort-select"
    >
      {options.map((option) => (
        <option key={option.id} value={option.id}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
