import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// Public company website demo (docs/19, docs/20). Replaces the hand-kept mobile-preview.html copy (WEB-FIX-01).
const URL = "/company-preview/index.html";

for (const w of [320, 360, 390, 768, 1440]) {
  test(`website @${w}: RTL, no page overflow, nothing off-screen, axe WCAG 2.2 AA clean, no external requests`, async ({ page }) => {
    const external: string[] = [];
    page.on("request", (r) => { if (!r.url().startsWith("http://localhost:3100")) external.push(r.url()); });
    await page.setViewportSize({ width: w, height: 900 });
    await page.goto(URL);
    await page.waitForLoadState("networkidle");
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.locator("html")).toHaveAttribute("lang", "he");
    await expect(page.locator("h1")).toHaveCount(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth), "page overflow").toBeLessThanOrEqual(0);
    const offscreen = await page.evaluate(() => [...document.querySelectorAll<HTMLElement>("header *, main *, footer *")]
      .filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && e.offsetParent && (r.left < -1 || r.right > innerWidth + 1) && !e.closest("[aria-hidden=true]"); })
      .map((e) => `${e.tagName}.${e.className}`));
    expect(offscreen, "elements outside the viewport").toEqual([]);
    const ax = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    expect(ax.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
    expect(external).toEqual([]);
  });
}

test("website: text at 200% reflows without horizontal scroll (WCAG 1.4.4 / 1.4.10)", async ({ page }) => {
  await page.setViewportSize({ width: 640, height: 900 });
  await page.goto(URL);
  await page.addStyleTag({ content: "html{font-size:200% !important}" });
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
});

test("website: logo is a light display asset (≤ 60 KB) with an accessible name", async ({ page, request }) => {
  const res = await request.get("/company-preview/logo.png");
  expect(res.status()).toBe(200);
  expect((await res.body()).length).toBeLessThanOrEqual(60 * 1024);
  await page.goto(URL);
  await expect(page.locator("header img").first()).toHaveAttribute("alt", /יובל גוונים/);
  expect(await page.locator("header img").first().evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0)).toBe(true);
});

test("website @360: menu toggle opens/closes, Esc returns focus", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto(URL);
  const toggle = page.locator("button.menu-toggle");
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("#main-nav")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(toggle).toBeFocused();
});

test("website: demo form validates, never submits, and says so", async ({ page }) => {
  const posts: string[] = [];
  page.on("request", (r) => { if (r.method() !== "GET") posts.push(r.url()); });
  await page.goto(URL);
  const form = page.locator("#quote-form");
  await form.locator('[type="submit"]').click();
  await expect(page.locator("#customer-name")).toHaveAttribute("aria-invalid", "true");
  await expect(page.locator("#customer-name")).toBeFocused();
  await page.locator("#customer-name").fill("לקוח בדיקה");
  await page.locator("#reply").fill("test@example.co.il");
  await page.locator("#description").fill("פרופילי אלומיניום לבדיקה, כמות קטנה");
  await form.locator('[type="submit"]').click();
  await expect(page.locator("#form-result")).toContainText(/הדגמה|אינ/);
  expect(posts).toEqual([]);
});

test("website: privacy dialog opens and closes with Esc", async ({ page }) => {
  await page.goto(URL);
  await page.locator('[data-modal="privacy"]').first().click();
  await expect(page.locator("#privacy")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator("#privacy")).toBeHidden();
});

test("website: protected-preview headers and CSP", async ({ request, page }) => {
  const h = (await request.get(URL)).headers();
  expect(h["x-robots-tag"]).toContain("noindex");
  expect(h["x-frame-options"]).toBe("DENY");
  await page.goto(URL);
  const csp = await page.locator('meta[http-equiv="Content-Security-Policy"]').getAttribute("content");
  expect(csp).toContain("connect-src 'none'");
  expect(csp).toContain("form-action 'none'");
});

