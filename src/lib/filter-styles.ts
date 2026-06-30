import { cn } from "@/lib/utils";

/** Shared active/inactive chip styles used across filter UIs */
export function filterChipClass(active: boolean, size: "sm" | "md" = "md") {
  return cn(
    "rounded-2xl font-medium transition-all",
    size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm",
    active
      ? "gold-gradient text-black"
      : "glass-card text-muted hover:text-foreground"
  );
}
