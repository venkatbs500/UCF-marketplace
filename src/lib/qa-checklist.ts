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
        steps: [
          "Set NEXT_PUBLIC_ADMIN_EMAILS to your UCF email",
          "Sign in with that account",
          "Visit /admin",
        ],
        expected: "Moderation dashboard visible with report filters and actions.",
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
        expected:
          "Demo/local: listing saved in localStorage. Supabase real mode: row in public.saved_listings.",
        status: "manual",
      },
      {
        id: "mp-message-onboarded",
        label: "Message seller (onboarded)",
        steps: ["While onboarded in demo mode, click Message Seller"],
        expected:
          "Demo: coming-soon message. Supabase real mode: opens /messages conversation.",
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
    description: "Saved listings page with Supabase persistence in real mode.",
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
        expected: "Saved listings displayed. Unsave removes from page and Supabase/local store.",
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
    id: "housing-phase-1",
    title: "Housing Phase 1",
    description: "Supabase-backed housing posts in real product mode.",
    items: [
      {
        id: "housing-browse",
        label: "Browse housing posts",
        steps: ["Visit /housing in real mode"],
        expected:
          "Active housing posts from Supabase. Filters for type, rent, and location. Honest empty state when none exist.",
        status: "manual",
      },
      {
        id: "housing-post-create",
        label: "Post housing",
        steps: [
          "Sign in as verified student",
          "Visit /housing/new",
          "Fill form and upload images",
          "Submit",
        ],
        expected: "Row in housing_posts. Images in housing-images bucket. Redirect to detail page.",
        status: "manual",
      },
      {
        id: "housing-detail",
        label: "Housing detail page",
        steps: ["Open /housing/[id] for an active post"],
        expected:
          "Gallery, rent, location, description, poster info. Message poster opens Supabase housing conversation.",
        status: "manual",
      },
      {
        id: "housing-message-poster",
        label: "Message housing poster",
        steps: [
          "Sign in as verified student (not the poster)",
          "Open /housing/[id]",
          "Click Message poster",
        ],
        expected:
          "Creates or opens housing conversation. Routes to /messages?conversation=.... Realtime/unread work.",
        status: "manual",
      },
      {
        id: "housing-owner",
        label: "Owner controls",
        steps: ["Open your own housing post"],
        expected: "Your post badge, edit, mark inactive, delete. No report button on own post.",
        status: "manual",
      },
      {
        id: "housing-report",
        label: "Report housing post",
        steps: ["Sign in", "Open another user's housing post", "Report housing post"],
        expected: "Report saved with target_type housing_post. Visible in admin dashboard.",
        status: "manual",
      },
      {
        id: "housing-admin-remove",
        label: "Admin remove housing post",
        steps: ["As admin, open housing report", "Remove housing post"],
        expected: "Post status set to removed. Hidden from public browse.",
        status: "manual",
      },
      {
        id: "housing-roommate-soon",
        label: "Roommate matching stays coming soon",
        steps: ["Visit /housing in real mode"],
        expected: "Roommate matching banner only. No fake roommate cards in real mode.",
        status: "manual",
      },
    ],
  },
  {
    id: "housing-messaging",
    title: "Housing Contact Messaging",
    description: "Message housing posters via shared Supabase conversations.",
    items: [
      {
        id: "housing-msg-create",
        label: "Create housing conversation",
        steps: [
          "Account A posts housing",
          "Account B opens housing detail",
          "Click Message poster",
        ],
        expected:
          "Row in conversations with housing_post_id and context_type housing_post. Participants are buyer + poster.",
        status: "manual",
      },
      {
        id: "housing-msg-thread",
        label: "Send and receive housing messages",
        steps: ["Open housing conversation in /messages", "Send message from both accounts"],
        expected: "Messages appear with realtime delivery and unread badges for both users.",
        status: "manual",
      },
      {
        id: "housing-msg-inbox-label",
        label: "Inbox shows housing context",
        steps: ["Open /messages with a housing conversation"],
        expected: "Housing context label and post title. Link back to /housing/[id].",
        status: "manual",
      },
      {
        id: "housing-msg-no-self",
        label: "Cannot message own housing post",
        steps: ["Open your own housing post detail"],
        expected: "No Message poster button. Owner controls only.",
        status: "manual",
      },
      {
        id: "housing-msg-report",
        label: "Report housing conversation messages",
        steps: ["Report message or conversation from housing thread"],
        expected: "Existing report flow works. Admin moderation unchanged.",
        status: "manual",
      },
    ],
  },
  {
    id: "housing-actions",
    title: "Housing Actions (Demo)",
    description: "Demo-mode housing tabs and protected actions.",
    items: [
      {
        id: "housing-contact",
        label: "Contact housing poster",
        steps: ["Visit /housing", "Open a housing post detail"],
        expected:
          "Message poster opens demo or Supabase conversation. No private email exposed.",
        status: "manual",
      },
      {
        id: "housing-roommate",
        label: "Connect with roommate",
        steps: ["Open Roommates tab in demo mode", "Click Connect"],
        expected: "Same protected action behavior as other cards.",
        status: "manual",
      },
    ],
  },
  {
    id: "tutoring-phase-1",
    title: "Tutoring Phase 1",
    description: "Supabase-backed tutor profiles in real product mode.",
    items: [
      {
        id: "tutoring-browse",
        label: "Browse tutor profiles",
        steps: ["Visit /tutoring in real mode"],
        expected:
          "Active tutor profiles from Supabase with subject, rate, and format filters. Honest empty state when none exist.",
        status: "manual",
      },
      {
        id: "tutoring-create",
        label: "Become a tutor",
        steps: ["Sign in", "Visit /tutoring/new", "Fill form and submit"],
        expected: "Row in tutoring_profiles. Redirect to /tutoring/[id]. One profile per user.",
        status: "manual",
      },
      {
        id: "tutoring-detail",
        label: "Tutor detail page",
        steps: ["Open /tutoring/[id] for an active profile"],
        expected:
          "Subjects, rate, format, bio, availability. Message tutor opens conversation. No fake ratings unless review_count > 0.",
        status: "manual",
      },
      {
        id: "tutoring-owner",
        label: "Owner controls",
        steps: ["Open your own tutor profile"],
        expected: "Your profile badge, edit, mark inactive, delete. No report button on own profile.",
        status: "manual",
      },
      {
        id: "tutoring-message",
        label: "Message tutor",
        steps: ["Sign in", "Open another tutor profile", "Click Message tutor"],
        expected:
          "Creates tutor_profile conversation. /messages shows Tutoring context with link back.",
        status: "manual",
      },
      {
        id: "tutoring-report",
        label: "Report tutor profile",
        steps: ["Report another user's tutor profile"],
        expected: "Report saved with target_type tutor_profile. Visible in admin dashboard.",
        status: "manual",
      },
      {
        id: "tutoring-admin-remove",
        label: "Admin remove tutor profile",
        steps: ["As admin, open tutor report", "Remove tutor profile"],
        expected: "Profile status set to removed. Hidden from public browse.",
        status: "manual",
      },
    ],
  },
  {
    id: "tutoring-actions",
    title: "Tutoring Actions (Demo)",
    description: "Demo-mode tutoring browse and protected actions.",
    items: [
      {
        id: "tutor-book",
        label: "Message tutor from detail",
        steps: ["Visit /tutoring", "Open a tutor card", "Click Message tutor"],
        expected: "Signed out → /sign-in. Signed in → demo or Supabase conversation. Booking/payments not offered.",
        status: "manual",
      },
    ],
  },
  {
    id: "lost-found-phase-1",
    title: "Lost & Found Phase 1",
    description: "Supabase-backed lost & found posts in real product mode.",
    items: [
      {
        id: "lost-found-browse",
        label: "Browse lost & found items",
        steps: ["Visit /lost-found in real mode"],
        expected:
          "Active items from Supabase with lost/found filters, search, category, and location. Honest empty state when none exist.",
        status: "manual",
      },
      {
        id: "lost-found-create",
        label: "Post lost/found item",
        steps: ["Sign in", "Visit /lost-found/new", "Fill form and submit"],
        expected:
          "Row in lost_found_items. Images in lost-found-images bucket. Redirect to /lost-found/[id].",
        status: "manual",
      },
      {
        id: "lost-found-detail",
        label: "Item detail page",
        steps: ["Open /lost-found/[id] for an active item"],
        expected:
          "Images, type badge, description, category, location, date, safety guidance. Message poster for non-owners.",
        status: "manual",
      },
      {
        id: "lost-found-owner",
        label: "Owner controls",
        steps: ["Open your own lost/found item"],
        expected:
          "Your post badge, edit, mark resolved, delete. No report or message-self buttons.",
        status: "manual",
      },
      {
        id: "lost-found-message",
        label: "Message poster",
        steps: ["Sign in", "Open another user's item", "Click Message poster"],
        expected:
          "Creates lost_found_item conversation. /messages shows Lost & Found context with link back.",
        status: "manual",
      },
      {
        id: "lost-found-report",
        label: "Report lost/found item",
        steps: ["Report another user's item"],
        expected: "Report saved with target_type lost_found_item. Visible in admin dashboard.",
        status: "manual",
      },
      {
        id: "lost-found-admin-remove",
        label: "Admin remove lost/found item",
        steps: ["As admin, open lost/found report", "Remove item"],
        expected: "Item status set to removed. Hidden from public browse.",
        status: "manual",
      },
    ],
  },
  {
    id: "lost-found-actions",
    title: "Lost & Found Actions (Demo)",
    description: "Demo-mode lost & found browse and protected actions.",
    items: [
      {
        id: "lost-found-contact",
        label: "Message poster from detail",
        steps: ["Visit /lost-found", "Open an item", "Click Message poster"],
        expected:
          "Signed out → /sign-in. Signed in → demo or Supabase conversation. No private email exposed.",
        status: "manual",
      },
    ],
  },
  {
    id: "jobs-phase-1",
    title: "Jobs Phase 1",
    description: "Supabase-backed campus jobs in real product mode.",
    items: [
      {
        id: "jobs-browse",
        label: "Browse campus jobs",
        steps: ["Visit /jobs in real mode"],
        expected:
          "Active jobs from Supabase with type, search, location, and remote filters. Honest empty state when none exist.",
        status: "manual",
      },
      {
        id: "jobs-create",
        label: "Post a job",
        steps: ["Sign in", "Visit /jobs/new", "Fill form and submit"],
        expected: "Row in campus_jobs. Redirect to /jobs/[id].",
        status: "manual",
      },
      {
        id: "jobs-detail",
        label: "Job detail page",
        steps: ["Open /jobs/[id] for an active job"],
        expected:
          "Title, organization, type, pay, location, description, requirements, application link if provided. Message poster for non-owners.",
        status: "manual",
      },
      {
        id: "jobs-owner",
        label: "Owner controls",
        steps: ["Open your own job post"],
        expected: "Your post badge, edit, mark closed, delete. No report or message-self buttons.",
        status: "manual",
      },
      {
        id: "jobs-message",
        label: "Message poster",
        steps: ["Sign in", "Open another user's job", "Click Message poster"],
        expected:
          "Creates campus_job conversation. /messages shows Jobs context with link back.",
        status: "manual",
      },
      {
        id: "jobs-report",
        label: "Report job post",
        steps: ["Report another user's job"],
        expected: "Report saved with target_type campus_job. Visible in admin dashboard.",
        status: "manual",
      },
      {
        id: "jobs-admin-remove",
        label: "Admin remove job post",
        steps: ["As admin, open job report", "Remove job post"],
        expected: "Job status set to removed. Hidden from public browse.",
        status: "manual",
      },
    ],
  },
  {
    id: "jobs-actions",
    title: "Jobs Actions (Demo)",
    description: "Demo-mode jobs browse and protected actions.",
    items: [
      {
        id: "job-contact",
        label: "Message poster from detail",
        steps: ["Visit /jobs", "Open a job card", "Click Message poster"],
        expected:
          "Signed out → /sign-in. Signed in → demo or Supabase conversation. External application links show safety copy.",
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
      {
        id: "e2e-housing",
        label: "Housing E2E",
        steps: ["Run npm run e2e — housing.spec.ts"],
        expected:
          "Browse loads, post CTA auth guard, Message poster flow, demo detail, invalid id not-found pass.",
        status: "automated",
      },
      {
        id: "e2e-tutoring",
        label: "Tutoring E2E",
        steps: ["Run npm run e2e — tutoring.spec.ts"],
        expected:
          "Browse loads, become tutor CTA auth guard, Message tutor flow, demo detail, invalid id not-found pass.",
        status: "automated",
      },
      {
        id: "e2e-lost-found",
        label: "Lost & Found E2E",
        steps: ["Run npm run e2e — lost-found.spec.ts"],
        expected:
          "Browse loads, post CTA auth guard, Message poster flow, demo detail, invalid id not-found pass.",
        status: "automated",
      },
      {
        id: "e2e-jobs",
        label: "Jobs E2E",
        steps: ["Run npm run e2e — jobs.spec.ts"],
        expected:
          "Browse loads, post CTA auth guard, Message poster flow, demo detail, invalid id not-found pass.",
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
        id: "dh-lost-found-real",
        label: "Real mode lost & found has no fake items",
        steps: ["Visit /lost-found in real mode"],
        expected:
          "No mock lost/found cards. Honest empty state with post CTA.",
        status: "manual",
      },
      {
        id: "dh-jobs-real",
        label: "Real mode jobs has no fake listings",
        steps: ["Visit /jobs in real mode"],
        expected:
          "No mock campus job cards. Honest empty state with post CTA.",
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
    id: "supabase-messaging",
    title: "Supabase Messaging (Real Mode)",
    description:
      "When NEXT_PUBLIC_AUTH_MODE=supabase and NEXT_PUBLIC_PRODUCT_MODE=real.",
    items: [
      {
        id: "msg-create-conversation",
        label: "Message Seller creates conversation",
        steps: ["Sign in as buyer", "Open another student's listing", "Click Message Seller"],
        expected: "Routes to /messages with conversation query. Row in public.conversations.",
        status: "manual",
      },
      {
        id: "msg-send",
        label: "Send message inserts row",
        steps: ["In /messages thread, type message and Send"],
        expected: "Message appears in thread. Row in public.messages.",
        status: "manual",
      },
      {
        id: "msg-realtime",
        label: "Realtime message delivery",
        steps: [
          "Open /messages in two browsers as buyer and seller",
          "Send a message from one account",
        ],
        expected:
          "Other account sees the message without pressing Refresh. Conversation list updates.",
        status: "manual",
      },
      {
        id: "msg-unread-badge",
        label: "Unread nav badge",
        steps: [
          "As seller, receive a new buyer message",
          "Check top nav and mobile nav messages icon",
        ],
        expected:
          "Unread badge appears. Opening the conversation clears the badge and updates buyer_last_read_at or seller_last_read_at.",
        status: "manual",
      },
      {
        id: "msg-owner-block",
        label: "Owner cannot message self",
        steps: ["View your own listing"],
        expected: "No Message Seller button. Owner panel shown instead.",
        status: "manual",
      },
      {
        id: "msg-signed-out",
        label: "Signed-out messaging guard",
        steps: ["While signed out, visit /messages"],
        expected: "Redirect to /sign-in.",
        status: "automated",
      },
      {
        id: "msg-invalid-conversation",
        label: "Invalid conversation handled",
        steps: ["Visit /messages?conversation=not-a-real-id while signed in"],
        expected: "Friendly not-found state in thread panel.",
        status: "manual",
      },
      {
        id: "msg-no-fake-real",
        label: "No fake messages in real mode",
        steps: ["Set real mode", "Visit /messages with no conversations"],
        expected: "Empty inbox. No mock Jordan Kim threads.",
        status: "manual",
      },
    ],
  },
  {
    id: "supabase-moderation",
    title: "Supabase Moderation (Real Mode)",
    description:
      "When NEXT_PUBLIC_AUTH_MODE=supabase and NEXT_PUBLIC_PRODUCT_MODE=real, with 003 applied.",
    items: [
      {
        id: "mod-report-listing",
        label: "Report listing",
        steps: ["Open listing detail as non-owner", "Click Report listing", "Submit reason"],
        expected: "Success message shown and row inserted in public.reports.",
        status: "manual",
      },
      {
        id: "mod-report-message",
        label: "Report message",
        steps: ["Open /messages thread", "Use Report on other user's message"],
        expected: "Report row inserted with target_type='message'.",
        status: "manual",
      },
      {
        id: "mod-report-user",
        label: "Report user",
        steps: ["Open seller profile as non-owner", "Click Report user", "Submit"],
        expected: "Report row inserted with target_type='user'.",
        status: "manual",
      },
      {
        id: "mod-admin-dashboard",
        label: "Admin dashboard report visibility",
        steps: ["Sign in as allowlisted admin", "Open /admin"],
        expected: "Reports visible with open/reviewed/resolved/dismissed filters.",
        status: "manual",
      },
      {
        id: "mod-admin-lockout",
        label: "Non-admin lockout",
        steps: ["Sign in as non-allowlisted user", "Open /admin"],
        expected: "Locked admin state shown.",
        status: "manual",
      },
      {
        id: "mod-hide-listing",
        label: "Hide moderated listing",
        steps: ["From admin report card (listing target), click Hide listing"],
        expected: "Listing status becomes removed and listing is hidden from public marketplace.",
        status: "manual",
      },
      {
        id: "mod-service-role",
        label: "No service role key in frontend",
        steps: ["Search src/ and env examples for service_role key usage"],
        expected: "No service_role key used in client code.",
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
