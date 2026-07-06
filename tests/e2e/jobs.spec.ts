import { test, expect } from "@playwright/test";
import { clearKnightMarketStorage, signInAndOnboard } from "./helpers/auth";

test.beforeEach(async ({ page }) => {
  await clearKnightMarketStorage(page);
});

test("jobs page loads with browse heading", async ({ page }) => {
  await page.goto("/jobs");
  await expect(
    page.getByRole("heading", { name: /Find student jobs and gigs/i })
  ).toBeVisible();
  await expect(page.getByTestId("post-job-cta")).toBeVisible();
});

test("signed-out user can browse jobs in demo mode", async ({ page }) => {
  await page.goto("/jobs");
  await expect(page.getByTestId("job-card-job-1")).toBeVisible({ timeout: 15_000 });
});

test("signed-out post job CTA routes to sign-in", async ({ page }) => {
  await page.goto("/jobs");
  await page.getByTestId("post-job-cta").click();
  await expect(page).toHaveURL(/\/sign-in/);
});

test("signed-in user can open job post flow in demo mode", async ({ page }) => {
  await signInAndOnboard(page);
  await page.goto("/jobs/new");
  await expect(page.getByRole("heading", { name: "Post a job" })).toBeVisible();
  await expect(
    page.getByText(/Campus jobs save to Supabase in real product mode/i)
  ).toBeVisible();
});

test("demo job card opens detail page with message poster", async ({ page }) => {
  await page.goto("/jobs");
  const detailLink = page.getByTestId("job-detail-link-job-1");
  await expect(detailLink).toBeVisible({ timeout: 15_000 });
  await detailLink.click();
  await page.waitForURL(/\/jobs\/job-1$/, { timeout: 15_000 });
  await expect(page.getByTestId("job-detail")).toBeVisible();
  await expect(page.getByTestId("message-job-poster-job-1")).toBeVisible();
});

test("signed-in user message poster routes to messages conversation", async ({ page }) => {
  await signInAndOnboard(page);
  await page.goto("/jobs/job-1");
  await page.getByTestId("message-job-poster-job-1").click();
  await page.waitForURL(/\/messages\?conversation=msg-6/, { timeout: 15_000 });
  await expect(
    page.locator('[data-testid="conversation-msg-6"] [data-testid="conversation-context-label"]')
  ).toHaveText("Jobs");
});

test("invalid job id shows not found state", async ({ page }) => {
  await page.goto("/jobs/invalid-job-id");
  await expect(page.getByText("Job not found")).toBeVisible();
});
