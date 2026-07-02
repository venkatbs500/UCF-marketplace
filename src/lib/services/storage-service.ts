/**
 * Safe localStorage wrappers with SSR fallbacks and corrupt JSON handling.
 * Temporary client storage — replace with Supabase/API calls later.
 */

const STORAGE_CHANGE_EVENT = "knight-market-storage-change";

export function notifyStorageChange(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(STORAGE_CHANGE_EVENT));
}

export function subscribeStorage(listener: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = () => listener();
  window.addEventListener(STORAGE_CHANGE_EVENT, handler);
  return () => window.removeEventListener(STORAGE_CHANGE_EVENT, handler);
}

export function getJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function setJSON<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
  notifyStorageChange();
}

export function removeKey(key: string): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(key);
  notifyStorageChange();
}

export function getRawItem(key: string): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(key);
}

export function setRawItem(key: string, value: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, value);
  notifyStorageChange();
}
