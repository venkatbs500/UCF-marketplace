import { test, expect } from "@playwright/test";
import { clearKnightMarketStorage } from "./helpers/auth";

test.beforeEach(async ({ page }) => {
  await clearKnightMarketStorage(page);
});

test("error demo triggers recovery UI in development", async ({ page }) => {
  await page.goto("/dev/error-demo");
  await page.getByTestId("trigger-error").click();
  await expect(page.getByText(/Something went wrong/i)).toBeVisible();
  await expect(page.getByRole("link", { name: "Go Home" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Reload Page" })).toBeVisible();
});

test("error demo go home navigates away", async ({ page }) => {
  await page.goto("/dev/error-demo");
  await page.getByTestId("trigger-error").click();
  await page.getByRole("link", { name: "Go Home" }).click();
  await expect(page).toHaveURL("/");
});
