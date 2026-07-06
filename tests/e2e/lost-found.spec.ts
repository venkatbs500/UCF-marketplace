import { test, expect } from "@playwright/test";
import { clearKnightMarketStorage, signInAndOnboard } from "./helpers/auth";

test.beforeEach(async ({ page }) => {
  await clearKnightMarketStorage(page);
});

test("lost-found page loads with browse heading", async ({ page }) => {
  await page.goto("/lost-found");
  await expect(
    page.getByRole("heading", { name: /Lost something\? Found something\?/i })
  ).toBeVisible();
  await expect(page.getByTestId("post-lost-found-cta")).toBeVisible();
});

test("signed-out user can browse lost-found items in demo mode", async ({ page }) => {
  await page.goto("/lost-found");
  await expect(page.getByTestId("lost-found-card-lf-1")).toBeVisible({ timeout: 15_000 });
});

test("signed-out post CTA routes to sign-in", async ({ page }) => {
  await page.goto("/lost-found");
  await page.getByTestId("post-lost-found-cta").click();
  await expect(page).toHaveURL(/\/sign-in/);
});

test("signed-in user can open lost-found post flow in demo mode", async ({ page }) => {
  await signInAndOnboard(page);
  await page.goto("/lost-found/new");
  await expect(page.getByRole("heading", { name: "Post lost/found item" })).toBeVisible();
  await expect(
    page.getByText(/Lost & Found posts save to Supabase in real product mode/i)
  ).toBeVisible();
});

test("demo lost-found card opens detail page with message poster", async ({ page }) => {
  await page.goto("/lost-found");
  const detailLink = page.getByTestId("lost-found-detail-link-lf-1");
  await expect(detailLink).toBeVisible({ timeout: 15_000 });
  await detailLink.click();
  await page.waitForURL(/\/lost-found\/lf-1$/, { timeout: 15_000 });
  await expect(page.getByTestId("lost-found-detail")).toBeVisible();
  await expect(page.getByTestId("message-lost-found-poster-lf-1")).toBeVisible();
});

test("signed-in user message poster routes to messages conversation", async ({ page }) => {
  await signInAndOnboard(page);
  await page.goto("/lost-found/lf-1");
  await page.getByTestId("message-lost-found-poster-lf-1").click();
  await page.waitForURL(/\/messages\?conversation=msg-5/, { timeout: 15_000 });
  await expect(
    page.locator('[data-testid="conversation-msg-5"] [data-testid="conversation-context-label"]')
  ).toHaveText("Lost & Found");
});

test("invalid lost-found id shows not found state", async ({ page }) => {
  await page.goto("/lost-found/invalid-item-id");
  await expect(page.getByText("Lost & found item not found")).toBeVisible();
});
