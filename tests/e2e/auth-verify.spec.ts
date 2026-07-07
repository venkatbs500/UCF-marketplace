import { test, expect } from "@playwright/test";
import { clearKnightMarketStorage } from "./helpers/auth";

test.beforeEach(async ({ page }) => {
  await clearKnightMarketStorage(page);
});

async function goToVerifyWithEmail(page: import("@playwright/test").Page, email = "test@ucf.edu") {
  await page.goto("/sign-in");
  await page.getByLabel("UCF Email").fill(email);
  await page.getByRole("button", { name: /Send secure sign-in link/i }).click();
  await page.waitForURL("**/verify**", { timeout: 15_000 });
}

test("verify shows pending email when available", async ({ page }) => {
  await goToVerifyWithEmail(page, "student@ucf.edu");
  await expect(page.getByTestId("magic-link-email")).toHaveText("student@ucf.edu");
  await expect(page.getByTestId("verify-page")).toBeVisible();
});

test("verify has resend sign-in link action", async ({ page }) => {
  await goToVerifyWithEmail(page);
  await expect(page.getByTestId("verify-resend-link")).toBeVisible();
});

test("verify has use a different email action", async ({ page }) => {
  await goToVerifyWithEmail(page);
  await expect(page.getByTestId("verify-use-different-email")).toBeVisible();
});

test("use a different email clears pending email and returns to sign-in", async ({ page }) => {
  await goToVerifyWithEmail(page, "student@ucf.edu");
  await page.getByTestId("verify-use-different-email").click();
  await page.waitForURL(/\/sign-in/, { timeout: 15_000 });

  const pending = await page.evaluate(() => {
    const raw = localStorage.getItem("knight-market-session");
    if (!raw) return null;
    return JSON.parse(raw).pendingEmail as string | null;
  });
  expect(pending).toBeNull();
  await expect(page.getByLabel("UCF Email")).toHaveValue("");
});

test("missing pending email shows friendly error and sign-in CTA", async ({ page }) => {
  await page.goto("/verify");
  await expect(page.getByTestId("verify-missing-email")).toBeVisible();
  await expect(page.getByTestId("verify-error")).toContainText(
    "We do not know which email to resend to. Please enter your UCF email again."
  );
  await expect(page.getByRole("link", { name: "Go to sign in" })).toBeVisible();
});

test("resend button enters cooldown state", async ({ page }) => {
  await goToVerifyWithEmail(page);
  await page.getByTestId("verify-resend-link").click();
  await expect(page.getByTestId("verify-success")).toContainText(
    "New sign-in link sent. Use the newest email link."
  );
  await expect(page.getByTestId("verify-resend-link")).toBeDisabled();
  await expect(page.getByTestId("verify-resend-cooldown")).toContainText(
    /You can request another link in \d+ seconds/i
  );
});

test("protected redirect is preserved through verify", async ({ page }) => {
  await page.goto("/sign-in?redirect=%2Fadmin");
  await page.getByLabel("UCF Email").fill("test@ucf.edu");
  await page.getByRole("button", { name: /Send secure sign-in link/i }).click();
  await page.waitForURL(/\/verify\?redirect=%2Fadmin/, { timeout: 15_000 });

  const redirect = await page.evaluate(() =>
    sessionStorage.getItem("knight-market-auth-redirect")
  );
  expect(redirect).toBe("/admin");
});

test("verify has back to sign in action", async ({ page }) => {
  await goToVerifyWithEmail(page);
  await page.getByTestId("verify-back-to-sign-in").click();
  await page.waitForURL(/\/sign-in/, { timeout: 15_000 });
});
