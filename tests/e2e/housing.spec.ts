import { test, expect } from "@playwright/test";
import { clearKnightMarketStorage, signInAndOnboard } from "./helpers/auth";

test.beforeEach(async ({ page }) => {
  await clearKnightMarketStorage(page);
});

test("housing page loads with browse heading", async ({ page }) => {
  await page.goto("/housing");
  await expect(
    page.getByRole("heading", { name: /Find housing near UCF/i })
  ).toBeVisible();
  await expect(page.getByTestId("post-housing-cta")).toBeVisible();
});

test("signed-out post housing CTA routes to sign-in", async ({ page }) => {
  await page.goto("/housing");
  await page.getByTestId("post-housing-cta").click();
  await expect(page).toHaveURL(/\/sign-in/);
});

test("signed-in user can open housing post flow in demo mode", async ({ page }) => {
  await signInAndOnboard(page);
  await page.goto("/housing/new");
  await expect(page.getByRole("heading", { name: "Post housing" })).toBeVisible();
  await expect(
    page.getByText(/Housing posts save to Supabase in real product mode/i)
  ).toBeVisible();
});

test("demo housing card opens detail page with message poster", async ({ page }) => {
  await page.goto("/housing");
  const detailLink = page.getByTestId("housing-detail-link-housing-1");
  await expect(detailLink).toBeVisible({ timeout: 15_000 });
  await detailLink.click();
  await page.waitForURL(/\/housing\/housing-1$/, { timeout: 15_000 });
  await expect(page.getByTestId("housing-detail")).toBeVisible();
  await expect(page.getByTestId("message-housing-poster-housing-1")).toBeVisible();
  await expect(page.getByRole("button", { name: "Message poster" })).toBeVisible();
});

test("signed-in user message poster routes to messages conversation", async ({ page }) => {
  await signInAndOnboard(page);
  await page.goto("/housing/housing-1");
  await page.getByTestId("message-housing-poster-housing-1").click();
  await page.waitForURL(/\/messages\?conversation=msg-3/, { timeout: 15_000 });
  await expect(
    page.locator('[data-testid="conversation-msg-3"] [data-testid="conversation-context-label"]')
  ).toHaveText("Housing");
});

test("invalid housing id shows not found state", async ({ page }) => {
  await page.goto("/housing/invalid-housing-id");
  await expect(page.getByText("Housing post not found")).toBeVisible();
});
