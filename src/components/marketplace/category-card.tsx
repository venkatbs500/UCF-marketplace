import Link from "next/link";
import type { MarketplaceCategory } from "@/lib/types";
import { MARKETPLACE_CATEGORIES } from "@/lib/constants";
import { Card } from "@/components/ui/card";

interface CategoryCardProps {
  category?: MarketplaceCategory;
}

export function CategoryCard({ category }: CategoryCardProps) {
  const cat = MARKETPLACE_CATEGORIES.find((c) => c.id === category);
  if (!cat) return null;

  return (
    <Link href={`/marketplace?category=${cat.id}`}>
      <Card hover className="flex flex-col items-center text-center">
        <span className="mb-2 text-3xl">{cat.emoji}</span>
        <span className="text-sm font-medium">{cat.label}</span>
      </Card>
    </Link>
  );
}
