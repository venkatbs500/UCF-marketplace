"use client";

import { Heart } from "lucide-react";
import { useProtectedAction } from "@/components/auth/protected-action-button";
import { useSavedListings } from "@/components/providers/saved-listings-provider";
import { cn } from "@/lib/utils";

interface SaveListingButtonProps {
  listingId: string;
  size?: "sm" | "md";
  className?: string;
  showLabel?: boolean;
}

export function SaveListingButton({
  listingId,
  size = "sm",
  className,
  showLabel = false,
}: SaveListingButtonProps) {
  const { isSaved, toggleSaved } = useSavedListings();
  const { runProtectedAction } = useProtectedAction();
  const saved = isSaved(listingId);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    runProtectedAction(() => toggleSaved(listingId));
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={saved ? "Unsave listing" : "Save listing"}
      className={cn(
        "inline-flex items-center gap-1.5 text-muted transition-colors hover:text-gold",
        className
      )}
    >
      <Heart
        className={cn(
          size === "sm" ? "h-4 w-4" : "h-5 w-5",
          saved && "fill-gold text-gold"
        )}
      />
      {showLabel && (
        <span className="text-sm">{saved ? "Saved" : "Save"}</span>
      )}
    </button>
  );
}
