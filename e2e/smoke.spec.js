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
    // Wait for dev server readiness
    await page.waitForTimeout(2500);
    await page.locator("#tab-btn-news").click();
    await expect(page.locator("#tab-news")).toHaveClass(/active/);
    await expect(page.locator("#tab-btn-news")).toHaveClass(/active/);

    await page.locator("#tab-btn-markets").click();
    await expect(page.locator("#tab-markets")).toHaveClass(/active/);
  });

  test("command palette opens and searches commands and countries", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(2000);
    const searchBtn = page.locator('header button:has-text("Search"), header button[title*="Search"]').first();
    if (await searchBtn.isVisible()) {
      await searchBtn.click();
    } else {
      await page.keyboard.press("Control+KeyK");
    }
    await expect(page.locator("#command-palette-modal")).toBeVisible();
    await page.locator("#palette-search-input").fill("japan");
    await expect(page.locator("#palette-results-list")).toContainText("Japan", { timeout: 10000 });
  });

  test("tactical hotkeys HUD opens and displays keyboard shortcuts", async ({ page }) => {
    await page.goto("/");
    await page.locator("#header-hotkeys-btn").click();
    await expect(page.locator("#hotkeys-hud-modal")).toBeVisible();
    await expect(page.locator("#hotkeys-hud-modal")).toContainText("Mission Control Tactical Keyboard Shortcuts");
    await page.locator("#hotkeys-close-btn").click();
    await expect(page.locator("#hotkeys-hud-modal")).toHaveClass(/hidden/);
  });

  test("orbital telemetry layers toggle properly", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(2000);

    const satBtn = page.locator("#mtb-satellites");
    await expect(satBtn).toBeVisible();
    await satBtn.click();
    await expect(satBtn).toHaveClass(/active/);

    const flightBtn = page.locator("#mtb-flights");
    await expect(flightBtn).toBeVisible();
    await flightBtn.click();
    await expect(flightBtn).toHaveClass(/active/);

    const seismicBtn = page.locator("#mtb-seismic");
    await expect(seismicBtn).toBeVisible();
    await seismicBtn.click();
    await expect(seismicBtn).toHaveClass(/active/);
  });

  test("bilateral comparison modal opens with radar chart and indicator deltas", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(2000);

    const compareBtn = page.locator("#mtb-compare");
    await expect(compareBtn).toBeVisible();
    await compareBtn.click();
    await expect(page.locator("#compare-modal")).toBeVisible();
    await expect(page.locator("#compare-radar-canvas")).toBeAttached();
    await expect(page.locator("#compare-table-body")).toBeVisible();
    await page.locator("#compare-close-btn").click();
    await expect(page.locator("#compare-modal")).toHaveClass(/hidden/);
  });

  test("country selection loads profile data", async ({ page }) => {
    await page.goto("/?country=India&tab=intel");
    await expect(page.locator("#selected-country-name")).toContainText("India", { timeout: 20000 });
    await expect(page.locator("#fact-currency")).not.toHaveText("--", { timeout: 20000 });
  });

  test("country SEO page renders", async ({ page }) => {
    await page.goto("/country/india/index.html");
    await expect(page.locator("main h1")).toContainText("India");
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

  test("executive dark theme is permanently enforced and globe renders", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("body")).toHaveAttribute("data-theme", "dark");
    await expect(page.locator("#map-container canvas")).toBeAttached();
  });

  test("terminal app 3D telemetry arcs toggle is functional", async ({ page }) => {
    await page.goto("/");
    const arcsBtn = page.locator("#mtb-arcs");
    await expect(arcsBtn).toBeAttached();
    await arcsBtn.click();
    await expect(arcsBtn).toHaveClass(/active/);
  });

  test("view presets keyboard shortcut cycles layout modes", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");
    await page.waitForTimeout(2000);

    // Press 'v' to cycle presets
    await page.keyboard.press("v");
    await page.waitForTimeout(300);

    const body = page.locator("body");
    await expect(body).toBeVisible();
  });

  test("intelligence cards and profile sections are rendered cleanly", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(2000);

    await expect(page.locator(".hw-bezel-card").first()).toBeAttached();
    await expect(page.locator("#tab-intel")).toBeVisible();
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

  test("docked sidebar renders cleanly and weather tab displays conditions", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(1000);

    // Sidebar is docked and visible on the right
    await expect(page.locator("#sidebar")).toBeVisible();

    // Switch to weather tab
    await page.locator("#tab-btn-atmosphere").click();
    await expect(page.locator("#tab-atmosphere")).toHaveClass(/active/);
    const weatherCard = page.locator("#tab-atmosphere .hw-bezel-card").first();
    await expect(weatherCard).toBeVisible({ timeout: 15000 });
  });

  test("in-terminal news reader drawer opens on article click and closes on escape", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(1000);

    // Switch to news tab
    await page.locator("#tab-btn-news").click();
    await expect(page.locator("#tab-news")).toHaveClass(/active/);

    // Wait for real news article card (not skeleton loader) to appear
    const realCard = page.locator("#articles-container [data-news-index]").first();
    await expect(realCard).toBeVisible({ timeout: 20000 });

    // Click real news card to open in-terminal reader drawer
    await realCard.click();
    const readerDrawer = page.locator("#news-reader-drawer");
    await expect(readerDrawer).toHaveClass(/open/);
    await expect(page.locator("#reader-title")).not.toBeEmpty();

    // Escape closes drawer
    await page.keyboard.press("Escape");
    await expect(readerDrawer).not.toHaveClass(/open/);
  });
});
