import type { Page } from "@playwright/test";

const STORAGE_KEYS = [
  "knight-market-session",
  "knight-market-saved-listings",
  "knight-market-user-listings",
  "knight-market-listing-draft",
  "knight-market-supabase-pending-email",
];

export async function clearKnightMarketStorage(page: Page) {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.evaluate((keys) => {
    keys.forEach((key) => localStorage.removeItem(key));
    sessionStorage.removeItem("knight-market-auth-redirect");
  }, STORAGE_KEYS);
}

export async function signInAndOnboard(
  page: Page,
  email = "test@ucf.edu",
  name = "Test Student"
) {
  await clearKnightMarketStorage(page);
  await page.goto("/sign-in");
  await page.getByLabel("UCF Email").fill(email);
  await page.getByRole("button", { name: /Send secure sign-in link/i }).click();
  await page.waitForURL("**/verify", { timeout: 15_000 });
  await page.getByLabel("Verification Code").fill("123456");
  await page.getByRole("button", { name: /Verify/i }).click();
  await page.waitForURL("**/onboarding", { timeout: 15_000 });
  await page.getByLabel("Full Name").fill(name);
  await page.getByLabel("Major").fill("Computer Science");
  await page.getByRole("button", { name: "Sophomore" }).click();
  await page.getByLabel("Campus Area").selectOption("Main Campus");
  await page.getByRole("button", { name: "Buying & Selling" }).click();
  await page.getByRole("button", { name: /Join Knight Market/i }).click();
  await page.waitForURL("**/marketplace");
}
