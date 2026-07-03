import { test, expect } from "@playwright/test";
import { clearKnightMarketStorage, signInAndOnboard } from "./helpers/auth";

test.beforeEach(async ({ page }) => {
  await clearKnightMarketStorage(page);
});

test("messages page loads for signed-in user", async ({ page }) => {
  await signInAndOnboard(page);
  await page.goto("/messages");
  await expect(page.getByRole("heading", { name: "Messages" })).toBeVisible();
  await expect(page.getByText("Messages are limited to verified students")).toBeVisible();
});

test("unread badge appears in demo mode", async ({ page }) => {
  await signInAndOnboard(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/marketplace");
  await expect(
    page.getByRole("link", { name: /Chat tab, 2 unread/i })
  ).toBeVisible();
});

test("opening demo conversation reduces unread badge", async ({ page }) => {
  await signInAndOnboard(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/messages");
  await expect(
    page.getByRole("link", { name: /Chat tab, 1 unread/i })
  ).toBeVisible();

  await page.getByRole("button", { name: /Mia Chen/i }).click();
  await expect(
    page.getByRole("link", { name: "Chat tab" })
  ).toBeVisible();
});
