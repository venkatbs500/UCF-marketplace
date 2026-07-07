#!/usr/bin/env node

/**
 * Dry-run documentation helper for orphan storage cleanup.
 * Does NOT delete files. Does NOT call Supabase by default.
 */

const args = process.argv.slice(2);

if (args.includes("--help") || args.includes("-h")) {
  console.log(`Knight Market — storage orphan cleanup (manual)

This script does not delete anything automatically.

Workflow:
1. Export image URLs from Supabase tables:
   - listings.images
   - housing_posts.images
   - lost_found_items.images
   - campus_events.images
2. In Storage, compare bucket objects under each user folder.
3. Delete only objects whose public path is not referenced in any row you want to keep.

Buckets:
  - listing-images
  - housing-images
  - lost-found-images
  - event-images

See docs/supabase-storage-cleanup.md for full guidance.
`);
  process.exit(0);
}

console.log("find-storage-orphans: dry-run only. No files were scanned or deleted.");
console.log("Run with --help for manual cleanup steps.");
console.log("See docs/supabase-storage-cleanup.md");
