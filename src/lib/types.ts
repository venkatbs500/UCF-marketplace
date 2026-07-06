export type User = {
  id: string;
  name: string;
  email?: string;
  username?: string;
  avatar: string;
  avatarInitials?: string;
  major: string;
  year: string;
  campusArea?: string;
  interests?: string[];
  verified: boolean;
  isVerifiedStudent?: boolean;
  hasCompletedOnboarding?: boolean;
  trustScore: number;
  joinedAt: string;
  bio?: string;
};

/** Authenticated session user stored in localStorage */
export type AuthUser = {
  id: string;
  name: string;
  email: string;
  avatarInitials: string;
  major: string;
  year: string;
  campusArea: string;
  interests: string[];
  trustScore: number;
  isVerifiedStudent: boolean;
  hasCompletedOnboarding: boolean;
  joinedAt: string;
  bio?: string;
};

export type MarketplaceCategory =
  | "textbooks"
  | "furniture"
  | "electronics"
  | "scooters"
  | "gaming"
  | "kitchen"
  | "dorm-essentials"
  | "clothes"
  | "tickets"
  | "free-stuff";

export type ListingCondition = "new" | "like-new" | "good" | "fair" | "poor";

export type ListingStatus = "active" | "sold" | "reserved" | "draft" | "removed";

export type Listing = {
  id: string;
  title: string;
  description: string;
  price: number;
  category: MarketplaceCategory;
  condition: ListingCondition;
  location: string;
  campusArea: string;
  sellerId: string;
  sellerName: string;
  sellerAvatarInitials: string;
  sellerRating: number;
  sellerJoinedAt: string;
  sellerMajor: string;
  sellerYear: string;
  images: string[];
  tags: string[];
  postedAt: string;
  updatedAt: string;
  isFeatured: boolean;
  isNegotiable: boolean;
  pickupOptions: string[];
  status: ListingStatus;
  views: number;
  savedCount: number;
};

export type SellerProfile = {
  id: string;
  name: string;
  avatarInitials: string;
  email: string;
  major: string;
  year: string;
  campusArea: string;
  rating: number;
  reviewCount: number;
  trustScore: number;
  joinedAt: string;
  responseTime: string;
  completedSales: number;
  bio: string;
  badges: string[];
  verified: boolean;
};

export type SellerReview = {
  id: string;
  sellerId: string;
  reviewerName: string;
  reviewerInitials: string;
  rating: number;
  comment: string;
  createdAt: string;
  listingTitle?: string;
};

export type ListingDraft = {
  title: string;
  category: MarketplaceCategory | "";
  condition: ListingCondition | "";
  price: string;
  isNegotiable: boolean;
  campusArea: string;
  location: string;
  pickupOptions: string[];
  description: string;
  tags: string[];
  images: string[];
};

export const EMPTY_LISTING_DRAFT: ListingDraft = {
  title: "",
  category: "",
  condition: "",
  price: "",
  isNegotiable: false,
  campusArea: "",
  location: "",
  pickupOptions: [],
  description: "",
  tags: [],
  images: [],
};

export type ListingSortOption =
  | "newest"
  | "price-asc"
  | "price-desc"
  | "most-saved"
  | "featured";

export type HousingType = "sublease" | "roommate" | "lease-transfer";

export type HousingPost = {
  id: string;
  title: string;
  description: string;
  type: HousingType;
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  availableFrom: string;
  leaseEnd?: string;
  amenities: string[];
  poster: User;
  images: string[];
  createdAt: string;
};

export type RoommateProfile = {
  id: string;
  user: User;
  budget: number;
  moveInDate: string;
  preferredLocation: string;
  lifestyle: string[];
  bio: string;
  compatibility: number;
};

export type ApartmentReview = {
  id: string;
  apartmentName: string;
  location: string;
  rating: number;
  review: string;
  pros: string[];
  cons: string[];
  reviewer: User;
  rent: number;
  createdAt: string;
};

export type Tutor = {
  id: string;
  user: User;
  subjects: string[];
  hourlyRate: number;
  rating: number;
  reviewCount: number;
  availability: string[];
  bio: string;
  sessionsCompleted: number;
};

export type JobType =
  | "campus-gig"
  | "part-time"
  | "research"
  | "freelance";

export type CampusJob = {
  id: string;
  title: string;
  company: string;
  type: JobType;
  pay: string;
  location: string;
  timeCommitment: string;
  description: string;
  postedBy: User;
  postedAt: string;
  tags: string[];
};

export type EventType =
  | "club"
  | "hackathon"
  | "career-fair"
  | "sports"
  | "social";

export type CampusEvent = {
  id: string;
  title: string;
  description: string;
  type: EventType;
  date: string;
  time: string;
  location: string;
  host: string;
  attendeeCount: number;
  maxAttendees?: number;
  image: string;
};

export type AIStudyTool = {
  id: string;
  name: string;
  description: string;
  icon: string;
  premium: boolean;
  usageCount: number;
};

export type LostFoundStatus = "lost" | "found";
export type LostFoundCategory =
  | "id-cards"
  | "electronics"
  | "keys"
  | "clothing"
  | "books"
  | "other";

export type LostFoundItem = {
  id: string;
  title: string;
  description: string;
  status: LostFoundStatus;
  category: LostFoundCategory;
  location: string;
  date: string;
  reporter: User;
  image?: string;
};

export type DiscountCategory =
  | "food"
  | "coffee"
  | "gym"
  | "printing"
  | "tech-repair"
  | "entertainment";

export type StudentDiscount = {
  id: string;
  businessName: string;
  description: string;
  discount: string;
  category: DiscountCategory;
  location: string;
  expiresAt?: string;
  code?: string;
  verified: boolean;
};

export type Review = {
  id: string;
  reviewer: User;
  targetId: string;
  targetType: "listing" | "user" | "tutor" | "housing";
  rating: number;
  comment: string;
  createdAt: string;
};

export type MessagePreview = {
  id: string;
  participant: User;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
  context: string;
  contextType: "listing" | "tutoring" | "housing" | "lost-found" | "jobs" | "general";
};
