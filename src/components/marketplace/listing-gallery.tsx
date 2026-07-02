import type { Listing } from "@/lib/types";
import { cn } from "@/lib/utils";
import { isUserCreatedListing } from "@/lib/marketplace-utils";

interface ListingGalleryProps {
  listing: Listing;
  className?: string;
}

function usesPlaceholderImages(listing: Listing): boolean {
  if (!isUserCreatedListing(listing)) return false;
  return listing.images.every((image) => image.length <= 4);
}

export function ListingGallery({ listing, className }: ListingGalleryProps) {
  const images = listing.images.length > 0 ? listing.images : ["📦"];
  const showUploadNote = usesPlaceholderImages(listing);

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex aspect-[4/3] items-center justify-center rounded-2xl bg-gradient-to-br from-white/10 to-white/5 text-8xl">
        {images[0]}
      </div>
      {showUploadNote && (
        <p className="text-xs text-muted">
          Real image uploads are coming next. Placeholder previews are shown for now.
        </p>
      )}
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
