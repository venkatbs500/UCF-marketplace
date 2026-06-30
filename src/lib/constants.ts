import type { MarketplaceCategory } from "./types";

export const APP_NAME = "Knight Market";
export const APP_TAGLINE = "The campus app UCF students actually needed.";
export const TRUST_DISCLAIMER =
  "Built for students. Not officially affiliated with UCF.";
export const PROTECTED_ACTION_UNLOCKED_LABEL = "Ready";

export const NAV_ITEMS = [
  { href: "/", label: "Home", icon: "Home" },
  { href: "/marketplace", label: "Marketplace", icon: "Store" },
  { href: "/housing", label: "Housing", icon: "Building2" },
  { href: "/tutoring", label: "Tutoring", icon: "GraduationCap" },
  { href: "/jobs", label: "Jobs", icon: "Briefcase" },
  { href: "/events", label: "Events", icon: "Calendar" },
  { href: "/ai", label: "AI", icon: "Sparkles" },
  { href: "/lost-found", label: "Lost & Found", icon: "Search" },
  { href: "/discounts", label: "Discounts", icon: "Tag" },
] as const;

export const SECONDARY_NAV = [
  { href: "/messages", label: "Messages", icon: "MessageCircle" },
  { href: "/sell", label: "Sell", icon: "PlusCircle" },
  { href: "/profile", label: "Profile", icon: "User" },
] as const;

export const MARKETPLACE_CATEGORIES: {
  id: MarketplaceCategory;
  label: string;
  emoji: string;
}[] = [
  { id: "textbooks", label: "Textbooks", emoji: "📚" },
  { id: "furniture", label: "Furniture", emoji: "🛋️" },
  { id: "electronics", label: "Electronics", emoji: "💻" },
  { id: "scooters", label: "Scooters", emoji: "🛴" },
  { id: "gaming", label: "Gaming", emoji: "🎮" },
  { id: "kitchen", label: "Kitchen", emoji: "🍳" },
  { id: "dorm-essentials", label: "Dorm Essentials", emoji: "🏠" },
  { id: "clothes", label: "Clothes", emoji: "👕" },
  { id: "tickets", label: "Tickets", emoji: "🎟️" },
  { id: "free-stuff", label: "Free Stuff", emoji: "🎁" },
];

export const TUTORING_SUBJECTS = [
  "Calculus",
  "Physics",
  "Chemistry",
  "Biology",
  "Computer Science",
  "Statistics",
  "Economics",
  "Psychology",
  "Engineering",
  "Writing",
  "Spanish",
  "Accounting",
];

export const HOUSING_TABS = [
  { id: "subleases", label: "Subleases" },
  { id: "roommates", label: "Roommates" },
  { id: "reviews", label: "Apartment Reviews" },
  { id: "transfers", label: "Lease Transfers" },
] as const;

export const JOB_FILTERS = [
  { id: "campus-gig", label: "Campus Gigs" },
  { id: "part-time", label: "Part-Time" },
  { id: "research", label: "Research" },
  { id: "freelance", label: "Freelance" },
] as const;

export const EVENT_FILTERS = [
  { id: "club", label: "Club Events" },
  { id: "hackathon", label: "Hackathons" },
  { id: "career-fair", label: "Career Fairs" },
  { id: "sports", label: "Sports" },
  { id: "social", label: "Social" },
] as const;

export const DISCOUNT_CATEGORIES = [
  { id: "food", label: "Food" },
  { id: "coffee", label: "Coffee" },
  { id: "gym", label: "Gyms" },
  { id: "printing", label: "Printing" },
  { id: "tech-repair", label: "Tech Repair" },
  { id: "entertainment", label: "Entertainment" },
] as const;

export const LOST_FOUND_CATEGORIES = [
  { id: "id-cards", label: "ID Cards" },
  { id: "electronics", label: "Electronics" },
  { id: "keys", label: "Keys" },
  { id: "clothing", label: "Clothing" },
  { id: "books", label: "Books" },
  { id: "other", label: "Other" },
] as const;
