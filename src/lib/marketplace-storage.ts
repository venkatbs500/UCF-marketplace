import type { Listing, ListingDraft } from "./types";
import { EMPTY_LISTING_DRAFT } from "./types";

export const SAVED_LISTINGS_KEY = "knight-market-saved-listings";
export const USER_LISTINGS_KEY = "knight-market-user-listings";
export const LISTING_DRAFT_KEY = "knight-market-listing-draft";

const STORAGE_EVENT = "knight-market-storage-change";

const EMPTY_DRAFT_SNAPSHOT: ListingDraft = { ...EMPTY_LISTING_DRAFT };
const EMPTY_USER_LISTINGS_SNAPSHOT: Listing[] = [];
const EMPTY_SAVED_SNAPSHOT: string[] = [];

let savedCacheKey: string | null = "__unset__";
let savedCache: string[] = EMPTY_SAVED_SNAPSHOT;

let userListingsCacheKey: string | null = "__unset__";
let userListingsCache: Listing[] = EMPTY_USER_LISTINGS_SNAPSHOT;

let draftCacheKey: string | null = "__unset__";
let draftCache: ListingDraft = EMPTY_DRAFT_SNAPSHOT;

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

function isValidListing(value: unknown): value is Listing {
  if (!value || typeof value !== "object") return false;
  const listing = value as Record<string, unknown>;
  return (
    typeof listing.id === "string" &&
    typeof listing.title === "string" &&
    typeof listing.sellerId === "string" &&
    typeof listing.price === "number"
  );
}

function normalizeDraft(draft: ListingDraft): ListingDraft {
  return {
    title: typeof draft.title === "string" ? draft.title : "",
    category: draft.category ?? "",
    condition: draft.condition ?? "",
    price: typeof draft.price === "string" ? draft.price : "",
    isNegotiable: Boolean(draft.isNegotiable),
    campusArea: typeof draft.campusArea === "string" ? draft.campusArea : "",
    location: typeof draft.location === "string" ? draft.location : "",
    pickupOptions: Array.isArray(draft.pickupOptions)
      ? draft.pickupOptions.filter((o): o is string => typeof o === "string")
      : [],
    description: typeof draft.description === "string" ? draft.description : "",
    tags: Array.isArray(draft.tags)
      ? draft.tags.filter((t): t is string => typeof t === "string")
      : [],
    images: Array.isArray(draft.images)
      ? draft.images.filter((i): i is string => typeof i === "string")
      : [],
  };
}

export function loadSavedListingIds(): string[] {
  const ids = readJson<unknown>(SAVED_LISTINGS_KEY, []);
  return Array.isArray(ids) ? ids.filter((id) => typeof id === "string") : [];
}

export function saveSavedListingIds(ids: string[]): void {
  const next = [...new Set(ids.filter((id) => typeof id === "string"))];
  savedCache = next;
  savedCacheKey = JSON.stringify(next);
  writeJson(SAVED_LISTINGS_KEY, next);
}

export function loadUserListings(): Listing[] {
  const listings = readJson<unknown>(USER_LISTINGS_KEY, []);
  if (!Array.isArray(listings)) return [];
  return listings.filter(isValidListing);
}

export function saveUserListings(listings: Listing[]): void {
  const next = listings.filter(isValidListing);
  userListingsCache = next;
  userListingsCacheKey = JSON.stringify(next);
  writeJson(USER_LISTINGS_KEY, next);
}

export function loadListingDraft(): ListingDraft {
  const draft = readJson<ListingDraft | null>(LISTING_DRAFT_KEY, null);
  if (!draft || typeof draft !== "object") return { ...EMPTY_LISTING_DRAFT };
  return normalizeDraft({ ...EMPTY_LISTING_DRAFT, ...draft });
}

export function saveListingDraft(draft: ListingDraft): void {
  const next = normalizeDraft(draft);
  draftCache = next;
  draftCacheKey = JSON.stringify(next);
  writeJson(LISTING_DRAFT_KEY, next);
}

export function clearListingDraft(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(LISTING_DRAFT_KEY);
  draftCache = { ...EMPTY_LISTING_DRAFT };
  draftCacheKey = null;
  notifyStorageChange();
}

export function getSavedListingsSnapshot(): string[] {
  if (typeof window === "undefined") return EMPTY_SAVED_SNAPSHOT;
  const raw = localStorage.getItem(SAVED_LISTINGS_KEY);
  if (raw === savedCacheKey) return savedCache;
  savedCacheKey = raw;
  savedCache = loadSavedListingIds();
  return savedCache;
}

export function getUserListingsSnapshot(): Listing[] {
  if (typeof window === "undefined") return EMPTY_USER_LISTINGS_SNAPSHOT;
  const raw = localStorage.getItem(USER_LISTINGS_KEY);
  if (raw === userListingsCacheKey) return userListingsCache;
  userListingsCacheKey = raw;
  userListingsCache = loadUserListings();
  return userListingsCache;
}

export function getListingDraftSnapshot(): ListingDraft {
  if (typeof window === "undefined") return EMPTY_DRAFT_SNAPSHOT;
  const raw = localStorage.getItem(LISTING_DRAFT_KEY);
  if (raw === draftCacheKey) return draftCache;
  draftCacheKey = raw;
  draftCache = loadListingDraft();
  return draftCache;
}

export function getEmptySavedSnapshot(): string[] {
  return EMPTY_SAVED_SNAPSHOT;
}

export function getEmptyUserListingsSnapshot(): Listing[] {
  return EMPTY_USER_LISTINGS_SNAPSHOT;
}

export function getEmptyDraftSnapshot(): ListingDraft {
  return EMPTY_DRAFT_SNAPSHOT;
}
