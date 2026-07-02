import { Badge } from "@/components/ui/badge";
import { isDemoDataEnabled } from "@/lib/product-mode";

/** Visible only when `NEXT_PUBLIC_PRODUCT_MODE=demo` — never for `?demo=1` or real mode. */
export function DemoModeBadge() {
  if (!isDemoDataEnabled()) return null;

  return (
    <Badge variant="outline" className="border-gold/40 text-gold">
      Demo data
    </Badge>
  );
}
