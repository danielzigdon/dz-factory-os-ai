import { expect, test, type Page } from "@playwright/test";
import { asRole, open } from "./helpers";

// Real screenshots of the running prototype → docs/design-01/screenshots/
const DIR = "../../docs/design-01/screenshots";
const shot = (page: Page, name: string, fullPage = false) => page.screenshot({ path: `${DIR}/${name}.png`, fullPage, animations: "disabled" });

const SCREENS = [["s01", "/s01"], ["s02", "/s02"], ["s03", "/s03/C-101"]] as const;

for (const [id, path] of SCREENS) {
  test(`${id} desktop 1440`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await open(page, path);
    await shot(page, `${id}-desktop-1440`, true);
  });
  test(`${id} mobile 390`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await open(page, path);
    await shot(page, `${id}-mobile-390`);            // what the phone shows (fixed bottom nav in place)
    await shot(page, `${id}-mobile-390-full`, true); // full scroll height; the fixed nav appears where the viewport ended
  });
}

test("state: S01 all-clear empty (deputy, financial KPI withheld)", async ({ page }) => {
  await asRole(page, "deputy");
  await page.setViewportSize({ width: 1440, height: 1000 });
  await open(page, "/s01?state=empty");
  await shot(page, "state-s01-empty-deputy");
});
test("state: S01 loading", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await open(page, "/s01?state=loading");
  await shot(page, "state-s01-loading");
});
test("state: S02 error", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await open(page, "/s02?state=error");
  await shot(page, "state-s02-error");
});
test("state: S02 filters with no results (mobile)", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await open(page, "/s02");
  await page.getByRole("searchbox", { name: "חיפוש פניות" }).fill("zzz");
  await shot(page, "state-s02-no-results-mobile");
});
test("state: S02 duplicate detection after intake", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await open(page, "/s02");
  await page.getByRole("button", { name: "פנייה חדשה" }).click();
  const dlg = page.getByRole("dialog");
  await dlg.getByLabel("חברה / שם פונה *").fill("פנייה בדיקה (דמו)");
  await dlg.getByLabel("טלפון", { exact: true }).fill("03-555-0199");
  await dlg.getByLabel("ח״פ / ע״מ (אם ידוע)").fill("516123452");
  await dlg.getByRole("button", { name: "קליטת פנייה" }).click();
  await page.getByText(/נדרש קישור ידני/).first().waitFor();
  await shot(page, "state-s02-duplicate");
});
test("state: S02 malformed input", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await open(page, "/s02");
  await page.getByRole("button", { name: "פנייה חדשה" }).click();
  const dlg = page.getByRole("dialog");
  await dlg.getByLabel("טלפון", { exact: true }).fill("12");
  await dlg.getByLabel("אימייל").fill("not-an-email");
  await dlg.getByLabel("ח״פ / ע״מ (אם ידוע)").fill("516123453");
  await dlg.getByRole("button", { name: "קליטת פנייה" }).click();
  await shot(page, "state-s02-malformed-mobile");
});
test("state: S02 unauthorized assignment (sales)", async ({ page }) => {
  await asRole(page, "sales");
  await page.setViewportSize({ width: 1440, height: 1000 });
  await open(page, "/s02");
  await page.locator("tbody tr").first().getByRole("button", { name: /שיוך/ }).click();
  await page.getByText("אין לך הרשאה לשייך פניות").waitFor();
  await shot(page, "state-s02-unauthorized-sales");
});
test("state: S02 bulk assign confirmation", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await open(page, "/s02");
  await page.getByRole("checkbox", { name: "בחירת מעקות השרון (דמו)" }).check();
  await page.getByRole("checkbox", { name: "בחירת ריהוט גן נוף (דמו)" }).check();
  await page.getByRole("button", { name: "שיוך מרוכז" }).click();
  await shot(page, "state-s02-bulk-confirm");
});
test("state: S03 limited view (sales) vs manager", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await asRole(page, "sales");
  await open(page, "/s03/C-101");
  await shot(page, "state-s03-limited-sales");
});
test("state: S03 lead card with duplicate suspicion (mobile)", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await open(page, "/s03/L-2039");
  await shot(page, "state-s03-lead-mobile");
});
test("tablet 768 navigation drawer", async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 });
  await open(page, "/s02");
  await page.getByRole("button", { name: "פתיחת תפריט ניווט" }).click();
  await shot(page, "tablet-768-drawer");
});

test("fix: S03 mobile tabs scroll hint", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await open(page, "/s03/C-101");
  await page.getByRole("tab", { name: "סקירה" }).scrollIntoViewIfNeeded();
  await shot(page, "fix-s03-mobile-tabs-hint");
  await page.getByRole("tab", { name: "סקירה" }).focus();
  await page.keyboard.press("End");
  await expect(page.getByTestId("tabs-more-start")).toBeEnabled();
  await shot(page, "fix-s03-mobile-tabs-end");
});
test("fix: notifications popover open (desktop + mobile)", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await open(page, "/s01");
  await page.getByRole("button", { name: /^התראות:/ }).click();
  await page.getByRole("region", { name: "התראות" }).waitFor();
  await shot(page, "fix-notifications-desktop");
  await page.setViewportSize({ width: 390, height: 844 });
  await shot(page, "fix-notifications-mobile");
});
test("fix: demo area dialog (mobile)", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await open(page, "/s01");
  await page.getByRole("button", { name: /נתוני הדגמה/ }).click();
  await page.getByRole("dialog", { name: "אזור הדגמה" }).waitFor();
  await shot(page, "fix-demo-area-mobile");
});
test("fix: control borders (S02 filters, desktop)", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await open(page, "/s02");
  await page.getByRole("button", { name: "פנייה חדשה" }).click();
  await page.getByRole("dialog").waitFor();
  await shot(page, "fix-control-borders-dialog");
});

test("polish: S03 mobile tabs — start and end states", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await open(page, "/s03/C-101");
  await shot(page, "polish-s03-tabs-start-390");
  await page.getByRole("tab", { name: "סקירה" }).focus();
  await page.keyboard.press("End");
  await expect(page.getByTestId("tabs-more-start")).toBeEnabled();
  await shot(page, "polish-s03-tabs-end-390");
});
test("polish: toast on mobile (S03 note added)", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await open(page, "/s03/C-101");
  await page.getByRole("tab", { name: "פעילות" }).click();
  await page.getByLabel("הוספת הערה").fill("בדיקת מיקום הודעה");
  await page.getByRole("button", { name: "הוספת הערה" }).click();
  await page.getByTestId("toast").waitFor();
  await shot(page, "polish-toast-mobile-390");
});
test("polish: toast on tablet and desktop (unauthorized assign)", async ({ page }) => {
  await asRole(page, "sales");
  for (const [w, h] of [[768, 1024], [1440, 900]] as const) {
    await page.setViewportSize({ width: w, height: h });
    await open(page, "/s02");
    await page.getByRole("button", { name: /^שיוך / }).filter({ visible: true }).first().click();
    await page.getByTestId("toast").first().waitFor();
    await shot(page, `polish-toast-${w < 1200 ? "tablet" : "desktop"}-${w}`);
  }
});
test("polish: placeholder token in the new-lead dialog (mobile)", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await open(page, "/s02");
  await page.getByRole("button", { name: "פנייה חדשה" }).click();
  await page.getByRole("dialog").waitFor();
  await shot(page, "polish-placeholder-dialog-390");
});
