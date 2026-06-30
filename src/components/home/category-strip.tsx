import Link from "next/link";
import { MARKETPLACE_CATEGORIES } from "@/lib/constants";

export function CategoryStrip() {
  return (
    <section>
      <h2 className="mb-4 text-2xl font-bold">Browse Categories</h2>
      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
        {MARKETPLACE_CATEGORIES.map((cat) => (
          <Link
            key={cat.id}
            href={`/marketplace?category=${cat.id}`}
            className="flex shrink-0 flex-col items-center gap-2 rounded-2xl glass-card glass-card-hover px-5 py-4"
          >
            <span className="text-2xl">{cat.emoji}</span>
            <span className="text-xs font-medium whitespace-nowrap">{cat.label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
