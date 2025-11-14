import { test, expect } from "@playwright/test";

test.describe("Smoke Tests", () => {
  test("homepage loads successfully", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/xam/i);
  });

  test("homepage has hero section", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: /AI-Powered Test Creation/i })
    ).toBeVisible();
  });

  test("homepage has get started button", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: /Get Started/i })).toBeVisible();
  });

  test("homepage has features section", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByText(/AI Question Generation/i)
    ).toBeVisible();
  });

  test("homepage has pricing section", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByText(/Pay-Per-Use/i)
    ).toBeVisible();
  });

  test("sign in page is accessible", async ({ page }) => {
    await page.goto("/sign-in");
    // Clerk sign-in form should be present
    // This test will vary based on Clerk configuration
    await expect(page).toHaveURL(/sign-in/);
  });
});

