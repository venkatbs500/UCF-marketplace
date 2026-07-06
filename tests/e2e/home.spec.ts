import { test, expect } from "@playwright/test";
import { clearKnightMarketStorage } from "./helpers/auth";

test.beforeEach(async ({ page }) => {
  await clearKnightMarketStorage(page);
});

test("home page loads with hero and trust messaging", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /The campus app/i })
  ).toBeVisible();
  await expect(
    page.getByRole("main").getByText("Built for students. Not officially affiliated with UCF.")
  ).toBeVisible();
});

test("marketplace CTA navigates to marketplace", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /Explore Marketplace/i }).click();
  await expect(page).toHaveURL(/\/marketplace$/);
  await expect(page.getByRole("heading", { name: "Marketplace" })).toBeVisible();
});

test("live module cards link to shipped routes", async ({ page }) => {
  await page.goto("/");

  await page.getByTestId("module-card-housing").click();
  await expect(page).toHaveURL(/\/housing$/);
  await expect(page.getByRole("heading", { name: /Housing/i })).toBeVisible();

  await page.goto("/");
  await page.getByTestId("module-card-discounts").click();
  await expect(page).toHaveURL(/\/discounts$/);
  await expect(
    page.getByRole("heading", { name: /Student discounts and deals/i })
  ).toBeVisible();
});

test("shipped module cards do not show coming soon", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByTestId("module-card-housing")).not.toContainText(/Coming soon/i);
  await expect(page.getByTestId("module-card-jobs")).not.toContainText(/Coming soon/i);
  await expect(page.getByTestId("module-card-discounts")).not.toContainText(/Coming soon/i);
  await expect(page.getByTestId("module-card-events")).not.toContainText(/Coming soon/i);
});

test("AI study tools page shows coming soon", async ({ page }) => {
  await page.goto("/ai");
  await expect(page.getByText(/Coming soon/i).first()).toBeVisible();
});

test("top nav includes Lost & Found and Deals", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");

  await expect(page.getByTestId("top-nav-lost-found")).toBeVisible();
  await expect(page.getByTestId("top-nav-discounts")).toBeVisible();

  await page.getByTestId("top-nav-lost-found").click();
  await expect(page).toHaveURL(/\/lost-found$/);
});
