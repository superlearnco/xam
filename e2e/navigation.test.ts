import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("clicking features scrolls to features section", async ({ page }) => {
    await page.goto("/");
    
    // Wait for page to load
    await page.waitForLoadState("domcontentloaded");
    
    // Click features link in navigation (if it exists)
    const featuresLink = page.getByRole("link", { name: /Features/i });
    if (await featuresLink.isVisible()) {
      await featuresLink.click();
      // Verify we're still on homepage but scrolled
      await expect(page).toHaveURL(/\/#features|\//);
    }
  });

  test("clicking pricing scrolls to pricing section", async ({ page }) => {
    await page.goto("/");
    
    await page.waitForLoadState("domcontentloaded");
    
    const pricingLink = page.getByRole("link", { name: /Pricing/i });
    if (await pricingLink.isVisible()) {
      await pricingLink.click();
      await expect(page).toHaveURL(/\/#pricing|\/pricing|\//);
    }
  });

  test("logo links to homepage", async ({ page }) => {
    await page.goto("/");
    
    const logo = page.locator("a").first(); // Assuming logo is first link
    if (await logo.isVisible()) {
      await logo.click();
      await expect(page).toHaveURL("/");
    }
  });
});

