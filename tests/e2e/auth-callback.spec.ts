import { test, expect } from "@playwright/test";
import { clearKnightMarketStorage } from "./helpers/auth";

test.beforeEach(async ({ page }) => {
  await clearKnightMarketStorage(page);
});

test("sign-in page renders missing magic link error", async ({ page }) => {
  await page.goto("/sign-in?error=missing_magic_link_code");
  await expect(page.getByTestId("sign-in-error")).toContainText(
    "Your sign-in link was incomplete or expired. Please request a new link from this device."
  );
});

test("sign-in page renders magic link exchange failed error", async ({ page }) => {
  await page.goto("/sign-in?error=magic_link_exchange_failed");
  await expect(page.getByTestId("sign-in-error")).toContainText(
    "We could not finish signing you in. Please request a new link."
  );
});

test("auth callback without code shows safe sign-in error", async ({ page }) => {
  await page.goto("/auth/callback");
  await page.waitForURL(/\/sign-in\?error=missing_magic_link_code/, { timeout: 15_000 });
  await expect(page.getByTestId("sign-in-error")).toBeVisible();
});

test("protected route redirect still includes return path", async ({ page }) => {
  await page.goto("/admin");
  await page.waitForURL(/\/sign-in/, { timeout: 15_000 });
  await expect(page).toHaveURL(/redirect=%2Fadmin/);
});

test("sign-in remembers redirect query for magic link flow", async ({ page }) => {
  await page.goto("/sign-in?redirect=%2Fsell");
  await page.getByLabel("UCF Email").fill("test@ucf.edu");
  await page.getByRole("button", { name: /Send secure sign-in link/i }).click();
  await page.waitForURL("**/verify", { timeout: 15_000 });
  const redirect = await page.evaluate(() =>
    sessionStorage.getItem("knight-market-auth-redirect")
  );
  expect(redirect).toBe("/sell");
});
