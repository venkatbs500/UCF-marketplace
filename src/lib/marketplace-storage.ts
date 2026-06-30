import type { Listing, ListingDraft } from "./types";
import { EMPTY_LISTING_DRAFT } from "./types";

export const SAVED_LISTINGS_KEY = "knight-market-saved-listings";
export const USER_LISTINGS_KEY = "knight-market-user-listings";
export const LISTING_DRAFT_KEY = "knight-market-listing-draft";

const STORAGE_EVENT = "knight-market-storage-change";

export function notifyStorageChange(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(STORAGE_EVENT));
}

export function subscribeStorage(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = () => onChange();
  window.addEventListener(STORAGE_EVENT, handler);
  return () => window.removeEventListener(STORAGE_EVENT, handler);
}

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
  notifyStorageChange();
}

export function loadSavedListingIds(): string[] {
  const ids = readJson<string[]>(SAVED_LISTINGS_KEY, []);
  return Array.isArray(ids) ? ids.filter((id) => typeof id === "string") : [];
}

export function saveSavedListingIds(ids: string[]): void {
  writeJson(SAVED_LISTINGS_KEY, ids);
}

export function loadUserListings(): Listing[] {
  const listings = readJson<Listing[]>(USER_LISTINGS_KEY, []);
  return Array.isArray(listings) ? listings : [];
}

export function saveUserListings(listings: Listing[]): void {
  writeJson(USER_LISTINGS_KEY, listings);
}

export function loadListingDraft(): ListingDraft {
  const draft = readJson<ListingDraft | null>(LISTING_DRAFT_KEY, null);
  if (!draft || typeof draft !== "object") return { ...EMPTY_LISTING_DRAFT };
  return { ...EMPTY_LISTING_DRAFT, ...draft };
}

export function saveListingDraft(draft: ListingDraft): void {
  writeJson(LISTING_DRAFT_KEY, draft);
}

export function clearListingDraft(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(LISTING_DRAFT_KEY);
  notifyStorageChange();
}

export function getSavedListingsSnapshot(): string[] {
  return loadSavedListingIds();
}

export function getUserListingsSnapshot(): Listing[] {
  return loadUserListings();
}

export function getListingDraftSnapshot(): ListingDraft {
  return loadListingDraft();
}

export function getEmptySavedSnapshot(): string[] {
  return [];
}

export function getEmptyUserListingsSnapshot(): Listing[] {
  return [];
}

export function getEmptyDraftSnapshot(): ListingDraft {
  return { ...EMPTY_LISTING_DRAFT };
}
