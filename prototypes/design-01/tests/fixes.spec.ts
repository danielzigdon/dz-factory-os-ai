import { expect, test } from "@playwright/test";
import { open } from "./helpers";

// DESIGN-01-FIX regression tests.

test("tokens: border-strong on controls, primary-hover #1A84DB on hover", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await open(page, "/s02");
  const border = await page.getByRole("searchbox", { name: "חיפוש פניות" }).evaluate((e) => getComputedStyle(e).borderTopColor);
  expect(border).toBe("rgb(85, 122, 152)"); // #557A98
  const btn = page.getByRole("button", { name: "פנייה חדשה" });
  await btn.hover();
  await expect.poll(() => btn.evaluate((e) => getComputedStyle(e).backgroundColor)).toBe("rgb(26, 132, 219)"); // #1A84DB
  // Decorative separators keep the regular border token.
  const sep = await page.locator("header").first().evaluate((e) => getComputedStyle(e).borderBottomColor);
  expect(sep).toBe("rgb(41, 65, 84)"); // #294154
});

test.describe("notifications popover", () => {
  test.beforeEach(async ({ page }) => { await page.setViewportSize({ width: 1440, height: 900 }); await open(page, "/s01"); });
  const trigger = (page: import("@playwright/test").Page) => page.getByRole("button", { name: /^התראות:/ });

  test("opens with focus inside; Esc closes and returns focus to the trigger", async ({ page }) => {
    await trigger(page).focus();
    await page.keyboard.press("Enter");
    const panel = page.getByRole("region", { name: "התראות" });
    await expect(panel).toBeVisible();
    await expect(trigger(page)).toHaveAttribute("aria-expanded", "true");
    expect(await panel.evaluate((p) => p.contains(document.activeElement))).toBe(true);
    await page.keyboard.press("Tab");
    expect(await panel.evaluate((p) => p.contains(document.activeElement))).toBe(true);
    await page.keyboard.press("Escape");
    await expect(panel).toBeHidden();
    await expect(trigger(page)).toBeFocused();
    await expect(trigger(page)).toHaveAttribute("aria-expanded", "false");
  });

  test("click outside closes", async ({ page }) => {
    await trigger(page).click();
    await expect(page.getByRole("region", { name: "התראות" })).toBeVisible();
    await page.getByRole("heading", { level: 1 }).click();
    await expect(page.getByRole("region", { name: "התראות" })).toBeHidden();
  });

  test("tabbing out of the panel closes it; links navigate", async ({ page }) => {
    await trigger(page).click();
    const panel = page.getByRole("region", { name: "התראות" });
    const n = await panel.locator("a, button").count();
    for (let i = 0; i < n; i++) await page.keyboard.press("Tab");
    await expect(panel).toBeHidden();
    await trigger(page).click();
    await panel.getByRole("link").first().click();
    await expect(page).toHaveURL(/\/s03\//);
  });

  test("close button closes and restores focus", async ({ page }) => {
    await trigger(page).click();
    await page.getByRole("button", { name: "סגירת התראות" }).click();
    await expect(page.getByRole("region", { name: "התראות" })).toBeHidden();
    await expect(trigger(page)).toBeFocused();
  });
});

test.describe("S03 mobile tab scroll hint", () => {
  test("hint at the end, disappears when scrolled to the last tab, start hint appears", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await open(page, "/s03/C-101");
    await expect(page.getByTestId("tabs-more-end")).toBeVisible();
    await expect(page.getByTestId("tabs-more-start")).toHaveCount(0);
    await page.getByTestId("tabs-more-end").click(); // pointer users: the chevron scrolls the strip
    await expect(page.getByTestId("tabs-more-start")).toBeVisible();
    await page.getByRole("tab", { name: "סקירה" }).focus();
    await page.keyboard.press("End");
    await expect(page.getByRole("tab", { name: "קבצים" })).toBeInViewport();
    await expect(page.getByTestId("tabs-more-end")).toHaveCount(0);
    await expect(page.getByTestId("tabs-more-start")).toBeVisible();
    await page.keyboard.press("Home");
    await expect(page.getByTestId("tabs-more-end")).toBeVisible();
  });

  test("no hint on desktop where all tabs fit", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await open(page, "/s03/C-101");
    await expect(page.getByTestId("tabs-more-end")).toHaveCount(0);
    await expect(page.getByTestId("tabs-more-start")).toHaveCount(0);
  });
});

test.describe("simplified top bar + demo area", () => {
  for (const w of [360, 390]) {
    test(`mobile ${w}: single-row header, no demo selects in the staff UI`, async ({ page }) => {
      await page.setViewportSize({ width: w, height: 844 });
      await open(page, "/s01");
      const h = await page.locator("header").first().evaluate((e) => e.getBoundingClientRect().height);
      expect(h).toBeLessThanOrEqual(64);
      await expect(page.locator("header select")).toHaveCount(0);
      await expect(page.getByLabel("תפקיד מדומה")).toBeHidden();
    });
  }

  test("demo area: role switch updates permissions, Esc closes and returns focus", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await open(page, "/s03/C-101");
    await expect(page.getByTestId("confidential")).toHaveCount(1);
    const demo = page.getByRole("button", { name: /נתוני הדגמה/ });
    await demo.click();
    const dlg = page.getByRole("dialog", { name: "אזור הדגמה" });
    await expect(dlg).toBeVisible();
    await dlg.getByLabel("תפקיד מדומה").selectOption("sales");
    await expect(page.getByTestId("confidential")).toHaveCount(0);
    await page.keyboard.press("Escape");
    await expect(dlg).toBeHidden();
    await expect(demo).toBeFocused();
  });
});

test("S03 desktop: overview uses both columns and leaves no large empty area", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await open(page, "/s03/C-101");
  const panel = page.getByRole("tabpanel");
  for (const name of ["פעילות אחרונה", "אנשי קשר", "משימות פתוחות", "הצעות"]) await expect(panel.getByRole("heading", { name })).toBeVisible();
  // Main column and side column end within 120px of each other (balanced, no tall empty block).
  const main = await panel.locator("xpath=ancestor::div[contains(@class,'rounded-panel')][1]").boundingBox();
  const aside = await page.getByRole("complementary", { name: "מידע משני" }).boundingBox();
  expect(Math.abs(main!.y + main!.height - (aside!.y + aside!.height))).toBeLessThan(120);
});
