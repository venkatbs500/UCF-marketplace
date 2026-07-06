import { test, expect } from "@playwright/test";
import { clearKnightMarketStorage } from "./helpers/auth";

test.use({ viewport: { width: 390, height: 844 } });

test.beforeEach(async ({ page }) => {
  await clearKnightMarketStorage(page);
});

test("home renders without horizontal overflow on mobile", async ({ page }) => {
  await page.goto("/");
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
});

test("mobile navigation is visible", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("navigation", { name: "Mobile navigation" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Shop tab" })).toBeVisible();
  await expect(page.getByTestId("mobile-nav-more")).toBeVisible();
});

test("mobile explore menu opens lost-found and deals links", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("mobile-nav-more").click();
  await expect(page.getByTestId("mobile-explore-menu")).toBeVisible();
  await expect(page.getByTestId("mobile-explore-lost-found")).toBeVisible();
  await expect(page.getByTestId("mobile-explore-discounts")).toBeVisible();

  await page.getByTestId("mobile-explore-discounts").click();
  await expect(page).toHaveURL(/\/discounts$/);
});

test("marketplace works on mobile", async ({ page }) => {
  await page.goto("/marketplace");
  await expect(page.getByRole("heading", { name: "Marketplace" })).toBeVisible();
  await expect(page.getByLabel("Search marketplace").first()).toBeVisible();
});

test("signed-out profile tab routes to sign-in", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("navigation", { name: "Mobile navigation" })
    .getByRole("link", { name: "Profile tab" })
    .click();
  await expect(page).toHaveURL(/\/sign-in$/);
});
