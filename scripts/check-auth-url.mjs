#!/usr/bin/env node

/**
 * Lightweight checks for auth URL helpers (no TypeScript runner required).
 */

function normalizeBaseUrl(url) {
  return url.trim().replace(/\/+$/, "");
}

function withHttpsPrefix(host) {
  const trimmed = host.trim().replace(/^https?:\/\//, "").replace(/\/+$/, "");
  return `https://${trimmed}`;
}

function joinAppPath(base, path) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}

function getAuthCallbackUrl(base, redirectPath) {
  const callback = joinAppPath(base, "/auth/callback");
  if (!redirectPath || !redirectPath.startsWith("/") || redirectPath.startsWith("//")) {
    return callback;
  }
  return `${callback}?redirect=${encodeURIComponent(redirectPath)}`;
}

const cases = [
  {
    name: "production callback URL",
    base: "https://ucf-marketplace.vercel.app",
    redirect: null,
    expected: "https://ucf-marketplace.vercel.app/auth/callback",
  },
  {
    name: "callback preserves redirect",
    base: "https://ucf-marketplace.vercel.app",
    redirect: "/admin",
    expected: "https://ucf-marketplace.vercel.app/auth/callback?redirect=%2Fadmin",
  },
  {
    name: "trailing slash trimmed",
    base: normalizeBaseUrl("https://ucf-marketplace.vercel.app/"),
    redirect: null,
    expected: "https://ucf-marketplace.vercel.app/auth/callback",
  },
  {
    name: "vercel host prefix",
    base: withHttpsPrefix("ucf-marketplace.vercel.app"),
    redirect: null,
    expected: "https://ucf-marketplace.vercel.app/auth/callback",
  },
];

let failed = 0;

for (const testCase of cases) {
  const actual = getAuthCallbackUrl(testCase.base, testCase.redirect);
  if (actual !== testCase.expected) {
    console.error(`❌ ${testCase.name}`);
    console.error(`   expected: ${testCase.expected}`);
    console.error(`   actual:   ${actual}`);
    failed += 1;
  } else {
    console.log(`✅ ${testCase.name}`);
  }
}

if (failed > 0) {
  process.exit(1);
}

console.log("\nAuth URL checks passed.");
