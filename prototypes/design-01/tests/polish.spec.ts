import { expect, test, type Locator, type Page } from "@playwright/test";
import { asRole, open } from "./helpers";

// DESIGN-01-POLISH regression tests.

type Box = { x: number; y: number; width: number; height: number };
const intersects = (a: Box, b: Box) =>
  Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x) > 0.5 && Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y) > 0.5;
const box = async (l: Locator) => (await l.boundingBox())!;
const strip = (p: Page) => p.getByRole("tablist", { name: "מקטעי כרטיס" });
const scrollPos = (p: Page) => strip(p).evaluate((e) => Math.abs(e.scrollLeft));
const fullyInside = async (inner: Locator, outer: Locator) => {
  const [i, o] = [await box(inner), await box(outer)];
  return i.x >= o.x - 1 && i.x + i.width <= o.x + o.width + 1;
};

test.describe("Task 1 — S03 mobile tab strip", () => {
  for (const w of [360, 390]) {
    test(`@${w}: scroll buttons never overlap the tabs; hint shown on the side with more tabs`, async ({ page }) => {
      await page.setViewportSize({ width: w, height: 844 });
      await open(page, "/s03/C-101");
      const end = page.getByTestId("tabs-more-end");
      await expect(end).toBeVisible();
      await expect(end).toContainText("עוד");
      await expect(page.getByTestId("tabs-more-start")).toBeDisabled();
      expect(intersects(await box(end), await box(strip(page))), "end button overlaps the scroller").toBe(false);
      // Every tab label that is visible is not covered by any scroll button.
      const sb = await box(strip(page));
      for (const t of await strip(page).getByRole("tab").all()) {
        const tb = await box(t);
        const x0 = Math.max(tb.x, sb.x), x1 = Math.min(tb.x + tb.width, sb.x + sb.width);
        if (x1 <= x0) continue; // scrolled out of view — clipped by the strip, not covered
        expect(intersects({ ...tb, x: x0, width: x1 - x0 }, await box(end))).toBe(false);
      }
      // RTL geometry: start (first tab) is on the right, the "more" button on the left edge of the strip.
      expect((await box(end)).x).toBeLessThan((await box(strip(page))).x);
    });
  }

  test.describe("touch (hasTouch + isMobile)", () => {
    test.use({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } });

    test("tap the hint buttons: scrolls toward the end (left) and back (right)", async ({ page }) => {
      await open(page, "/s03/C-101");
      expect(await scrollPos(page)).toBe(0);
      const widthBefore = (await box(strip(page))).width;
      await page.getByTestId("tabs-more-end").tap();
      await expect.poll(() => scrollPos(page)).toBeGreaterThan(40);
      await expect(page.getByTestId("tabs-more-start")).toBeEnabled();
      expect(intersects(await box(page.getByTestId("tabs-more-start")), await box(strip(page)))).toBe(false);
      expect((await box(strip(page))).width, "strip width is stable (no layout shift while scrolling)").toBe(widthBefore);
      await page.getByTestId("tabs-more-start").tap();
      await expect.poll(() => scrollPos(page)).toBeLessThanOrEqual(2);
      await expect(page.getByTestId("tabs-more-start")).toBeDisabled();
    });

    test("finger swipe (CDP touch events) moves the strip both ways and updates the hints", async ({ page }) => {
      await open(page, "/s03/C-101");
      const cdp = await page.context().newCDPSession(page);
      const swipe = async (dir: "toEnd" | "toStart") => {
        const b = await box(strip(page));
        const y = b.y + b.height / 2;
        // RTL: dragging the finger to the right pulls the tabs from the left (end) into view.
        const [x0, x1] = dir === "toEnd" ? [b.x + 20, b.x + b.width - 20] : [b.x + b.width - 20, b.x + 20];
        await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: x0, y }] });
        for (let i = 1; i <= 12; i++) await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: x0 + ((x1 - x0) * i) / 12, y }] });
        await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
      };
      await swipe("toEnd");
      await expect.poll(() => scrollPos(page)).toBeGreaterThan(40);
      await expect(page.getByTestId("tabs-more-start")).toBeEnabled();
      await expect(page.getByRole("tab", { name: "קבצים" })).toBeInViewport();
      await swipe("toStart");
      await expect.poll(() => scrollPos(page)).toBeLessThanOrEqual(2);
      await expect(page.getByTestId("tabs-more-start")).toBeDisabled();
      await expect(page.getByTestId("tabs-more-end")).toBeEnabled();
    });

    test("tapping a partly hidden tab selects it and brings it fully into view", async ({ page }) => {
      await open(page, "/s03/C-101");
      await page.getByTestId("tabs-more-end").tap();
      const files = page.getByRole("tab", { name: "קבצים" });
      await files.tap();
      await expect(files).toHaveAttribute("aria-selected", "true");
      await expect.poll(() => fullyInside(files, strip(page))).toBe(true);
    });
  });

  test("keyboard: arrows/Home/End keep the selected tab fully visible", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await open(page, "/s03/C-101");
    await page.getByRole("tab", { name: "סקירה" }).focus();
    for (const name of ["אנשי קשר", "פעילות", "משימות", "הצעות", "קבצים"]) {
      await page.keyboard.press("ArrowLeft");
      const t = page.getByRole("tab", { name });
      await expect(t).toBeFocused();
      await expect.poll(() => fullyInside(t, strip(page))).toBe(true);
    }
    await expect(page.getByTestId("tabs-more-end")).toBeDisabled();
    // Focus ring is drawn inside the tab, so the scroll container cannot clip it.
    const offset = await page.getByRole("tab", { name: "קבצים" }).evaluate((e) => parseFloat(getComputedStyle(e).outlineOffset));
    expect(offset).toBeLessThan(0);
    await page.keyboard.press("Home");
    await expect(page.getByRole("tab", { name: "סקירה" })).toBeFocused();
    await expect.poll(() => fullyInside(page.getByRole("tab", { name: "סקירה" }), strip(page))).toBe(true);
    await expect(page.getByTestId("tabs-more-end")).toBeEnabled();
  });
});

