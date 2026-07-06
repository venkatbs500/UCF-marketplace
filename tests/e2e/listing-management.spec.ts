import { test, expect } from "@playwright/test";
import { signInAndOnboard } from "./helpers/auth";

async function publishListing(page: import("@playwright/test").Page, title: string) {
  await page.goto("/sell");
  await page.getByPlaceholder("What are you selling?").fill(title);
  await page.getByLabel("Category").selectOption("scooters");
  await page.getByLabel("Condition").selectOption("good");
  await page.getByPlaceholder("0").fill("120");
  await page.getByLabel("Campus Area").selectOption("Main Campus");
  await page.getByPlaceholder("e.g. Libra, Knights Plaza").fill("Libra");
  await page.getByRole("button", { name: "Continue" }).click();

  await page
    .getByPlaceholder(/Describe your item/i)
    .fill("Well-maintained campus bike. Selling because I am graduating soon.");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: /Continue to Preview/i }).click();
  await page.getByRole("button", { name: /Open Preview/i }).click();

  await expect(page).toHaveURL(/\/sell\/preview$/);
  await page.getByTestId("publish-listing").click();
  await expect(page.getByText("Listing Published!")).toBeVisible();
}

test("user can delete own listing from profile", async ({ page }) => {
  const listingTitle = `E2E Delete Bike ${Date.now()}`;

  await signInAndOnboard(page);
  await publishListing(page, listingTitle);

  await page.goto("/profile");
  await expect(page.getByRole("heading", { name: "My Posted Listings" })).toBeVisible();
  await expect(page.getByText(listingTitle)).toBeVisible();
  await expect(page.getByText("Your listing")).toBeVisible();

  const listingCard = page
    .locator('[data-testid^="listing-card-user-listing-"]')
    .filter({ hasText: listingTitle });
  await listingCard.locator('[data-testid^="delete-listing-"]').click();
  await expect(page.getByTestId("confirm-dialog")).toBeVisible();
  await page.getByTestId("confirm-delete-listing").click({ force: true });

  await expect(page.getByText(listingTitle)).not.toBeVisible();
  await expect(page.getByText("You have not listed anything yet.")).toBeVisible();

  await page.goto("/marketplace");
  await page.getByLabel("Search marketplace").fill(listingTitle);
  await expect(page.getByText(listingTitle)).not.toBeVisible();
});

test("mock marketplace listings do not show owner delete controls", async ({ page }) => {
  await signInAndOnboard(page);
  await page.goto("/marketplace");
  await expect(page.getByTestId("listing-card-listing-2")).toBeVisible();
  await expect(page.getByTestId("delete-listing-listing-2")).not.toBeVisible();
});
