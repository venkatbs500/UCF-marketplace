const LOCAL_DEV_FALLBACK = "http://127.0.0.1:3000";

function normalizeBaseUrl(url: string): string {
  return url.trim().replace(/\/+$/, "");
}

function withHttpsPrefix(host: string): string {
  const trimmed = host.trim().replace(/^https?:\/\//, "").replace(/\/+$/, "");
  return `https://${trimmed}`;
}

function readConfiguredAppUrl(): string | null {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  return configured ? normalizeBaseUrl(configured) : null;
}

function readVercelAppUrl(): string | null {
  const vercelUrl =
    process.env.VERCEL_URL?.trim() || process.env.NEXT_PUBLIC_VERCEL_URL?.trim();
  return vercelUrl ? withHttpsPrefix(vercelUrl) : null;
}

/**
 * Resolves the public app origin for auth redirects and links.
 */
export function getAppUrl(): string {
  const configured = readConfiguredAppUrl();
  if (configured) return configured;

  if (typeof window !== "undefined") {
    return normalizeBaseUrl(window.location.origin);
  }

  const vercelUrl = readVercelAppUrl();
  if (vercelUrl) return vercelUrl;

  return LOCAL_DEV_FALLBACK;
}

/** @deprecated Use getAppUrl */
export function getAppBaseUrl(): string {
  return getAppUrl();
}

export function joinAppPath(path: string): string {
  const base = getAppUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}

export function getAuthCallbackUrl(redirectPath?: string | null): string {
  const base = joinAppPath("/auth/callback");
  if (!redirectPath || !redirectPath.startsWith("/") || redirectPath.startsWith("//")) {
    return base;
  }
  return `${base}?redirect=${encodeURIComponent(redirectPath)}`;
}

export function isDevelopmentEnvironment(): boolean {
  return process.env.NODE_ENV === "development";
}
