import { test, expect } from "@playwright/test";
import { clearKnightMarketStorage, signInAndOnboard } from "./helpers/auth";

test.beforeEach(async ({ page }) => {
  await clearKnightMarketStorage(page);
});

test("signed-out visit to /admin redirects to sign-in with redirect", async ({ page }) => {
  await page.goto("/admin");
  await page.waitForURL(/\/sign-in/, { timeout: 15_000 });
  await expect(page).toHaveURL(/redirect=%2Fadmin/);
});

test("non-admin signed-in visit to /admin shows locked state", async ({ page }) => {
  await signInAndOnboard(page, "test@ucf.edu");
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole("heading", { name: "Admin Access Required" })).toBeVisible();
  await expect(page.getByText("Signed-in email:")).toBeVisible();
});

test("demo admin can access moderation dashboard", async ({ page }) => {
  await signInAndOnboard(page, "admin@ucf.edu");
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole("heading", { name: "Moderation Dashboard" })).toBeVisible();
});
