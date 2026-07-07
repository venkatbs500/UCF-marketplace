# Supabase Storage Cleanup

Knight Market stores uploaded module images in Supabase Storage buckets. When a post row is **hard deleted**, the app removes associated storage objects using the shared helper in `src/lib/services/supabase-storage-cleanup.ts`.

## Buckets

| Module | Bucket |
|--------|--------|
| Marketplace listings | `listing-images` |
| Housing posts | `housing-images` |
| Lost & Found items | `lost-found-images` |
| Campus events | `event-images` |

## When files are deleted

| Action | Storage cleanup |
|--------|-----------------|
| User **deletes** their post (row removed) | Yes — all `images[]` URLs for that post |
| User **edits** post and removes images from `images[]` | Yes — only removed URLs |
| User marks post inactive / resolved / cancelled | **No** — row kept for history |
| Admin sets status `removed` | **No** — moderation hides post, files kept for review |

Cleanup uses the **anon client** and existing RLS policies (`DELETE` only for files under `{auth.uid()}/`).

## Path extraction

Public URLs like:

```
https://<project>.supabase.co/storage/v1/object/public/housing-images/<userId>/<filename>
```

are parsed to storage path:

```
<userId>/<filename>
```

Only paths under the current user's folder are deleted.

## Manual orphan cleanup (existing files)

If posts were deleted before this cleanup shipped, orphan files may remain in Storage.

**Safe manual process:**

1. Open Supabase Dashboard → **Storage** → select bucket (e.g. `housing-images`).
2. Browse folders by user ID (`{uuid}/`).
3. Cross-check filenames against live rows in the matching table (`housing_posts.images`, etc.).
4. Delete only objects with **no** matching URL in any active or removed row you want to keep.

**Do not** bulk-delete entire user folders unless you have verified every file is orphaned.

### Optional dry-run helper

```bash
node scripts/find-storage-orphans.mjs --help
```

This script documents the workflow only — it does **not** delete files by default.

## Storage list policy note

Supabase may warn: *"Clients can list all files in this bucket."*

Public image buckets need **public read** so `<img src="...">` works. Broad **list** policies can expose file names to anyone with the bucket URL. Knight Market does not rely on client-side listing for the product UI.

**Later security polish:** tighten `SELECT`/`list` policies without breaking public object URLs. Do not remove public read policies until a signed-URL or proxy strategy exists.

## Smoke check

```bash
node scripts/test-storage-cleanup.mjs
```

Included in `npm run smoke`.
