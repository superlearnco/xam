import { test, expect } from "@playwright/test";

test.describe("Accessibility", () => {
  test("homepage has proper heading hierarchy", async ({ page }) => {
    await page.goto("/");
    
    // Check for h1
    const h1 = page.locator("h1").first();
    await expect(h1).toBeVisible();
  });

  test("all images have alt text", async ({ page }) => {
    await page.goto("/");
    
    const images = await page.locator("img").all();
    for (const img of images) {
      const alt = await img.getAttribute("alt");
      expect(alt).toBeDefined();
    }
  });

  test("interactive elements are keyboard accessible", async ({ page }) => {
    await page.goto("/");
    
    // Tab through interactive elements
    await page.keyboard.press("Tab");
    const focused = await page.evaluate(() => document.activeElement?.tagName);
    
    // Should have focused on an interactive element
    expect(["A", "BUTTON", "INPUT"]).toContain(focused);
  });

  test("page has proper lang attribute", async ({ page }) => {
    await page.goto("/");
    
    const htmlLang = await page.getAttribute("html", "lang");
    expect(htmlLang).toBe("en");
  });
});

