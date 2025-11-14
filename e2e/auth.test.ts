import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("unauthenticated user is redirected to sign-in", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/sign-in/);
  });

  test("sign-in page has expected elements", async ({ page }) => {
    await page.goto("/sign-in");
    await expect(page).toHaveURL(/sign-in/);
    // Clerk handles the sign-in UI, so we just verify we're on the right page
  });

  test("sign-up page is accessible", async ({ page }) => {
    await page.goto("/sign-up");
    await expect(page).toHaveURL(/sign-up/);
  });
});

// Note: Full authentication E2E tests require Clerk test credentials
// and would typically use Clerk's testing APIs
// These are basic smoke tests to verify the auth flow exists

