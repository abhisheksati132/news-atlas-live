import { test, expect } from "playwright/test";

test.describe("NewsAtlas smoke", () => {
  test("dashboard loads with header and globe container", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/NewsAtlas/);
    await expect(page.locator(".brand-wordmark")).toBeVisible();
    await expect(page.locator("#map-container")).toBeAttached();
  });

  test("tab switching works", async ({ page }) => {
    await page.goto("/");
    // Vite dev re-optimizes deps on cold start and hard-reloads the page — wait it out
    await page.waitForTimeout(2500);
    await page.locator("#tab-btn-news").click();
    await expect(page.locator("#tab-news")).toHaveClass(/active/);
    await expect(page.locator("#tab-btn-news")).toHaveClass(/active/);

    await page.locator("#tab-btn-markets").click();
    await expect(page.locator("#tab-markets")).toHaveClass(/active/);
  });

  test("search overlay opens and lists countries", async ({ page }) => {
    await page.goto("/");
    await page.locator('header button:has-text("Search")').click();
    await expect(page.locator("#search-overlay")).toBeVisible();
    await page.locator("#country-search").fill("japan");
    await expect(page.locator("#search-results")).toContainText("Japan", { timeout: 10000 });
  });

  test("country selection loads profile data", async ({ page }) => {
    await page.goto("/?country=India&tab=intel");
    await expect(page.locator("#selected-country-name")).toContainText("India", { timeout: 20000 });
    await expect(page.locator("#fact-currency")).not.toHaveText("--", { timeout: 20000 });
  });

  test("country SEO page renders", async ({ page }) => {
    await page.goto("/country/india/index.html");
    await expect(page.locator("h1")).toContainText("India");
    await expect(page.locator(".facts")).toBeVisible();
  });
});
