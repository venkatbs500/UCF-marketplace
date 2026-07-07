#!/usr/bin/env node

/**
 * Mirrors extractStoragePathFromPublicUrl logic for smoke checks.
 * Keep in sync with src/lib/services/supabase-storage-cleanup.ts
 */

function extractStoragePathFromPublicUrl(bucketName, publicUrl, userIdPrefix) {
  const trimmed = publicUrl.trim();
  if (!trimmed) return null;

  if (!/^https?:\/\//i.test(trimmed)) {
    const path = trimmed.replace(/^\/+/, "");
    if (!path || path.includes("..")) return null;
    if (userIdPrefix && !path.startsWith(`${userIdPrefix}/`)) return null;
    return path;
  }

  try {
    const parsed = new URL(trimmed);
    const marker = `/storage/v1/object/public/${bucketName}/`;
    const index = parsed.pathname.indexOf(marker);
    if (index === -1) return null;
    const path = decodeURIComponent(parsed.pathname.slice(index + marker.length));
    if (!path || path.includes("..")) return null;
    if (userIdPrefix && !path.startsWith(`${userIdPrefix}/`)) return null;
    return path;
  } catch {
    return null;
  }
}

function getRemovedImageUrls(previous, next) {
  const nextSet = new Set(next);
  return previous.filter((url) => url && !nextSet.has(url));
}

const cases = [
  {
    name: "housing public URL",
    bucket: "housing-images",
    url: "https://abc.supabase.co/storage/v1/object/public/housing-images/user-1/photo.webp",
    userId: "user-1",
    expected: "user-1/photo.webp",
  },
  {
    name: "lost-found public URL",
    bucket: "lost-found-images",
    url: "https://abc.supabase.co/storage/v1/object/public/lost-found-images/user-2/a%20b.png",
    userId: "user-2",
    expected: "user-2/a b.png",
  },
  {
    name: "rejects wrong user prefix",
    bucket: "event-images",
    url: "https://abc.supabase.co/storage/v1/object/public/event-images/other-user/x.jpg",
    userId: "user-3",
    expected: null,
  },
  {
    name: "raw storage path",
    bucket: "listing-images",
    url: "user-4/listing.jpg",
    userId: "user-4",
    expected: "user-4/listing.jpg",
  },
];

let failed = 0;

for (const testCase of cases) {
  const actual = extractStoragePathFromPublicUrl(testCase.bucket, testCase.url, testCase.userId);
  if (actual !== testCase.expected) {
    console.error(`❌ ${testCase.name}`);
    console.error(`   expected: ${testCase.expected}`);
    console.error(`   actual:   ${actual}`);
    failed += 1;
  } else {
    console.log(`✅ ${testCase.name}`);
  }
}

const removed = getRemovedImageUrls(
  ["https://x/housing-images/u/a.jpg", "https://x/housing-images/u/b.jpg"],
  ["https://x/housing-images/u/b.jpg"]
);
if (removed.length !== 1 || !removed[0].includes("a.jpg")) {
  console.error("❌ getRemovedImageUrls");
  failed += 1;
} else {
  console.log("✅ getRemovedImageUrls");
}

if (failed > 0) {
  process.exit(1);
}

console.log("\nStorage cleanup helper checks passed.");
