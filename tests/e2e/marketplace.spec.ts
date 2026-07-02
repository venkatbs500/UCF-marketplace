import { test, expect } from "@playwright/test";
import { clearKnightMarketStorage } from "./helpers/auth";

test.beforeEach(async ({ page }) => {
  await clearKnightMarketStorage(page);
});

test("marketplace loads listings and supports search", async ({ page }) => {
  await page.goto("/marketplace");
  await expect(page.getByRole("heading", { name: "Marketplace" })).toBeVisible();
  await expect(page.getByRole("link", { name: /View listing:/i }).first()).toBeVisible();

  await page.getByLabel("Search marketplace").fill("Calculus");
  await expect(page.getByText(/Calculus Early Transcendentals/i)).toBeVisible();
});

test("category filter does not crash marketplace", async ({ page }) => {
  await page.goto("/marketplace");
  await page.getByRole("button", { name: /📚\s*Textbooks/i }).click();
  await expect(page.getByRole("heading", { name: /Listing/i })).toBeVisible();
});

test("default marketplace view does not duplicate featured listing cards", async ({ page }) => {
  await page.goto("/marketplace");
  await expect(page.getByTestId("featured-listings-section")).toBeVisible();
  const calculusCards = page.getByTestId("listing-card-listing-2");
  await expect(calculusCards).toHaveCount(1);
});

test("listing detail shows key information", async ({ page }) => {
  await page.goto("/marketplace");
  const detailLink = page.getByTestId("listing-detail-link-listing-2");
  await expect(detailLink).toBeVisible();

  await Promise.all([
    page.waitForURL(/\/marketplace\/listing-2$/),
    detailLink.click(),
  ]);

  await expect(page.getByTestId("listing-detail")).toBeVisible();
  await expect(page.getByText(/Calculus Early Transcendentals/i)).toBeVisible();
  await expect(page.getByTestId("safety-tips-card")).toBeVisible();
  await expect(page.getByText("Safety Tips")).toBeVisible();
});

test("invalid listing shows not-found state", async ({ page }) => {
  await page.goto("/marketplace/not-a-real-listing-id");
  await expect(page.getByTestId("listing-not-found")).toBeVisible();
  await expect(page.getByText("Listing not found")).toBeVisible();
});
