import { test, expect } from "@playwright/test";
import { clearKnightMarketStorage, signInAndOnboard } from "./helpers/auth";

test.beforeEach(async ({ page }) => {
  await clearKnightMarketStorage(page);
});

test("messages page loads for signed-in user", async ({ page }) => {
  await signInAndOnboard(page);
  await page.goto("/messages");
  await expect(page.getByRole("heading", { name: "Messages" })).toBeVisible();
  await expect(
    page.getByText("Knight Market only reviews message content when needed for safety reports")
  ).toBeVisible();
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

test("own message shows delete action; other message shows report not delete", async ({
  page,
}) => {
  await signInAndOnboard(page);
  await page.goto("/messages");

  await expect(page.getByTestId("message-delete-msg-1-out")).toBeVisible();
  await expect(page.getByTestId("message-report-msg-1-in")).toBeVisible();
  await expect(page.getByTestId("message-delete-msg-1-in")).toHaveCount(0);
});

test("deleting own message shows Message deleted", async ({ page }) => {
  await signInAndOnboard(page);
  await page.goto("/messages");

  await page.getByTestId("message-delete-msg-1-out").click();
  await expect(page.getByTestId("confirm-dialog")).toBeVisible();
  await page.getByTestId("confirm-delete-message").click();

  await expect(page.getByTestId("message-msg-1-out")).toContainText("Message deleted");
  await expect(page.getByTestId("message-delete-msg-1-out")).toHaveCount(0);
});

test("deleting a conversation removes it from the inbox", async ({ page }) => {
  await signInAndOnboard(page);
  await page.goto("/messages");

  await expect(page.getByTestId("conversation-msg-1")).toBeVisible();

  await page.getByTestId("delete-conversation-button").click();
  await expect(page.getByTestId("confirm-dialog")).toBeVisible();
  await page.getByTestId("confirm-hide-conversation").click();

  await expect(page.getByTestId("conversation-msg-1")).toHaveCount(0);
});