// WEBSITE-PHOTOS-REVIEW-01: supplied photographs and the accessible photo viewer.
test("website: every photo asset is local, decodes, stays ≤ 200 KB and has alt text", async ({ page, request }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(URL);
  const srcs = await page.locator("main img[src*='assets/']").evaluateAll((els) => [...new Set(els.map((e) => e.getAttribute("src")!))]);
  expect(srcs.length).toBeGreaterThanOrEqual(6);
  for (const s of srcs) {
    const res = await request.get(`/company-preview/${s}`);
    expect(res.status(), s).toBe(200);
    expect((await res.body()).length, s).toBeLessThanOrEqual(200 * 1024);
  }
  for (const img of await page.locator("main img[src*='assets/']").all()) {
    expect((await img.getAttribute("alt"))?.trim().length ?? 0).toBeGreaterThan(5);
    await img.scrollIntoViewIfNeeded();
    await expect.poll(() => img.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0)).toBe(true);
  }
});

for (const w of [390, 1440]) {
  test(`website @${w}: photo viewer opens by keyboard, shows the image + caption, Esc and × close it and return focus`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: 900 });
    await page.goto(URL);
    const buttons = page.locator("button.photo-button");
    expect(await buttons.count()).toBeGreaterThanOrEqual(6);
    const first = buttons.first();
    await first.scrollIntoViewIfNeeded();
    await first.focus();
    await page.keyboard.press("Enter");
    const viewer = page.locator("#photo-viewer");
    await expect(viewer).toBeVisible();
    const caption = await first.getAttribute("data-caption");
    await expect(viewer).toContainText(caption!);
    await expect(page.locator("#photo-large")).toHaveAttribute("src", /assets\/.+\.webp$/);
    await expect.poll(() => page.locator("#photo-large").evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0)).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
    await page.keyboard.press("Escape");
    await expect(viewer).toBeHidden();
    await expect(first).toBeFocused();
    const last = buttons.last();
    await last.scrollIntoViewIfNeeded();
    await last.click();
    await expect(viewer).toContainText((await last.getAttribute("data-caption"))!);
    await viewer.getByRole("button", { name: "סגירת התמונה המוגדלת" }).click();
    await expect(viewer).toBeHidden();
    await expect(last).toBeFocused();
  });
}

// A11Y-CAROUSEL-01: hero photo carousel (WEBSITE-DESIGN-02).
test.describe("website hero carousel", () => {
  const img = (p: import("@playwright/test").Page) => p.locator("#hero-slide-image");
  const current = (p: import("@playwright/test").Page) => p.locator('.slide-dot[aria-current="true"]');

  for (const w of [320, 390, 1440]) {
    test(`@${w}: every carousel control is a ≥ 24×24 target (WCAG 2.2 2.5.8) and fits on screen`, async ({ page }) => {
      await page.setViewportSize({ width: w, height: 900 });
      await page.goto(URL);
      for (const c of await page.locator(".slide-dot, .slide-control, .slide-toggle").all()) {
        const b = (await c.boundingBox())!;
        expect(b.width, await c.getAttribute("aria-label") ?? "").toBeGreaterThanOrEqual(24);
        expect(b.height).toBeGreaterThanOrEqual(24);
        expect(b.x).toBeGreaterThanOrEqual(0);
        expect(b.x + b.width).toBeLessThanOrEqual(w);
      }
    });
  }

  test("next / previous wrap, dots select, live status announces, keyboard works", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" }); // no autoplay interference
    await page.goto(URL);
    const first = await img(page).getAttribute("src");
    await page.getByRole("button", { name: "התמונה הבאה" }).click();
    await expect(current(page)).toHaveAttribute("aria-label", "תמונה 2 מתוך 5");
    await expect(img(page)).not.toHaveAttribute("src", first!);
    await expect(page.locator("#slide-status")).toContainText("תמונה 2 מתוך 5");
    await page.getByRole("button", { name: "התמונה הקודמת" }).click();
    await page.getByRole("button", { name: "התמונה הקודמת" }).click();
    await expect(current(page)).toHaveAttribute("aria-label", "תמונה 5 מתוך 5");
    await page.getByRole("button", { name: "תמונה 3 מתוך 5" }).click();
    await expect(current(page)).toHaveAttribute("aria-label", "תמונה 3 מתוך 5");
    await page.getByRole("button", { name: "התמונה הבאה" }).focus();
    await page.keyboard.press("Enter");
    await expect(current(page)).toHaveAttribute("aria-label", "תמונה 4 מתוך 5");
    await expect.poll(() => img(page).evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0)).toBe(true);
    expect((await img(page).getAttribute("alt"))?.length ?? 0).toBeGreaterThan(5);
  });

  test("autoplay advances; pause stops it (aria-pressed); reduced motion never autoplays", async ({ page, browser }) => {
    await page.clock.install();
    await page.goto(URL);
    await page.mouse.move(5, 5);
    const start = await img(page).getAttribute("src");
    await page.clock.runFor(20_000);
    await expect(img(page)).not.toHaveAttribute("src", start!);
    const toggle = page.locator(".slide-toggle");
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-pressed", "true");
    await page.mouse.move(5, 5);
    await page.locator("h1").focus(); // move focus out of the carousel so only the manual pause applies
    const paused = await img(page).getAttribute("src");
    await page.clock.runFor(30_000);
    await expect(img(page)).toHaveAttribute("src", paused!);

    const ctx = await browser.newContext({ reducedMotion: "reduce" });
    const p2 = await ctx.newPage();
    await p2.clock.install();
    await p2.goto("http://localhost:3100" + URL);
    const s2 = await img(p2).getAttribute("src");
    await p2.clock.runFor(30_000);
    await expect(img(p2)).toHaveAttribute("src", s2!);
    await ctx.close();
  });
});

