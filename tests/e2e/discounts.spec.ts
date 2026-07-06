import { test, expect } from "@playwright/test";
import { clearKnightMarketStorage, signInAndOnboard } from "./helpers/auth";

test.beforeEach(async ({ page }) => {
  await clearKnightMarketStorage(page);
});

test("discounts page loads with browse heading", async ({ page }) => {
  await page.goto("/discounts");
  await expect(
    page.getByRole("heading", { name: /Student discounts and deals/i })
  ).toBeVisible();
  await expect(page.getByTestId("post-discount-cta")).toBeVisible();
});

test("signed-out user can browse discounts in demo mode", async ({ page }) => {
  await page.goto("/discounts");
  await expect(page.getByTestId("discount-card-disc-1")).toBeVisible({ timeout: 15_000 });
});

test("signed-out post discount CTA routes to sign-in", async ({ page }) => {
  await page.goto("/discounts");
  await page.getByTestId("post-discount-cta").click();
  await expect(page).toHaveURL(/\/sign-in/);
});

test("signed-in user can open discount post flow in demo mode", async ({ page }) => {
  await signInAndOnboard(page);
  await page.goto("/discounts/new");
  await expect(page.getByRole("heading", { name: "Post a discount" })).toBeVisible();
  await expect(
    page.getByText(/Student discounts save to Supabase in real product mode/i)
  ).toBeVisible();
});

test("demo discount card opens detail page with message poster", async ({ page }) => {
  await page.goto("/discounts");
  const detailLink = page.getByTestId("discount-detail-link-disc-1");
  await expect(detailLink).toBeVisible({ timeout: 15_000 });
  await detailLink.click();
  await page.waitForURL(/\/discounts\/disc-1$/, { timeout: 15_000 });
  await expect(page.getByTestId("discount-detail")).toBeVisible();
  await expect(page.getByTestId("message-discount-poster-disc-1")).toBeVisible();
});

test("signed-in user message poster routes to messages conversation", async ({ page }) => {
  await signInAndOnboard(page);
  await page.goto("/discounts/disc-1");
  await page.getByTestId("message-discount-poster-disc-1").click();
  await page.waitForURL(/\/messages\?conversation=msg-8/, { timeout: 15_000 });
  await expect(
    page.locator('[data-testid="conversation-msg-8"] [data-testid="conversation-context-label"]')
  ).toHaveText("Discounts");
});

test("invalid discount id shows not found state", async ({ page }) => {
  await page.goto("/discounts/invalid-discount-id");
  await expect(page.getByText("Discount not found")).toBeVisible();
});
