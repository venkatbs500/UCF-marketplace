export type ProductMode = "demo" | "real";

function normalizeProductMode(value: string | undefined): ProductMode | null {
  const normalized = value?.trim().toLowerCase();
  if (normalized === "demo") return "demo";
  if (normalized === "real") return "real";
  return null;
}

export function getProductMode(): ProductMode {
  const explicit = normalizeProductMode(process.env.NEXT_PUBLIC_PRODUCT_MODE);
  if (explicit) return explicit;

  const authMode = process.env.NEXT_PUBLIC_AUTH_MODE?.trim().toLowerCase();
  return authMode === "supabase" ? "real" : "demo";
}

export function isDemoDataEnabled(): boolean {
  return getProductMode() === "demo";
}

export function isRealDataMode(): boolean {
  return getProductMode() === "real";
}

/** Dev-only: ?demo=1 temporarily shows mock catalog in the browser. */
export function isDemoOverrideEnabled(
  searchParams: URLSearchParams | null | undefined
): boolean {
  if (process.env.NODE_ENV !== "development") return false;
  return searchParams?.get("demo") === "1";
}

export function isDemoDataEnabledWithOverride(
  searchParams?: URLSearchParams | null
): boolean {
  if (isDemoOverrideEnabled(searchParams)) return true;
  return isDemoDataEnabled();
}
