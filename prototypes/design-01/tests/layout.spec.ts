import { expect, test } from "@playwright/test";
import { open, SCREENS, WIDTHS } from "./helpers";

for (const w of WIDTHS) {
  for (const s of SCREENS) {
    test(`${s.code} @${w}px: RTL, no overflow, no clipped text, correct navigation`, async ({ page }) => {
      await page.setViewportSize({ width: w, height: 900 });
      await open(page, s.path);

      await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
      await expect(page.locator("html")).toHaveAttribute("lang", "he");
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(s.heading);

      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow, "page-level horizontal scroll").toBeLessThanOrEqual(0);

      // Clipped text: any visible leaf text element wider than its box, outside intentional scroll containers.
      const clipped = await page.evaluate(() => {
        const out: string[] = [];
        for (const el of document.querySelectorAll<HTMLElement>("main *, header *, nav *")) {
          if (!el.childElementCount && el.textContent?.trim() && el.offsetParent && el.scrollWidth > el.clientWidth + 1 &&
              getComputedStyle(el).overflowX !== "visible" && !el.closest(".overflow-x-auto") && !el.closest(".sr-only")) out.push(el.textContent.trim().slice(0, 40));
        }
        return out;
      });
      expect(clipped, "clipped text").toEqual([]);

      // Overlapping interactive controls (sampled by bounding boxes).
      const overlaps = await page.evaluate(() => {
        const els = [...document.querySelectorAll<HTMLElement>("main a, main button, main input, main select, header a, header button, header select")]
          .filter((e) => e.offsetParent && !e.closest("dialog") && !e.closest(".overflow-x-auto"));
        const r = els.map((e) => e.getBoundingClientRect());
        const hits: string[] = [];
        for (let i = 0; i < r.length; i++) for (let j = i + 1; j < r.length; j++) {
          if (els[i].contains(els[j]) || els[j].contains(els[i])) continue;
          const ix = Math.min(r[i].right, r[j].right) - Math.max(r[i].left, r[j].left);
          const iy = Math.min(r[i].bottom, r[j].bottom) - Math.max(r[i].top, r[j].top);
          if (ix > 2 && iy > 2) hits.push(`${els[i].textContent?.trim().slice(0, 20)} × ${els[j].textContent?.trim().slice(0, 20)}`);
        }
        return hits;
      });
      expect(overlaps, "overlapping controls").toEqual([]);

      // Navigation variant per contract §3 and active marker on the current screen.
      const side = page.locator("nav.fixed.inset-y-0");
      const bottom = page.locator("nav.fixed.bottom-0");
      const drawerBtn = page.getByRole("button", { name: "פתיחת תפריט ניווט" });
      if (w >= 1200) { await expect(side).toBeVisible(); await expect(bottom).toBeHidden(); await expect(drawerBtn).toBeHidden(); }
      else if (w >= 768) { await expect(side).toBeHidden(); await expect(bottom).toBeHidden(); await expect(drawerBtn).toBeVisible(); }
      else { await expect(side).toBeHidden(); await expect(bottom).toBeVisible(); await expect(drawerBtn).toBeHidden(); }

      const visibleNav = w >= 1200 ? side : w < 768 ? bottom : null;
      if (visibleNav) {
        const current = visibleNav.locator('[aria-current="page"]');
        await expect(current).toHaveCount(1);
        await expect(current).toContainText({ S01: "לוח מנהל", S02: "מרכז פניות", S03: "כרטיס לקוח" }[s.code]);
      }

      // Required honesty markers (contract §3).
      await expect(page.getByText("נתוני הדגמה").first()).toBeVisible();
      await expect(page.getByText("טרם חובר").first()).toBeVisible();
    });
  }
}

test("tablet drawer opens, shows active item and navigates", async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1000 });
  await open(page, "/s01");
  await page.getByRole("button", { name: "פתיחת תפריט ניווט" }).click();
  const dlg = page.getByRole("dialog", { name: "תפריט ניווט" });
  await expect(dlg).toBeVisible();
  await expect(dlg.locator('[aria-current="page"]')).toContainText("לוח מנהל");
  const box = (await dlg.boundingBox())!;
  expect(box.x + box.width, "RTL drawer is anchored to the right edge").toBeGreaterThanOrEqual(767);
  await dlg.getByRole("link", { name: "מרכז פניות" }).click();
  await expect(page).toHaveURL(/\/s02$/);
  await expect(dlg).toBeHidden();
});
