const LOCAL_DEV_FALLBACK = "http://127.0.0.1:3000";

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/$/, "");
}

/**
 * Resolves the public app origin for auth redirects and links.
 * Browser: current origin. Server/build: NEXT_PUBLIC_APP_URL, then local fallback.
 */
export function getAppBaseUrl(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (configured) {
    return normalizeBaseUrl(configured);
  }

  return LOCAL_DEV_FALLBACK;
}

export function getAuthCallbackUrl(): string {
  return `${getAppBaseUrl()}/auth/callback`;
}

export function isDevelopmentEnvironment(): boolean {
  return process.env.NODE_ENV === "development";
}
