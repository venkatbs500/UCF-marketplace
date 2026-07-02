import { Search } from "lucide-react";
import { Input } from "./input";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  value?: string;
  onChange?: (value: string) => void;
  ariaLabel?: string;
}

export function SearchBar({
  placeholder = "Search...",
  className,
  value,
  onChange,
  ariaLabel = "Search",
}: SearchBarProps) {
  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
      <Input
        placeholder={placeholder}
        className="pl-11"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        aria-label={ariaLabel}
      />
    </div>
  );
}
