import { test, expect } from "@playwright/test";
import { clearKnightMarketStorage } from "./helpers/auth";

test.beforeEach(async ({ page }) => {
  await clearKnightMarketStorage(page);
});

async function expectResetWorks(
  page: import("@playwright/test").Page,
  {
    route,
    searchLabel,
    visibleCardTestId,
    resetTestId = "browse-empty-reset",
    emptyStateTestId = "browse-empty-state",
  }: {
    route: string;
    searchLabel: string;
    visibleCardTestId: string;
    resetTestId?: string;
    emptyStateTestId?: string;
  }
) {
  await page.goto(route, { waitUntil: "networkidle" });

  const resultCount = page.getByRole("main").getByTestId("browse-result-count").first();
  await expect(resultCount).toBeVisible();

  await page.getByLabel(searchLabel).fill("zzzz-no-match-zzzz");
  await expect(page.getByRole("main").getByTestId(emptyStateTestId).first()).toBeVisible();

  const resetButton = page.getByRole("main").getByTestId(resetTestId).first();
  await expect(resetButton).toBeVisible();
  await resetButton.click();

  await expect(resultCount).not.toContainText(/match your filters/i, { timeout: 15_000 });
  await expect(page.getByRole("main").getByTestId(visibleCardTestId)).toBeVisible({
    timeout: 15_000,
  });
}

const DISCOVERY_MODULES = [
  {
    name: "marketplace",
    route: "/marketplace",
    searchLabel: "Search marketplace",
    visibleCardTestId: "listing-card-listing-2",
    resetTestId: "browse-reset-filters",
    emptyStateTestId: "browse-result-count",
  },
  {
    name: "housing",
    route: "/housing",
    searchLabel: "Search housing",
    visibleCardTestId: "housing-detail-link-housing-1",
  },
  {
    name: "tutoring",
    route: "/tutoring",
    searchLabel: "Search tutoring",
    visibleCardTestId: "tutor-card-tutor-1",
  },
  {
    name: "lost-found",
    route: "/lost-found",
    searchLabel: "Search lost and found",
    visibleCardTestId: "lost-found-card-lf-1",
  },
  {
    name: "jobs",
    route: "/jobs",
    searchLabel: "Search jobs",
    visibleCardTestId: "job-card-job-1",
  },
  {
    name: "events",
    route: "/events",
    searchLabel: "Search events",
    visibleCardTestId: "event-card-event-1",
  },
  {
    name: "discounts",
    route: "/discounts",
    searchLabel: "Search discounts",
    visibleCardTestId: "discount-card-disc-1",
  },
] as const;

for (const discoveryModule of DISCOVERY_MODULES) {
  test(`discovery search + reset on ${discoveryModule.name} (demo mode)`, async ({ page }) => {
    await expectResetWorks(page, discoveryModule);
  });
}
