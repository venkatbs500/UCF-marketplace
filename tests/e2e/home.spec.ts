import { test, expect } from "@playwright/test";
import { clearKnightMarketStorage } from "./helpers/auth";

test.beforeEach(async ({ page }) => {
  await clearKnightMarketStorage(page);
});

test("home page loads with hero and trust messaging", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /The campus app/i })
  ).toBeVisible();
  await expect(
    page.getByRole("main").getByText("Built for students. Not officially affiliated with UCF.")
  ).toBeVisible();
});

test("marketplace CTA navigates to marketplace", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /Explore Marketplace/i }).click();
  await expect(page).toHaveURL(/\/marketplace$/);
  await expect(page.getByRole("heading", { name: "Marketplace" })).toBeVisible();
});