test.describe("Task 2 — toasts", () => {
  for (const w of [360, 390, 768]) {
    test(`@${w}: docked above the bottom nav, never over the header, nav or the control that triggered it`, async ({ page }) => {
      await asRole(page, "sales");
      await page.setViewportSize({ width: w, height: w < 768 ? 844 : 1024 });
      await open(page, "/s02");
      const trigger = page.getByRole("button", { name: /^שיוך / }).filter({ visible: true }).nth(2);
      await trigger.scrollIntoViewIfNeeded();
      await trigger.click();
      const toast = page.getByTestId("toast");
      await expect(toast).toContainText("אין לך הרשאה");
      const tb = await box(toast);
      expect(tb.y + tb.height).toBeLessThanOrEqual(page.viewportSize()!.height);
      expect(intersects(tb, await box(page.locator("header").first())), "toast over header").toBe(false);
      if (w < 768) expect(intersects(tb, await box(page.locator("nav.fixed.bottom-0"))), "toast over bottom nav").toBe(false);
      expect(intersects(tb, await box(trigger)), "toast over the triggering button").toBe(false);
      // Page reserves the dock height while visible, so the end of the content stays reachable above it.
      const reserve = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--toast-h"));
      expect(parseFloat(reserve)).toBeGreaterThan(0);
      await toast.getByRole("button", { name: "סגירת הודעה" }).click();
      await expect(toast).toHaveCount(0);
      await expect.poll(() => page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--toast-h").trim())).toBe("0px");
    });
  }

  test("@390 S03: after adding a note the toast covers neither the textarea nor the submit button", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await open(page, "/s03/C-101");
    await page.getByRole("tab", { name: "פעילות" }).click();
    const area = page.getByLabel("הוספת הערה");
    await area.fill("בדיקת מיקום הודעה");
    const submit = page.getByRole("button", { name: "הוספת הערה" });
    await submit.scrollIntoViewIfNeeded();
    await submit.click();
    const toast = page.getByTestId("toast");
    await expect(toast).toContainText("ההערה נוספה");
    await expect.poll(async () => intersects(await box(toast), await box(submit))).toBe(false);
    expect(intersects(await box(toast), await box(area))).toBe(false);
  });

  for (const w of [1280, 1440]) {
    test(`@${w}: desktop toast sits in the sidebar column, clear of all page content`, async ({ page }) => {
      await asRole(page, "sales");
      await page.setViewportSize({ width: w, height: 900 });
      await open(page, "/s02");
      await page.locator("tbody tr").first().getByRole("button", { name: /שיוך/ }).click();
      const tb = await box(page.getByTestId("toast"));
      const side = await box(page.locator("nav.fixed.inset-y-0"));
      expect(tb.x).toBeGreaterThanOrEqual(side.x);
      expect(tb.x + tb.width).toBeLessThanOrEqual(side.x + side.width);
      expect(intersects(tb, await box(page.locator("main")))).toBe(false);
      for (const link of await page.locator("nav.fixed.inset-y-0 a").all()) expect(intersects(tb, await box(link))).toBe(false);
    });
  }

  test("screen readers: errors in an assertive alert region, others in a polite status region; Esc closes", async ({ page }) => {
    await asRole(page, "sales");
    await page.setViewportSize({ width: 1440, height: 900 });
    await open(page, "/s02");
    const dock = page.getByTestId("toast-dock");
    await expect(dock.locator('[role="alert"][aria-live="assertive"]')).toHaveCount(1); // mounted before any toast
    await expect(dock.locator('[role="status"][aria-live="polite"]')).toHaveCount(1);
    await page.locator("tbody tr").first().getByRole("button", { name: /שיוך/ }).click();
    await expect(dock.locator('[role="alert"]')).toContainText("אין לך הרשאה");
    await page.goto("/s03/C-101");
    await page.getByRole("button", { name: /התקשרות אל/ }).click();
    await expect(dock.locator('[role="status"]')).toContainText("לא מתבצעת שיחה");
    await dock.getByRole("button", { name: "סגירת הודעה" }).focus();
    await page.keyboard.press("Escape");
    await expect(page.getByTestId("toast")).toHaveCount(0);
  });

  test("auto-dismiss pauses while hovered and resumes after", async ({ page }) => {
    await page.clock.install();
    await page.setViewportSize({ width: 1440, height: 900 });
    await open(page, "/s03/C-101");
    await page.getByRole("button", { name: /התקשרות אל/ }).click();
    const toast = page.getByTestId("toast");
    await toast.hover();
    await page.clock.runFor(15_000);
    await expect(toast).toBeVisible();
    await page.mouse.move(700, 450);
    await page.clock.runFor(7_000);
    await expect(toast).toHaveCount(0);
  });
});

test.describe("Task 3 — placeholder token", () => {
  const PLACEHOLDER = "rgb(135, 158, 179)"; // #879EB3
  const placeholderColors = (p: Page) => p.evaluate(() =>
    [...document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("input[placeholder], textarea[placeholder]")]
      .filter((e) => e.offsetParent).map((e) => getComputedStyle(e, "::placeholder").color));

  test("every visible field with a placeholder uses the token (S01 search, S02 filters + new-lead dialog, S03 note/task)", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    const seen: string[] = [];
    await open(page, "/s01");
    seen.push(...await placeholderColors(page));
    await open(page, "/s02");
    seen.push(...await placeholderColors(page));
    await page.getByRole("button", { name: "פנייה חדשה" }).click();
    seen.push(...await placeholderColors(page));
    await page.keyboard.press("Escape");
    await open(page, "/s03/C-101");
    await page.getByRole("tab", { name: "פעילות" }).click();
    seen.push(...await placeholderColors(page));
    await page.getByRole("tab", { name: "משימות" }).click();
    seen.push(...await placeholderColors(page));
    expect(seen.length).toBeGreaterThanOrEqual(6);
    expect(new Set(seen)).toEqual(new Set([PLACEHOLDER]));
  });
});
