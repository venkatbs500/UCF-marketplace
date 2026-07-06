import { test, expect } from "@playwright/test";
import { clearKnightMarketStorage, signInAndOnboard } from "./helpers/auth";

test.beforeEach(async ({ page }) => {
  await clearKnightMarketStorage(page);
});

test("events page loads with browse heading", async ({ page }) => {
  await page.goto("/events");
  await expect(
    page.getByRole("heading", { name: /Discover campus events/i })
  ).toBeVisible();
  await expect(page.getByTestId("post-event-cta")).toBeVisible();
});

test("signed-out user can browse events in demo mode", async ({ page }) => {
  await page.goto("/events");
  await expect(page.getByTestId("event-card-event-1")).toBeVisible({ timeout: 15_000 });
});

test("signed-out post event CTA routes to sign-in", async ({ page }) => {
  await page.goto("/events");
  await page.getByTestId("post-event-cta").click();
  await expect(page).toHaveURL(/\/sign-in/);
});

test("signed-in user can open event post flow in demo mode", async ({ page }) => {
  await signInAndOnboard(page);
  await page.goto("/events/new");
  await expect(page.getByRole("heading", { name: "Post an event" })).toBeVisible();
  await expect(
    page.getByText(/Campus events save to Supabase in real product mode/i)
  ).toBeVisible();
});

test("demo event card opens detail page with message organizer", async ({ page }) => {
  await page.goto("/events");
  const detailLink = page.getByTestId("event-detail-link-event-1");
  await expect(detailLink).toBeVisible({ timeout: 15_000 });
  await detailLink.click();
  await page.waitForURL(/\/events\/event-1$/, { timeout: 15_000 });
  await expect(page.getByTestId("event-detail")).toBeVisible();
  await expect(page.getByTestId("message-event-organizer-event-1")).toBeVisible();
});

test("signed-in user message organizer routes to messages conversation", async ({ page }) => {
  await signInAndOnboard(page);
  await page.goto("/events/event-1");
  await page.getByTestId("message-event-organizer-event-1").click();
  await page.waitForURL(/\/messages\?conversation=msg-7/, { timeout: 15_000 });
  await expect(
    page.locator('[data-testid="conversation-msg-7"] [data-testid="conversation-context-label"]')
  ).toHaveText("Events");
});

test("invalid event id shows not found state", async ({ page }) => {
  await page.goto("/events/invalid-event-id");
  await expect(page.getByText("Event not found")).toBeVisible();
});
