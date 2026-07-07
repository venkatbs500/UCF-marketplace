import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export type StorageCleanupResult = {
  deletedCount: number;
  failedPaths: string[];
  error?: string;
};

export type StoragePathOptions = {
  /** When set, only paths under `{userId}/` are eligible for deletion. */
  userIdPrefix?: string;
};

function isHttpUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

/**
 * Extracts a storage object path from a Supabase public URL for a given bucket.
 * Returns null for empty, invalid, or non-matching URLs.
 */
export function extractStoragePathFromPublicUrl(
  bucketName: string,
  publicUrl: string,
  options: StoragePathOptions = {}
): string | null {
  const trimmed = publicUrl.trim();
  if (!trimmed) return null;

  if (!isHttpUrl(trimmed)) {
    const path = trimmed.replace(/^\/+/, "");
    if (!path || path.includes("..")) return null;
    if (options.userIdPrefix && !path.startsWith(`${options.userIdPrefix}/`)) {
      return null;
    }
    return path;
  }

  try {
    const parsed = new URL(trimmed);
    const marker = `/storage/v1/object/public/${bucketName}/`;
    const index = parsed.pathname.indexOf(marker);
    if (index === -1) return null;
    const path = decodeURIComponent(parsed.pathname.slice(index + marker.length));
    if (!path || path.includes("..")) return null;
    if (options.userIdPrefix && !path.startsWith(`${options.userIdPrefix}/`)) {
      return null;
    }
    return path;
  } catch {
    return null;
  }
}

export function extractStoragePathsFromPublicUrls(
  bucketName: string,
  urlsOrPaths: Array<string | null | undefined>,
  options: StoragePathOptions = {}
): string[] {
  const paths = new Set<string>();
  for (const entry of urlsOrPaths) {
    if (!entry) continue;
    const path = extractStoragePathFromPublicUrl(bucketName, entry, options);
    if (path) paths.add(path);
  }
  return [...paths];
}

export function getRemovedImageUrls(previous: string[], next: string[]): string[] {
  const nextSet = new Set(next);
  return previous.filter((url) => url && !nextSet.has(url));
}

export async function deleteStorageFiles(
  bucketName: string,
  urlsOrPaths: Array<string | null | undefined>,
  options: StoragePathOptions = {}
): Promise<StorageCleanupResult> {
  const client = getSupabaseBrowserClient();
  const paths = extractStoragePathsFromPublicUrls(bucketName, urlsOrPaths, options);

  if (!client) {
    return {
      deletedCount: 0,
      failedPaths: paths,
      error: "Supabase is not configured.",
    };
  }

  if (paths.length === 0) {
    return { deletedCount: 0, failedPaths: [] };
  }

  const { data, error } = await client.storage.from(bucketName).remove(paths);

  if (error) {
    return {
      deletedCount: 0,
      failedPaths: paths,
      error: "Storage cleanup failed.",
    };
  }

  const removed = data?.length ?? paths.length;
  const failedPaths =
    removed >= paths.length ? [] : paths.slice(removed);

  return {
    deletedCount: Math.min(removed, paths.length),
    failedPaths,
  };
}

/** Best-effort storage delete — never throws. */
export async function deleteStorageFilesSafely(
  bucketName: string,
  urlsOrPaths: Array<string | null | undefined>,
  options: StoragePathOptions = {}
): Promise<StorageCleanupResult> {
  try {
    const result = await deleteStorageFiles(bucketName, urlsOrPaths, options);
    if (result.failedPaths.length > 0 && process.env.NODE_ENV === "development") {
      console.warn(
        `[storage] ${bucketName}: ${result.failedPaths.length} file(s) could not be deleted.`
      );
    }
    return result;
  } catch {
    const paths = extractStoragePathsFromPublicUrls(bucketName, urlsOrPaths, options);
    if (process.env.NODE_ENV === "development") {
      console.warn(`[storage] ${bucketName}: cleanup threw unexpectedly.`);
    }
    return {
      deletedCount: 0,
      failedPaths: paths,
      error: "Storage cleanup failed.",
    };
  }
}
