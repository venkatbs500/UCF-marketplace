import type { Listing } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ListingGalleryProps {
  listing: Listing;
  className?: string;
}

export function ListingGallery({ listing, className }: ListingGalleryProps) {
  const images = listing.images.length > 0 ? listing.images : ["📦"];

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex aspect-[4/3] items-center justify-center rounded-2xl bg-gradient-to-br from-white/10 to-white/5 text-8xl">
        {images[0]}
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {images.map((img, i) => (
            <div
              key={`${img}-${i}`}
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-white/5 text-2xl"
            >
              {img}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
