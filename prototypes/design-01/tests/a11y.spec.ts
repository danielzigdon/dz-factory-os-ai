import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { asRole, open, SCREENS } from "./helpers";

const VARIANTS = [
  { name: "desktop", w: 1440 }, { name: "mobile", w: 390 },
] as const;

for (const v of VARIANTS) for (const s of SCREENS) for (const role of ["manager", "sales"] as const) {
  test(`axe ${s.code} ${v.name} ${role}: no WCAG 2.1 AA violations (incl. color contrast)`, async ({ page }) => {
    await asRole(page, role);
    await page.setViewportSize({ width: v.w, height: 900 });
    await open(page, s.path);
    const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
    const summary = r.violations.map((x) => `${x.id} (${x.impact}): ${x.nodes.length} — ${x.nodes[0]?.target.join(" ")}`);
    expect(summary).toEqual([]);
  });
}

for (const state of ["empty", "error", "loading"]) {
  test(`axe S02 state=${state}`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await open(page, `/s02?state=${state}`);
    const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
    expect(r.violations.map((x) => x.id)).toEqual([]);
  });
}

test("keyboard: skip link first, visible focus ring, RTL tab order in S02 header", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await open(page, "/s02");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "דילוג לתוכן" })).toBeFocused();
  await page.keyboard.press("Tab");
  // Next focus lands in the sidebar (rightmost region in RTL), on the first nav link.
  await expect(page.getByRole("link", { name: "לוח מנהל" }).first()).toBeFocused();
  const ring = await page.evaluate(() => { const s = getComputedStyle(document.activeElement!); return `${s.outlineStyle} ${s.outlineWidth} ${s.outlineColor}`; });
  expect(ring).toBe("solid 2px rgb(133, 201, 255)"); // focus token #85C9FF
  // Every focusable control reachable by keyboard has an accessible name.
  const unnamed = await page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>("a[href], button, input, select, textarea")]
      .filter((e) => e.offsetParent && !(e.getAttribute("aria-label") || e.textContent?.trim() || (e as HTMLInputElement).labels?.length || e.getAttribute("title")))
      .map((e) => e.outerHTML.slice(0, 80)));
  expect(unnamed).toEqual([]);
});

test("reduced motion disables animation", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await open(page, "/s02?state=loading");
  const anim = await page.locator(".skeleton").first().evaluate((e) => getComputedStyle(e).animationName);
  expect(anim).toBe("none");
});
