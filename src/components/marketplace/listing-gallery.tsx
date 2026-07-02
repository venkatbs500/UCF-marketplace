import type { Listing } from "@/lib/types";
import { cn } from "@/lib/utils";
import { isListingImageUrl } from "@/lib/marketplace-mode";
import { isUserCreatedListing } from "@/lib/marketplace-utils";

interface ListingGalleryProps {
  listing: Listing;
  className?: string;
}

function usesPlaceholderImages(listing: Listing): boolean {
  if (!isUserCreatedListing(listing)) return false;
  return listing.images.every((image) => !isListingImageUrl(image));
}

function ListingImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  if (isListingImageUrl(src)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={alt} className={className} />
    );
  }

  return <span className={className}>{src}</span>;
}

export function ListingGallery({ listing, className }: ListingGalleryProps) {
  const images = listing.images.length > 0 ? listing.images : ["📦"];
  const showUploadNote = usesPlaceholderImages(listing);

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-white/10 to-white/5 text-8xl">
        <ListingImage
          src={images[0]}
          alt={listing.title}
          className={cn(
            isListingImageUrl(images[0])
              ? "h-full w-full object-cover"
              : "flex h-full w-full items-center justify-center"
          )}
        />
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
              className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/5 text-2xl"
            >
              <ListingImage
                src={img}
                alt={`${listing.title} image ${i + 1}`}
                className={cn(
                  isListingImageUrl(img)
                    ? "h-full w-full object-cover"
                    : "flex h-full w-full items-center justify-center"
                )}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
