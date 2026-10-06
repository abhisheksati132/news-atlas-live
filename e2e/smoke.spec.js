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

  test("landing page interactive 3D Earth mounts and switches hubs", async ({ page }) => {
    await page.goto("/landing.html");
    await expect(page.locator("#landing-globe-3d canvas")).toBeAttached({ timeout: 15000 });
    await expect(page.locator("#preview-country-name")).toBeVisible();

    // Click Tokyo capital hub pill
    const tokyoBtn = page.locator('button[data-3d-hub="jp"]');
    if (await tokyoBtn.isVisible()) {
      await tokyoBtn.click();
      await expect(page.locator("#preview-country-name")).toContainText("Japan", { timeout: 5000 });
    }
  });

  test("day to night and night to day theme toggle keeps globe intact", async ({ page }) => {
    await page.goto("/");
    const themeBtn = page.locator("#theme-toggle-btn");
    await expect(themeBtn).toBeVisible();

    // Toggle to Light mode
    await themeBtn.click();
    await expect(page.locator("body")).toHaveAttribute("data-theme", "light");

    // Toggle back to Dark mode
    await themeBtn.click();
    await expect(page.locator("body")).toHaveAttribute("data-theme", "dark");

    // Ensure map container canvas remains active and attached
    await expect(page.locator("#map-container canvas")).toBeAttached();
  });

  test("terminal app 3D telemetry arcs toggle is functional", async ({ page }) => {
    await page.goto("/");
    const arcsBtn = page.locator("#mtb-arcs");
    await expect(arcsBtn).toBeAttached();
    await arcsBtn.click();
    await expect(arcsBtn).toHaveClass(/active/);
  });

  test("view presets switch layout modes and zen exit pill works", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");
    await page.waitForTimeout(2000);

    const presetWrap = page.locator("#view-preset-selector");
    await expect(presetWrap).toBeVisible();

    // Switch to Tactical HUD
    await page.locator('button[data-preset="tactical"]').click();
    await expect(page.locator("body")).toHaveClass(/layout-tactical/);

    // Switch to Split 50/50
    await page.locator('button[data-preset="split"]').click();
    await expect(page.locator("body")).toHaveClass(/layout-split/);

    // Switch to Zen
    await page.locator('button[data-preset="zen"]').click();
    await expect(page.locator("body")).toHaveClass(/layout-zen/);
    const zenPill = page.locator("#zen-exit-pill");
    await expect(zenPill).toHaveClass(/active/);

    // Exit Zen back to Cockpit
    await zenPill.locator("button").click({ force: true });
    await expect(page.locator("body")).toHaveClass(/layout-cockpit/);
  });

  test("hardware double-bezel cards and micro-kickers are rendered", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(2000);

    await expect(page.locator(".hw-bezel-card").first()).toBeAttached();
    await expect(page.locator(".hw-kicker").first()).toBeAttached();
  });

  test("audio haptic feedback toggle button exists and toggles state", async ({ page }) => {
    await page.goto("/");
    const audioBtn = page.locator("#audio-toggle-btn");
    await expect(audioBtn).toBeVisible();
    await audioBtn.click();
    await expect(page.locator("#audio-toggle-icon")).toHaveClass(/fa-volume-high/);
    await audioBtn.click();
    await expect(page.locator("#audio-toggle-icon")).toHaveClass(/fa-volume-xmark/);
  });
});

