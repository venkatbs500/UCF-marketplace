import { test, expect } from "@playwright/test";
import { clearKnightMarketStorage, signInAndOnboard } from "./helpers/auth";

test.beforeEach(async ({ page }) => {
  await clearKnightMarketStorage(page);
});

test("tutoring page loads with browse heading", async ({ page }) => {
  await page.goto("/tutoring");
  await expect(
    page.getByRole("heading", { name: /Find student tutors/i })
  ).toBeVisible();
  await expect(page.getByTestId("become-tutor-cta")).toBeVisible();
});

test("signed-out become tutor CTA routes to sign-in", async ({ page }) => {
  await page.goto("/tutoring");
  await page.getByTestId("become-tutor-cta").click();
  await expect(page).toHaveURL(/\/sign-in/);
});

test("signed-in user can open become tutor flow in demo mode", async ({ page }) => {
  await signInAndOnboard(page);
  await page.goto("/tutoring/new");
  await expect(page.getByRole("heading", { name: "Become a tutor" })).toBeVisible();
  await expect(
    page.getByText(/Tutor profiles save to Supabase in real product mode/i)
  ).toBeVisible();
});

test("demo tutor card opens detail page with message tutor", async ({ page }) => {
  await page.goto("/tutoring");
  const detailLink = page.getByTestId("tutor-detail-link-tutor-1");
  await expect(detailLink).toBeVisible({ timeout: 15_000 });
  // Tie the click to the navigation so a slow client-side transition cannot be missed.
  await Promise.all([
    page.waitForURL(/\/tutoring\/tutor-1$/, { timeout: 15_000 }),
    detailLink.click(),
  ]);
  // The detail view fetches asynchronously (shows a spinner first), so allow generous
  // time for hydration + fetch before the content assertions instead of the 5s default.
  await expect(page.getByTestId("tutor-detail")).toBeVisible({ timeout: 15_000 });
  await expect(page.getByTestId("message-tutor-tutor-1")).toBeVisible({ timeout: 15_000 });
});

test("signed-in user message tutor routes to messages conversation", async ({ page }) => {
  await signInAndOnboard(page);
  await page.goto("/tutoring/tutor-1");
  await page.getByTestId("message-tutor-tutor-1").click();
  await page.waitForURL(/\/messages\?conversation=msg-2/, { timeout: 15_000 });
  await expect(
    page.locator('[data-testid="conversation-msg-2"] [data-testid="conversation-context-label"]')
  ).toHaveText("Tutoring");
});

test("invalid tutor id shows not found state", async ({ page }) => {
  await page.goto("/tutoring/invalid-tutor-id");
  await expect(page.getByText("Tutor profile not found")).toBeVisible();
});
