import { test, expect } from "@playwright/test";
import { clearKnightMarketStorage } from "./helpers/auth";

test.beforeEach(async ({ page }) => {
  await clearKnightMarketStorage(page);
});

const protectedRoutes = ["/sell", "/messages", "/profile", "/saved"];

for (const route of protectedRoutes) {
  test(`signed-out visit to ${route} redirects to sign-in`, async ({ page }) => {
    await page.goto(route);
    await page.waitForURL(/\/sign-in$/, { timeout: 15_000 });
    await expect(page).toHaveURL(/\/sign-in$/);
  });
}

test("signed-out save action redirects to sign-in", async ({ page }) => {
  await page.goto("/marketplace");
  await page.getByRole("button", { name: "Save listing" }).first().click();
  await expect(page).toHaveURL(/\/sign-in$/);
});