test.describe("website hero carousel — touch", () => {
  test.use({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
  test("finger swipe changes the slide", async ({ page }) => {
    await page.goto(URL);
    const b = (await page.locator("#hero-slide-image").boundingBox())!;
    const cdp = await page.context().newCDPSession(page);
    const y = b.y + b.height / 3;
    const swipe = async (x0: number, x1: number) => {
      await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: x0, y }] });
      for (let i = 1; i <= 8; i++) await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: x0 + ((x1 - x0) * i) / 8, y }] });
      await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    };
    await swipe(b.x + b.width - 30, b.x + 30);
    await expect(page.locator('.slide-dot[aria-current="true"]')).not.toHaveAttribute("aria-label", "תמונה 1 מתוך 5");
  });
});

// A11Y-OPTIONS-01: design-options.html (WEBSITE-DESIGN-03). Colour contrast of the orange CTAs is a design decision
// pending Daniel (see CLAUDE.md), so it is excluded here; everything else must be clean.
const OPTIONS = "/company-preview/design-options.html";
for (const w of [320, 390, 1440]) {
  test(`design options @${w}: each variant has no overflow and no axe violations other than pending design contrast`, async ({ page }) => {
    const external: string[] = [];
    page.on("request", (r) => { if (!r.url().startsWith("http://localhost:3100")) external.push(r.url()); });
    await page.setViewportSize({ width: w, height: 900 });
    await page.goto(OPTIONS);
    const tabs = page.getByRole("tab");
    await expect(tabs).toHaveCount(3);
    for (let i = 0; i < 3; i++) {
      await tabs.nth(i).click();
      await expect(tabs.nth(i)).toHaveAttribute("aria-selected", "true");
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
      const ax = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).disableRules(["color-contrast"]).analyze();
      expect(ax.violations.map((v) => `variant ${i}: ${v.id} x${v.nodes.length}`)).toEqual([]);
      const defaultBlue = await page.evaluate(() => [...document.querySelectorAll("a")].filter((a) => (a as HTMLElement).offsetParent && getComputedStyle(a).color === "rgb(0, 0, 238)").length);
      expect(defaultBlue, "links rendered in the browser default blue").toBe(0);
    }
    expect(external).toEqual([]);
  });
}

test("design options: tabs follow the WAI-ARIA tabs pattern (tablist, arrows, one visible panel)", async ({ page }) => {
  await page.goto(OPTIONS);
  await expect(page.getByRole("tablist")).toHaveCount(1);
  await page.getByRole("tab").first().focus();
  await page.keyboard.press("ArrowLeft");
  const selected = page.locator('[role="tab"][aria-selected="true"]');
  await expect(selected).toHaveCount(1);
  await expect(selected).toBeFocused();
  await expect(page.locator('[role="tabpanel"]:not([hidden])')).toHaveCount(1);
});
