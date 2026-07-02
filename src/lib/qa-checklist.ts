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
    description: "Supabase magic-link sign-in with local fallback for automated tests.",
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
        expected:
          'Error: "Knight Market is currently limited to verified UCF student emails."',
        status: "manual",
      },
      {
        id: "auth-sign-in",
        label: "UCF email sign-in",
        steps: ["Go to /sign-in", "Enter test@ucf.edu", "Submit"],
        expected: "Secure link flow starts and /verify explains magic-link step.",
        status: "manual",
      },
      {
        id: "auth-knights-domain",
        label: "Knights domain sign-in",
        steps: ["Go to /sign-in", "Enter test@knights.ucf.edu", "Submit"],
        expected: "Allowed and treated as verified student domain.",
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
        expected: "Local mode only: redirects to /onboarding.",
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
        expected:
          "Shows coming-soon message about messaging — not a fake \"Ready\" state.",
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
        label: "Publish stores listing",
        steps: ["On preview, click Publish"],
        expected:
          "Local/demo: listing saved in localStorage. Supabase real mode: row in public.listings + images in Storage.",
        status: "manual",
      },
      {
        id: "sell-marketplace-visible",
        label: "Published listing in marketplace",
        steps: ["After publish, visit /marketplace"],
        expected:
          "User-created listing appears. In real mode, no mock listings mixed in.",
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
        expected: "Signed out → /sign-in. Onboarded → honest coming-soon message.",
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
        expected: "Signed out → /sign-in. Onboarded → honest coming-soon message.",
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
        expected: "Signed out → /sign-in. Onboarded → honest coming-soon message.",
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
        expected: "Signed out → /sign-in. Onboarded → honest coming-soon message.",
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
    id: "error-boundaries",
    title: "Error Boundaries",
    description: "Graceful handling when routes fail.",
    items: [
      {
        id: "error-route-boundary",
        label: "Route error boundary",
        steps: ["Trigger a route error in dev if possible", "Observe error.tsx"],
        expected: "Friendly error screen with Reload, Go Home, Back to Marketplace.",
        status: "manual",
      },
      {
        id: "global-error-boundary",
        label: "Global error boundary",
        steps: ["Inspect src/app/global-error.tsx"],
        expected: "Root-level fallback exists without exposing stack traces.",
        status: "manual",
      },
    ],
  },
  {
    id: "not-found-states",
    title: "Not Found States",
    description: "Polished missing page and invalid ID handling.",
    items: [
      {
        id: "not-found-page",
        label: "App not-found page",
        steps: ["Visit a route that does not exist"],
        expected: "not-found.tsx with Go Home and Back to Marketplace.",
        status: "manual",
      },
      {
        id: "listing-not-found",
        label: "Invalid listing ID",
        steps: ["Visit /marketplace/invalid-id"],
        expected: "Listing not found empty state, no crash.",
        status: "automated",
      },
      {
        id: "seller-not-found",
        label: "Invalid seller ID",
        steps: ["Visit /sellers/invalid-id"],
        expected: "Seller not found empty state, no crash.",
        status: "manual",
      },
    ],
  },
  {
    id: "playwright-e2e",
    title: "Playwright E2E",
    description: "Automated browser tests for core flows.",
    items: [
      {
        id: "e2e-home",
        label: "Home E2E",
        steps: ["Run npm run e2e — home.spec.ts"],
        expected: "Home loads, CTA and disclaimer visible.",
        status: "automated",
      },
      {
        id: "e2e-auth",
        label: "Auth flow E2E",
        steps: ["Run npm run e2e — auth-flow.spec.ts"],
        expected: "Sign-in, verify, onboarding, sign-out pass.",
        status: "automated",
      },
      {
        id: "e2e-marketplace",
        label: "Marketplace E2E",
        steps: ["Run npm run e2e — marketplace.spec.ts"],
        expected: "Search, detail, invalid listing pass.",
        status: "automated",
      },
      {
        id: "e2e-protected",
        label: "Protected routes E2E",
        steps: ["Run npm run e2e — protected-routes.spec.ts"],
        expected: "Signed-out guards redirect to sign-in.",
        status: "automated",
      },
      {
        id: "e2e-error-boundary",
        label: "Error boundary E2E",
        steps: ["Run npm run e2e — error-boundaries.spec.ts"],
        expected: "Error demo triggers recovery UI with Go Home.",
        status: "automated",
      },
      {
        id: "e2e-sell",
        label: "Sell flow E2E",
        steps: ["Run npm run e2e — sell-flow.spec.ts"],
        expected: "Draft, preview, publish, marketplace visibility pass.",
        status: "automated",
      },
    ],
  },
  {
    id: "accessibility",
    title: "Accessibility",
    description: "Practical a11y checks for core flows.",
    items: [
      {
        id: "a11y-form-labels",
        label: "Form labels",
        steps: ["Inspect sign-in, verify, onboarding, sell forms"],
        expected: "Inputs have labels or aria-labels.",
        status: "manual",
      },
      {
        id: "a11y-listing-cards",
        label: "Listing card keyboard access",
        steps: ["Tab to listing card", "Press Enter"],
        expected: "Opens listing detail without mouse.",
        status: "manual",
      },
      {
        id: "a11y-error-alerts",
        label: "Error messages",
        steps: ["Submit invalid auth forms"],
        expected: "Errors use role=alert for screen readers.",
        status: "manual",
      },
    ],
  },
  {
    id: "runtime-storage",
    title: "Runtime Storage Safety",
    description: "localStorage resilience and provider stability.",
    items: [
      {
        id: "storage-corrupt",
        label: "Corrupt localStorage",
        steps: ["Set invalid JSON in knight-market-user-listings", "Reload marketplace"],
        expected: "App loads with empty user listings, no crash.",
        status: "manual",
      },
      {
        id: "storage-snapshot-cache",
        label: "Snapshot caching",
        steps: ["Hard refresh home and marketplace"],
        expected: "No infinite re-render or getSnapshot cache warnings.",
        status: "manual",
      },
      {
        id: "storage-duplicate-publish",
        label: "Duplicate publish guard",
        steps: ["Double-click Publish on preview"],
        expected: "Only one listing created.",
        status: "manual",
      },
    ],
  },
  {
    id: "engineering-ci",
    title: "Engineering & CI",
    description: "Company-grade repo tooling and automation.",
    items: [
      {
        id: "ci-workflow",
        label: "GitHub Actions quality workflow",
        steps: ["Inspect .github/workflows/quality.yml"],
        expected: "Runs lint, type-check, build, smoke, e2e on push/PR.",
        status: "automated",
      },
      {
        id: "pr-template",
        label: "Pull request template",
        steps: ["Open a new PR on GitHub"],
        expected: "Template includes summary, testing checklist, risks.",
        status: "manual",
      },
      {
        id: "issue-templates",
        label: "Issue templates",
        steps: ["Create new issue on GitHub"],
        expected: "Bug report and feature request templates available.",
        status: "manual",
      },
      {
        id: "featured-dedupe",
        label: "Featured listing dedupe",
        steps: ["Visit /marketplace default view"],
        expected: "Featured row + main grid with no duplicate listing cards.",
        status: "automated",
      },
      {
        id: "service-layer",
        label: "Backend abstraction layer",
        steps: ["Inspect src/lib/services/"],
        expected: "Auth and marketplace service interfaces with local implementations.",
        status: "manual",
      },
      {
        id: "error-demo-route",
        label: "Error demo route",
        steps: ["Visit /dev/error-demo in development"],
        expected: "Trigger error shows Knight Market recovery UI.",
        status: "automated",
      },
      {
        id: "migration-plan-doc",
        label: "Backend migration plan",
        steps: ["Read docs/backend-migration-plan.md"],
        expected: "Documents Supabase migration order and RLS notes.",
        status: "manual",
      },
    ],
  },
  {
    id: "product-mode",
    title: "Product Data Mode",
    description:
      "Real mode hides fake catalog content; demo mode keeps mock data for E2E and design.",
    items: [
      {
        id: "pm-real-marketplace",
        label: "Real mode marketplace honesty",
        steps: [
          "Set NEXT_PUBLIC_PRODUCT_MODE=real",
          "Visit /marketplace with no user listings",
        ],
        expected:
          "Empty state: \"No student listings yet\". No Jordan Kim / PS5 mock cards.",
        status: "manual",
      },
      {
        id: "pm-real-messages",
        label: "Real mode messages honesty",
        steps: ["In real mode, sign in and visit /messages"],
        expected: "No fake conversations. Empty inbox with Browse marketplace CTA.",
        status: "manual",
      },
      {
        id: "pm-demo-e2e",
        label: "Demo mode E2E catalog",
        steps: ["Run npm run e2e (uses NEXT_PUBLIC_PRODUCT_MODE=demo)"],
        expected: "Marketplace mock listings load. Featured dedupe test passes.",
        status: "automated",
      },
      {
        id: "pm-coming-soon-actions",
        label: "Coming-soon protected actions",
        steps: [
          "While onboarded in real mode, click Message Seller or Book Session",
        ],
        expected: "Clear coming-soon copy — never a meaningless \"Ready\" label.",
        status: "manual",
      },
      {
        id: "pm-demo-badge",
        label: "Demo data badge (demo mode only)",
        steps: ["Set NEXT_PUBLIC_PRODUCT_MODE=demo", "Visit /marketplace or /housing"],
        expected:
          "Small \"Demo data\" badge visible. Badge must NOT appear when PRODUCT_MODE=real.",
        status: "manual",
      },
    ],
  },
  {
    id: "deployment-honesty",
    title: "Deployment Honesty (Real Mode)",
    description:
      "Production real mode must not show fake users, counts, jobs, events, or demo catalog.",
    items: [
      {
        id: "dh-home-counts",
        label: "Real mode home has no fake counts",
        steps: ["Set NEXT_PUBLIC_PRODUCT_MODE=real", "Visit /"],
        expected:
          "Campus modules show honest statuses (e.g. Open for student posts, Coming soon). No 240+ listings or 40+ tutors.",
        status: "manual",
      },
      {
        id: "dh-home-preview",
        label: "Real mode home has no fake preview people/items",
        steps: ["In real mode, inspect hero preview cards"],
        expected:
          "No Mia, Sam, fake desks, fake discounts, or fake usage stats. Honest Coming soon labels.",
        status: "manual",
      },
      {
        id: "dh-jobs-events",
        label: "Real mode jobs and events are empty",
        steps: ["Visit /jobs and /events in real mode"],
        expected: "Polished empty states. No fake employers, hosts, or attendee counts.",
        status: "manual",
      },
      {
        id: "dh-discounts-ai",
        label: "Real mode discounts and AI are honest",
        steps: ["Visit /discounts and /ai in real mode"],
        expected: "Coming soon empty states. No fake businesses or AI usage counts.",
        status: "manual",
      },
      {
        id: "dh-profile-marketplace",
        label: "Real mode profile and marketplace honesty",
        steps: ["Visit /profile and /marketplace in real mode"],
        expected:
          "No fake reviews/activity. Marketplace shows only user-created listings or empty state.",
        status: "manual",
      },
      {
        id: "dh-no-demo-ui",
        label: "Real mode has no demo UI exposure",
        steps: [
          "Set NEXT_PUBLIC_PRODUCT_MODE=real",
          "Visit /marketplace, /housing, /tutoring empty states",
        ],
        expected:
          "No \"View demo data\" buttons, no ?demo=1 links, no Demo data badges.",
        status: "manual",
      },
      {
        id: "dh-tutoring-real",
        label: "Real mode tutoring has no fake tutors",
        steps: ["Visit /tutoring in real mode"],
        expected:
          "No Sam Patel, Mia Chen, or other mock tutors. Empty state with Coming soon CTA.",
        status: "manual",
      },
      {
        id: "dh-demo-e2e",
        label: "Demo mode still supports E2E mock data",
        steps: ["Run npm run e2e"],
        expected: "E2E uses demo mode. Mock marketplace listings and home demo content still work.",
        status: "automated",
      },
    ],
  },
  {
    id: "listing-management",
    title: "Listing Management",
    description: "Owner controls for locally posted listings.",
    items: [
      {
        id: "lm-real-profile-stats",
        label: "Real profile shows actual counts",
        steps: ["Set NEXT_PUBLIC_PRODUCT_MODE=real", "Sign in and visit /profile"],
        expected:
          "Posted and Saved counts match real data. No fake review count or Active: 12.",
        status: "manual",
      },
      {
        id: "lm-real-profile-reviews",
        label: "Real profile hides fake reviews",
        steps: ["In real mode, open Reviews tab on /profile"],
        expected: "Reviews coming soon card — no fake review cards.",
        status: "manual",
      },
      {
        id: "lm-delete-own",
        label: "Delete own listing",
        steps: ["Publish a listing", "Delete from profile or marketplace card"],
        expected: "Confirm dialog → listing removed from profile and marketplace.",
        status: "automated",
      },
      {
        id: "lm-no-delete-mock",
        label: "Mock listings not deletable",
        steps: ["In demo mode, visit /marketplace while signed in"],
        expected: "No delete control on mock listing cards.",
        status: "automated",
      },
      {
        id: "lm-owner-badge",
        label: "Your listing badge",
        steps: ["Publish a listing", "View it on /marketplace"],
        expected: '"Your listing" badge visible. Message Seller hidden on own card.',
        status: "manual",
      },
    ],
  },
  {
    id: "supabase-marketplace",
    title: "Supabase Marketplace (Real Mode)",
    description:
      "When NEXT_PUBLIC_AUTH_MODE=supabase and NEXT_PUBLIC_PRODUCT_MODE=real.",
    items: [
      {
        id: "sb-profile-sync",
        label: "Profile sync on onboarding",
        steps: ["Sign in with UCF email", "Complete onboarding"],
        expected: "public.profiles row created/updated with onboarding fields.",
        status: "manual",
      },
      {
        id: "sb-image-upload",
        label: "Real listing image upload",
        steps: ["Visit /sell", "Upload JPEG/PNG/WebP on step 3", "Publish"],
        expected: "Files in listing-images/{userId}/. Listing shows real photos.",
        status: "manual",
      },
      {
        id: "sb-marketplace-read",
        label: "Marketplace reads Supabase listings",
        steps: ["After publish, visit /marketplace"],
        expected: "Active listings from public.listings. No mock catalog mixed in.",
        status: "manual",
      },
      {
        id: "sb-owner-delete",
        label: "Owner delete via Supabase",
        steps: ["Delete own listing from profile or detail"],
        expected: "Row removed from listings. UI updates on marketplace and profile.",
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
        id: "build-typecheck",
        label: "TypeScript check",
        steps: ["Run npm run type-check"],
        expected: "Exits with code 0.",
        status: "automated",
      },
      {
        id: "build-smoke",
        label: "Route smoke script",
        steps: ["Run npm run smoke"],
        expected: "All required routes exist.",
        status: "automated",
      },
      {
        id: "build-quality",
        label: "Full quality gate",
        steps: ["Run npm run quality"],
        expected: "Lint, type-check, build, smoke, and e2e all pass.",
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
