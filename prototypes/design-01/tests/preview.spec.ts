import { expect, test } from "@playwright/test";
import { open } from "./helpers";

// DESIGN-01-PREVIEW: one end-to-end walkthrough of every action the factory owner is asked to try,
// run on the production build (`next start`) at phone and desktop width. Demo data only.
test.use({ actionTimeout: 10_000 });

for (const vp of [{ name: "mobile-390", width: 390, height: 844 }, { name: "desktop-1440", width: 1440, height: 900 }]) {
  test(`owner walkthrough @${vp.name}`, async ({ page }) => {
    test.setTimeout(90_000);
    const external: string[] = [];
    page.on("request", (r) => { if (!r.url().startsWith("http://localhost:3100")) external.push(r.url()); });
    await page.setViewportSize({ width: vp.width, height: vp.height });
    const desktop = vp.width >= 1200;
    const nav = desktop ? page.locator("nav.fixed.inset-y-0") : page.locator("nav.fixed.bottom-0");

    // 1. Navigate between the three screens.
    await open(page, "/s01");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("לוח מנהל");
    await nav.getByRole("link", { name: "מרכז פניות" }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("מרכז פניות");
    await nav.getByRole("link", { name: "כרטיס לקוח" }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("מסגריית הדרום (דמו)");
    await nav.getByRole("link", { name: "לוח מנהל" }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("לוח מנהל");

    // 2. Search and filter inquiries.
    await nav.getByRole("link", { name: "מרכז פניות" }).click();
    const items = desktop ? page.locator("tbody tr") : page.locator('ul[aria-label="רשימת פניות"] > li');
    await expect(items).toHaveCount(8);
    await page.getByRole("searchbox", { name: "חיפוש פניות" }).fill("גליל");
    await expect(items).toHaveCount(2);
    await page.getByRole("searchbox", { name: "חיפוש פניות" }).fill("");
    await page.getByRole("button", { name: "ללא אחראי" }).click();
    await expect(items).toHaveCount(3);
    await page.getByRole("button", { name: "ניקוי סינון" }).first().click();
    await expect(items).toHaveCount(8);

    // 3. Create a new demo inquiry.
    await page.getByRole("button", { name: "פנייה חדשה" }).click();
    const dlg = page.getByRole("dialog");
    await dlg.getByLabel("חברה / שם פונה *").fill("פנייה לבדיקת בעל המפעל (דמו)");
    await dlg.getByLabel("טלפון", { exact: true }).fill("03-555-0177");
    await dlg.getByRole("button", { name: "קליטת פנייה" }).click();
    await expect(page.getByText("הפנייה נקלטה (הדגמה בלבד).")).toBeVisible();
    await expect(items).toHaveCount(9);
    const created = items.filter({ hasText: "פנייה לבדיקת בעל המפעל" });
    await expect(created).toContainText("חדש");

    // 4. Assign it (status changes NEW → ASSIGNED).
    await created.getByRole("button", { name: /^שיוך / }).click();
    await page.getByRole("dialog").getByLabel("אחראי").selectOption("u3");
    await page.getByRole("dialog").getByRole("button", { name: "אישור שיוך" }).click();
    await expect(created).toContainText("נועה פרץ");
    await expect(created).toContainText("שובץ");

    // 5. Open a customer card from the inbox.
    await items.filter({ hasText: "מסגריית הדרום" }).getByRole("link").first().click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("מסגריית הדרום (דמו)");

    await expect(page.getByText("ליד", { exact: true })).toBeVisible(); // opened from the inbox: the lead's card
    // Customer card (C-101) via navigation.
    await nav.getByRole("link", { name: "כרטיס לקוח" }).click();
    await expect(page).toHaveURL(/\/s03\/C-101$/);

    // 6. Add a note and a follow-up task; complete a task.
    await page.getByRole("tab", { name: "פעילות" }).click();
    await page.getByLabel("הוספת הערה").fill("הערת הדגמה מבעל המפעל");
    await page.getByRole("button", { name: "הוספת הערה" }).click();
    await expect(page.getByRole("tabpanel")).toContainText("הערת הדגמה מבעל המפעל");
    await page.getByRole("tab", { name: "משימות" }).click();
    await page.getByLabel("תיאור").fill("משימת המשך (הדגמה)");
    await page.getByRole("button", { name: "קביעה" }).click();
    await expect(page.getByRole("tabpanel")).toContainText("משימת המשך (הדגמה)");
    const box = page.getByRole("checkbox", { name: "סימון משימת המשך (הדגמה) כבוצעה" });
    await box.check();
    await expect(box).toBeChecked();

    // 7. Open and close notifications (Esc and outside click).
    const bell = page.getByRole("button", { name: /^התראות:/ });
    await bell.click();
    await expect(page.getByRole("region", { name: "התראות" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("region", { name: "התראות" })).toBeHidden();
    await bell.click();
    await page.mouse.click(6, Math.round(vp.height * 0.6)); // empty side gutter = outside the panel
    await expect(page.getByRole("region", { name: "התראות" })).toBeHidden();

    // 8. Switch demo role and see the permission limits on the same card.
    await expect(page.getByTestId("confidential")).toHaveCount(1); // manager sees confidential financials
    for (const [role, label] of [["deputy", "ממלא/ת מקום"], ["sales", "מכירות"]] as const) {
      await page.getByRole("button", { name: /נתוני הדגמה/ }).click();
      await page.getByRole("dialog", { name: "אזור הדגמה" }).getByLabel("תפקיד מדומה").selectOption(role);
      await expect(page.getByText(`התצוגה עודכנה להרשאות: ${label}`)).toBeVisible();
      await expect(page.getByTestId("confidential")).toHaveCount(0);
      await expect(page.getByText("זמין למנהל/ת בלבד. הנתונים לא נשלחו לדפדפן.")).toBeVisible();
    }
    // Sales: assignment refused in the inbox.
    await nav.getByRole("link", { name: "מרכז פניות" }).click();
    await page.getByRole("button", { name: /^שיוך / }).filter({ visible: true }).first().click();
    await expect(page.getByText("אין לך הרשאה לשייך פניות")).toBeVisible();
    // Deputy: may assign, but no absence control and no financial KPI on the dashboard.
    await page.getByRole("button", { name: /נתוני הדגמה/ }).click();
    await page.getByRole("dialog", { name: "אזור הדגמה" }).getByLabel("תפקיד מדומה").selectOption("deputy");
    await nav.getByRole("link", { name: "לוח מנהל" }).click();
    await expect(page.getByText("נתון כספי — זמין למנהל/ת בלבד")).toBeVisible();
    await expect(page.getByText("הפעלת היעדרות זמינה למנהל/ת בלבד")).toBeVisible();
    // Back to manager.
    await page.getByRole("button", { name: /נתוני הדגמה/ }).click();
    await page.getByRole("dialog", { name: "אזור הדגמה" }).getByLabel("תפקיד מדומה").selectOption("manager");
    await expect(page.getByText("שווי פניות פתוחות")).toBeVisible();

    // Demo data only; nothing leaves localhost (no Priority, no third parties).
    expect(external).toEqual([]);
  });
}

test("online-preview hardening headers on every screen", async ({ request }) => {
  for (const p of ["/s01", "/s02", "/s03/C-101"]) {
    const h = (await request.get(p)).headers();
    expect(h["x-robots-tag"]).toBe("noindex, nofollow, noarchive");
    expect(h["x-frame-options"]).toBe("DENY");
    expect(h["referrer-policy"]).toBe("no-referrer");
    expect(h["x-powered-by"]).toBeUndefined();
  }
});
