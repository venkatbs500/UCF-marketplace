import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { ListingCard } from "@/components/marketplace/listing-card";
import { listings } from "@/lib/mock-data";

export function ProductPreviewGrid() {
  const featured = listings.filter((l) => l.isFeatured).slice(0, 4);

  return (
    <section>
      <SectionHeading
        title="Trending on Campus"
        subtitle="What students are buying and selling right now"
        action={
          <Link
            href="/marketplace"
            className="flex items-center gap-1 text-sm font-medium text-gold hover:underline"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {featured.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </section>
  );
}
