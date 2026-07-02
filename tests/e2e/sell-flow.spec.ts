import { test, expect } from "@playwright/test";
import { signInAndOnboard } from "./helpers/auth";

test("sell flow creates and publishes a listing", async ({ page }) => {
  const listingTitle = `E2E Test Desk ${Date.now()}`;

  await signInAndOnboard(page);
  await page.goto("/sell");
  await expect(page.getByRole("heading", { name: /Post a Listing/i })).toBeVisible();

  await page.getByPlaceholder("What are you selling?").fill(listingTitle);
  await page.getByLabel("Category").selectOption("furniture");
  await page.getByLabel("Condition").selectOption("good");
  await page.getByPlaceholder("0").fill("25");
  await page.getByLabel("Campus Area").selectOption("Main Campus");
  await page.getByPlaceholder("e.g. Libra, Knights Plaza").fill("Libra");
  await page.getByRole("button", { name: "Continue" }).click();

  await page
    .getByPlaceholder(/Describe your item/i)
    .fill("Great desk for studying. Selling because I am moving off campus soon.");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: /Continue to Preview/i }).click();
  await page.getByRole("button", { name: /Open Preview/i }).click();

  await expect(page).toHaveURL(/\/sell\/preview$/);
  await expect(page.getByText(listingTitle)).toBeVisible();
  await page.getByTestId("publish-listing").click();
  await expect(page.getByText("Listing Published!")).toBeVisible();

  await page.getByRole("link", { name: /View Marketplace/i }).click();
  await page.getByLabel("Search marketplace").fill(listingTitle);
  await expect(page.getByText(listingTitle)).toBeVisible();
});

test("preview blocks publish without a valid draft", async ({ page }) => {
  await signInAndOnboard(page);
  await page.goto("/sell/preview");
  await expect(page.getByText("No draft to preview")).toBeVisible();
});
