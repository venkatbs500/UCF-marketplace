import { test, expect } from "@playwright/test";
import { clearKnightMarketStorage, signInAndOnboard } from "./helpers/auth";

test.beforeEach(async ({ page }) => {
  await clearKnightMarketStorage(page);
});

test("rejects non-UCF email", async ({ page }) => {
  await page.goto("/sign-in");
  await page.getByLabel("UCF Email").fill("student@gmail.com");
  await page.getByRole("button", { name: /Send secure sign-in link/i }).click();
  await expect(
    page.getByRole("alert").filter({
      hasText: "Knight Market is currently limited to verified UCF student emails.",
    })
  ).toBeVisible();
});

test("UCF email proceeds to verification", async ({ page }) => {
  await page.goto("/sign-in");
  await page.getByLabel("UCF Email").fill("test@ucf.edu");
  await page.getByRole("button", { name: /Send secure sign-in link/i }).click();
  await page.waitForURL("**/verify", { timeout: 15_000 });
  await expect(page.getByLabel("Verification Code")).toBeVisible();
});

test("@knights.ucf.edu email proceeds to verification in local mode", async ({ page }) => {
  await page.goto("/sign-in");
  await page.getByLabel("UCF Email").fill("student@knights.ucf.edu");
  await page.getByRole("button", { name: /Send secure sign-in link/i }).click();
  await page.waitForURL("**/verify", { timeout: 15_000 });
  await expect(page.getByLabel("Verification Code")).toBeVisible();
});

test("wrong verification code shows error", async ({ page }) => {
  await page.goto("/sign-in");
  await page.getByLabel("UCF Email").fill("test@ucf.edu");
  await page.getByRole("button", { name: /Send secure sign-in link/i }).click();
  await page.waitForURL("**/verify");
  await page.getByLabel("Verification Code").fill("000000");
  await page.getByRole("button", { name: /Verify/i }).click();
  await expect(
    page.getByRole("alert").filter({ hasText: /Invalid verification code/i })
  ).toBeVisible();
});

test("@ucf.edu email proceeds to verification in local mode", async ({ page }) => {
  await page.goto("/sign-in");
  await page.getByLabel("UCF Email").fill("student@ucf.edu");
  await page.getByRole("button", { name: /Send secure sign-in link/i }).click();
  await page.waitForURL("**/verify", { timeout: 15_000 });
  await expect(page.getByLabel("Verification Code")).toBeVisible();
});

test("full auth flow signs in and signs out", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await signInAndOnboard(page);
  await expect(page.getByRole("button", { name: "User menu" })).toBeVisible();
  await page.getByRole("button", { name: "User menu" }).click();
  await page.getByRole("button", { name: "Sign Out" }).click();
  await expect(page).toHaveURL("/");
  await expect(page.getByRole("link", { name: "Sign In" }).first()).toBeVisible();
});
