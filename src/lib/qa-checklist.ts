export type QACheckStatus = "manual" | "automated" | "info";

export type QACheckItem = {
  id: string;
  label: string;
  steps: string[];
  expected: string;
  status: QACheckStatus;
};

export type QACheckSection = {
  id: string;
  title: string;
  description: string;
  items: QACheckItem[];
};

export const QA_CHECKLIST: QACheckSection[] = [
  {
    id: "auth-flow",
    title: "Auth Flow",
    description: "Mock UCF email sign-in, verification, and onboarding.",
    items: [
      {
        id: "auth-browse-signed-out",
        label: "Signed-out browsing",
        steps: ["Visit /", "Visit /marketplace"],
        expected: "Home and marketplace load without requiring sign-in.",
        status: "manual",
      },
      {
        id: "auth-invalid-email",
        label: "Invalid email rejection",
        steps: ["Go to /sign-in", "Enter gmail.com address", "Submit"],
        expected: 'Error: "Knight Market is currently limited to UCF student emails."',
        status: "manual",
      },
      {
        id: "auth-sign-in",
        label: "UCF email sign-in",
        steps: ["Go to /sign-in", "Enter test@ucf.edu", "Submit"],
        expected: "Redirect to /verify with pending email stored.",
        status: "manual",
      },
      {
        id: "auth-wrong-code",
        label: "Wrong verification code",
        steps: ["On /verify", "Enter 000000", "Submit"],
        expected: "Inline error shown. Stay on /verify.",
        status: "manual",
      },
      {
        id: "auth-correct-code",
        label: "Correct verification code",
        steps: ["On /verify", "Enter 123456", "Submit"],
        expected: "Redirect to /onboarding.",
        status: "manual",
      },
      {
        id: "auth-onboarding",
        label: "Complete onboarding",
        steps: [
          "Fill name, major, year, campus area",
          "Select at least one interest",
          "Submit",
        ],
        expected: "Redirect to /marketplace. Session stored in localStorage.",
        status: "manual",
      },
      {
        id: "auth-sign-out",
        label: "Sign out",
        steps: ["Open user menu", "Click Sign Out"],
        expected: "Session cleared. Navigation shows Sign In / Join CTA.",
        status: "manual",
      },
    ],
  },
  {
    id: "protected-routes",
    title: "Protected Routes",
    description: "Pages that require verified + onboarded session.",
    items: [
      {
        id: "route-sell",
        label: "/sell guard",
        steps: ["While signed out, visit /sell"],
        expected: "Redirect to /sign-in.",
        status: "manual",
      },
      {
        id: "route-messages",
        label: "/messages guard",
        steps: ["While signed out, visit /messages"],
        expected: "Redirect to /sign-in.",
        status: "manual",
      },
      {
        id: "route-profile",
        label: "/profile guard",
        steps: ["While signed out, visit /profile"],
        expected: "Redirect to /sign-in.",
        status: "manual",
      },
      {
        id: "route-admin-locked",
        label: "/admin locked state",
        steps: ["Sign in as test@ucf.edu", "Complete onboarding", "Visit /admin"],
        expected: "Polished locked admin state shown.",
        status: "manual",
      },
      {
        id: "route-admin-access",
        label: "/admin dashboard access",
        steps: ["Sign out", "Sign in as admin@ucf.edu", "Verify + onboard", "Visit /admin"],
        expected: "Moderation dashboard visible.",
        status: "manual",
      },
    ],
  },
  {
    id: "marketplace-actions",
    title: "Marketplace Actions",
    description: "Protected listing interactions.",
    items: [
      {
        id: "mp-message-signed-out",
        label: "Message seller (signed out)",
        steps: ["Visit /marketplace", "Click Message Seller"],
        expected: "Redirect to /sign-in.",
        status: "manual",
      },
      {
        id: "mp-save-signed-out",
        label: "Save listing (signed out)",
        steps: ["Click heart icon on a listing"],
        expected: "Redirect to /sign-in.",
        status: "manual",
      },
      {
        id: "mp-save-not-onboarded",
        label: "Save listing (signed in, not onboarded)",
        steps: ["Sign in but skip onboarding", "Click save on a listing"],
        expected: "Redirect to /onboarding.",
        status: "manual",
      },
      {
        id: "mp-save-onboarded",
        label: "Save listing (onboarded)",
        steps: ["While onboarded, click heart on a listing", "Visit /saved"],
        expected: "Listing saved to localStorage. Appears on /saved.",
        status: "manual",
      },
      {
        id: "mp-message-onboarded",
        label: "Message seller (onboarded)",
        steps: ["While onboarded, click Message Seller"],
        expected: 'Button label changes to "Ready".',
        status: "manual",
      },
      {
        id: "mp-listing-detail",
        label: "Listing detail page",
        steps: ["Visit /marketplace", "Click a listing card"],
        expected: "Opens /marketplace/[listingId] with gallery, info, seller card.",
        status: "manual",
      },
      {
        id: "mp-seller-profile",
        label: "Seller profile page",
        steps: ["Open listing detail", "Click seller name or View Profile"],
        expected: "Opens /sellers/[sellerId] with listings and reviews.",
        status: "manual",
      },
      {
        id: "mp-search-filter",
        label: "Search and filter",
        steps: [
          "On /marketplace, search by title",
          "Filter by category, condition, campus area",
          "Change sort order",
        ],
        expected: "Result count updates. Empty state when no matches.",
        status: "manual",
      },
    ],
  },
  {
    id: "marketplace-sell-flow",
    title: "Sell & Publish Flow",
    description: "Multi-step listing creation with localStorage persistence.",
    items: [
      {
        id: "sell-guard",
        label: "/sell requires auth",
        steps: ["While signed out, visit /sell"],
        expected: "Redirect to /sign-in.",
        status: "manual",
      },
      {
        id: "sell-draft",
        label: "Sell form creates draft",
        steps: [
          "Sign in and onboard",
          "Visit /sell",
          "Fill step 1 (details) and step 2 (description)",
        ],
        expected: "Draft persisted in localStorage as you type.",
        status: "manual",
      },
      {
        id: "sell-preview",
        label: "Preview page shows draft",
        steps: ["Complete sell form steps", "Go to step 4 or visit /sell/preview"],
        expected: "Preview card shows draft details. Empty state if no draft.",
        status: "manual",
      },
      {
        id: "sell-publish",
        label: "Publish stores local listing",
        steps: ["On preview, click Publish"],
        expected: "Listing saved with status active. Success card shown.",
        status: "manual",
      },
      {
        id: "sell-marketplace-visible",
        label: "Published listing in marketplace",
        steps: ["After publish, visit /marketplace"],
        expected: "User-created listing appears alongside mock listings.",
        status: "manual",
      },
      {
        id: "sell-profile-visible",
        label: "Published listing in profile",
        steps: ["Visit /profile after publishing"],
        expected: '"My Posted Listings" section shows the new listing.',
        status: "manual",
      },
    ],
  },
  {
    id: "saved-listings",
    title: "Saved Listings",
    description: "Saved listings page and localStorage sync.",
    items: [
      {
        id: "saved-guard",
        label: "/saved requires auth",
        steps: ["While signed out, visit /saved"],
        expected: "Redirect to /sign-in.",
        status: "manual",
      },
      {
        id: "saved-page",
        label: "Saved page shows listings",
        steps: ["Save 2+ listings while onboarded", "Visit /saved"],
        expected: "Saved listings displayed. Can unsave from page.",
        status: "manual",
      },
      {
        id: "saved-empty",
        label: "Saved empty state",
        steps: ["Clear saved listings", "Visit /saved"],
        expected: "Empty state with link to marketplace.",
        status: "manual",
      },
    ],
  },
  {
    id: "housing-actions",
    title: "Housing Actions",
    description: "Protected housing and roommate actions.",
    items: [
      {
        id: "housing-contact",
        label: "Contact housing poster",
        steps: ["Visit /housing", "Click Contact on a listing"],
        expected: "Signed out → /sign-in. Onboarded → Ready.",
        status: "manual",
      },
      {
        id: "housing-roommate",
        label: "Connect with roommate",
        steps: ["Open Roommates tab", "Click Connect"],
        expected: "Same protected action behavior as other cards.",
        status: "manual",
      },
    ],
  },
  {
    id: "tutoring-actions",
    title: "Tutoring Actions",
    description: "Protected tutor booking.",
    items: [
      {
        id: "tutor-book",
        label: "Book session",
        steps: ["Visit /tutoring", "Click Book Session"],
        expected: "Signed out → /sign-in. Onboarded → Ready.",
        status: "manual",
      },
    ],
  },
  {
    id: "jobs-actions",
    title: "Jobs Actions",
    description: "Protected job applications.",
    items: [
      {
        id: "job-apply",
        label: "Apply to job",
        steps: ["Visit /jobs", "Click Apply"],
        expected: "Signed out → /sign-in. Onboarded → Ready.",
        status: "manual",
      },
    ],
  },
  {
    id: "events-actions",
    title: "Events Actions",
    description: "Protected event RSVP.",
    items: [
      {
        id: "event-rsvp",
        label: "RSVP to event",
        steps: ["Visit /events", "Click RSVP"],
        expected: "Signed out → /sign-in. Onboarded → Ready.",
        status: "manual",
      },
    ],
  },
  {
    id: "mobile-navigation",
    title: "Mobile Navigation",
    description: "Bottom nav behavior on small screens.",
    items: [
      {
        id: "mobile-profile-signed-out",
        label: "Profile tab when signed out",
        steps: ["Resize to mobile width", "Tap Profile tab"],
        expected: "Shows Sign In and routes to /sign-in.",
        status: "manual",
      },
      {
        id: "mobile-nav-core",
        label: "Core mobile tabs",
        steps: ["Tap Home, Shop, Sell, Chat, Profile"],
        expected: "All tabs navigate without layout breakage.",
        status: "manual",
      },
    ],
  },
  {
    id: "build-checks",
    title: "Build Checks",
    description: "Automated project health checks.",
    items: [
      {
        id: "build-lint",
        label: "ESLint",
        steps: ["Run npm run lint"],
        expected: "Exits with code 0.",
        status: "automated",
      },
      {
        id: "build-prod",
        label: "Production build",
        steps: ["Run npm run build"],
        expected: "Compiles all routes without TypeScript errors.",
        status: "automated",
      },
      {
        id: "build-hydration",
        label: "Auth hydration safety",
        steps: ["Hard refresh while signed in", "Hard refresh while signed out"],
        expected: "No hydration mismatch warnings in console.",
        status: "manual",
      },
    ],
  },
];

export const QA_SUMMARY = {
  totalSections: QA_CHECKLIST.length,
  totalItems: QA_CHECKLIST.reduce((sum, section) => sum + section.items.length, 0),
  demoVerificationCode: "123456",
  demoEmails: {
    student: "test@ucf.edu",
    admin: "admin@ucf.edu",
  },
  sessionStorageKey: "knight-market-session",
  savedListingsKey: "knight-market-saved-listings",
  userListingsKey: "knight-market-user-listings",
  listingDraftKey: "knight-market-listing-draft",
  sampleListingId: "listing-1",
  sampleSellerId: "seller-1",
};
