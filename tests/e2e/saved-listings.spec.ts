import { test, expect } from "@playwright/test";
import { clearKnightMarketStorage, signInAndOnboard } from "./helpers/auth";

test.beforeEach(async ({ page }) => {
  await clearKnightMarketStorage(page);
});

test("signed-in user can save a listing from marketplace", async ({ page }) => {
  await signInAndOnboard(page);
  await page.goto("/marketplace");

  const saveButton = page.getByRole("button", { name: "Save listing" }).first();
  await saveButton.click();
  await expect(saveButton).toHaveAttribute("aria-label", "Unsave listing");
});

test("saved listing appears on /saved", async ({ page }) => {
  await signInAndOnboard(page);
  await page.goto("/marketplace");

  await page.getByRole("button", { name: "Save listing" }).first().click();
  await page.goto("/saved");

  await expect(page.getByRole("heading", { name: "Saved listings" })).toBeVisible();
  await expect(page.getByRole("link", { name: /View listing:/i }).first()).toBeVisible();
});

test("unsave removes listing from /saved", async ({ page }) => {
  await signInAndOnboard(page);
  await page.goto("/marketplace");

  await page.getByRole("button", { name: "Save listing" }).first().click();
  await page.goto("/saved");
  await expect(page.getByRole("link", { name: /View listing:/i }).first()).toBeVisible();

  await page.getByRole("button", { name: "Unsave listing" }).first().click();
  await expect(page.getByText("No saved listings yet")).toBeVisible();
});

test("signed-out save action redirects to sign-in", async ({ page }) => {
  await page.goto("/marketplace");
  await page.getByRole("button", { name: "Save listing" }).first().click();
  await expect(page).toHaveURL(/\/sign-in$/);
});
