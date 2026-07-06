import { test, expect } from "@playwright/test";
import { signInAndOnboard, clearKnightMarketStorage } from "./helpers/auth";

test.beforeEach(async ({ page }) => {
  await clearKnightMarketStorage(page);
});

test("signed-out visit to /profile redirects to sign-in", async ({ page }) => {
  await page.goto("/profile");
  await page.waitForURL(/\/sign-in$/, { timeout: 15_000 });
  await expect(page).toHaveURL(/\/sign-in$/);
});

test("signed-in profile loads dashboard with overview", async ({ page }) => {
  await signInAndOnboard(page);
  await page.goto("/profile");

  await expect(page.getByTestId("profile-dashboard")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Test Student" })).toBeVisible();
  await expect(page.getByTestId("profile-quick-actions")).toBeVisible();
  await expect(page.getByTestId("my-posts-hub")).toBeVisible();
  await expect(page.getByTestId("profile-account-section")).toBeVisible();
});

test("profile shows My Posts sections with empty states", async ({ page }) => {
  await signInAndOnboard(page);
  await page.goto("/profile");

  await expect(page.getByRole("heading", { name: "My Posts" })).toBeVisible();
  await expect(page.getByTestId("my-posts-marketplace")).toBeVisible();
  await expect(page.getByTestId("profile-empty-marketplace")).toBeVisible();
  await expect(page.getByText("You have not listed anything yet.")).toBeVisible();

  await page.getByTestId("my-posts-tab-housing").click();
  await expect(page.getByTestId("profile-empty-housing")).toBeVisible();
  await expect(page.getByText("You have not posted housing yet.")).toBeVisible();

  await page.getByTestId("my-posts-tab-tutoring").click();
  await expect(page.getByTestId("profile-empty-tutoring")).toBeVisible();

  await page.getByTestId("my-posts-tab-lost-found").click();
  await expect(page.getByTestId("profile-empty-lost-found")).toBeVisible();

  await page.getByTestId("my-posts-tab-jobs").click();
  await expect(page.getByTestId("profile-empty-jobs")).toBeVisible();

  await page.getByTestId("my-posts-tab-events").click();
  await expect(page.getByTestId("profile-empty-events")).toBeVisible();

  await page.getByTestId("my-posts-tab-deals").click();
  await expect(page.getByTestId("profile-empty-deals")).toBeVisible();
});

test("profile quick action links navigate correctly", async ({ page }) => {
  await signInAndOnboard(page);
  await page.goto("/profile");

  await page.getByTestId("profile-quick-action-sell").click();
  await expect(page).toHaveURL(/\/sell$/, { timeout: 15_000 });

  await page.goto("/profile");
  await page.getByTestId("profile-quick-action-housing").click();
  await expect(page).toHaveURL(/\/housing\/new$/, { timeout: 15_000 });
});

test("profile account section includes sign out", async ({ page }) => {
  await signInAndOnboard(page);
  await page.goto("/profile");

  await expect(page.getByTestId("profile-account-section")).toBeVisible();
  await expect(page.getByText("Never share passwords or payment details in chat.")).toBeVisible();
  await expect(page.getByTestId("profile-sign-out")).toBeVisible();
});

test("mobile profile tab opens dashboard", async ({ page }) => {
  await signInAndOnboard(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  await page.getByRole("link", { name: "Profile tab" }).click();
  await expect(page).toHaveURL(/\/profile$/);
  await expect(page.getByTestId("profile-dashboard")).toBeVisible();
  await expect(page.getByTestId("my-posts-hub")).toBeVisible();
});
