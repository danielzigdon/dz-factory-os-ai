import { expect, test } from "@playwright/test";
import { asRole, open } from "./helpers";

test.describe("S02 inquiries", () => {
  test.beforeEach(async ({ page }) => { await page.setViewportSize({ width: 1440, height: 1000 }); });

  test("quick filters, search, status filter, sort and reset", async ({ page }) => {
    await open(page, "/s02");
    const rows = page.locator("tbody tr");
    await expect(rows).toHaveCount(8);
    await page.getByRole("button", { name: "ללא אחראי" }).click();
    await expect(page.getByRole("button", { name: "ללא אחראי" })).toHaveAttribute("aria-pressed", "true");
    await expect(rows).toHaveCount(3);
    await page.getByRole("button", { name: "דחוף" }).click();
    await expect(rows).toHaveCount(2);
    await page.getByRole("button", { name: "ניקוי סינון" }).first().click();
    await expect(rows).toHaveCount(8);
    await page.getByRole("searchbox", { name: "חיפוש פניות" }).fill("03-555-0104");
    await expect(rows).toHaveCount(1);
    await expect(rows.first()).toContainText("שערי הכרמל");
    await page.getByRole("searchbox", { name: "חיפוש פניות" }).fill("zzz");
    await expect(page.getByText("אין פניות שתואמות לסינון")).toBeVisible();
    await page.getByRole("button", { name: "ניקוי סינון" }).last().click();
    await page.getByLabel("סטטוס").filter({ visible: true }).selectOption("QUALIFIED");
    await expect(rows).toHaveCount(1);
    await page.getByLabel("סטטוס").filter({ visible: true }).selectOption("");
    const th = page.locator('th:has(button:has-text("דחיפות"))');
    await th.getByRole("button").click();
    await expect(th).toHaveAttribute("aria-sort", "descending");
    await th.getByRole("button").click();
    await expect(th).toHaveAttribute("aria-sort", "ascending");
    await expect(rows.first()).toContainText("דחוף");
  });

  test("dashboard KPI deep-links into a filtered inbox", async ({ page }) => {
    await open(page, "/s01");
    await page.getByRole("link", { name: /ללא אחראי/ }).click();
    await expect(page).toHaveURL(/filter=unassigned/);
    await expect(page.locator("tbody tr")).toHaveCount(3);
  });

  test("global search routes to S02 with query", async ({ page }) => {
    await open(page, "/s01");
    await page.getByRole("searchbox", { name: "חיפוש כללי בפניות" }).fill("גליל");
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/s02\?q=/);
    await expect(page.locator("tbody tr")).toHaveCount(2);
  });

  test("manager single + bulk assign with confirmation dialog", async ({ page }) => {
    await open(page, "/s02");
    const row = page.locator("tbody tr", { hasText: "ריהוט גן נוף" });
    await row.getByRole("button", { name: /שיוך/ }).click();
    const dlg = page.getByRole("dialog");
    await expect(dlg).toHaveAccessibleName("שיוך פנייה");
    const headingIds = await page.locator("dialog h2[id]").evaluateAll((headings) => headings.map((heading) => heading.id));
    expect(new Set(headingIds).size).toBe(headingIds.length);
    await expect(dlg.getByRole("button", { name: "אישור שיוך" })).toBeDisabled();
    await dlg.getByLabel("אחראי").selectOption("u3");
    await dlg.getByRole("button", { name: "אישור שיוך" }).click();
    await expect(row).toContainText("נועה פרץ");
    await expect(row).toContainText("שובץ");
    await expect(page.getByText(/שויכו לנועה פרץ/)).toBeVisible();

    await page.getByRole("checkbox", { name: "בחירת מעקות השרון (דמו)" }).check();
    await page.getByRole("checkbox", { name: "בחירת מסגריית הדרום (דמו)" }).check();
    await page.getByRole("button", { name: "שיוך מרוכז" }).click();
    await expect(page.getByRole("dialog")).toContainText("פעולה מרוכזת");
    await page.getByRole("dialog").getByLabel("אחראי").selectOption("u2");
    await page.getByRole("dialog").getByRole("button", { name: "אישור שיוך" }).click();
    await expect(page.locator("tbody tr", { hasText: "מעקות השרון" })).toContainText("יואב כהן");
    await expect(page.locator("tbody tr", { hasText: "מסגריית הדרום" })).toContainText("יואב כהן");
  });

  test("sales role: assignment refused, no bulk selection", async ({ page }) => {
    await asRole(page, "sales");
    await open(page, "/s02");
    await expect(page.locator("tbody input[type=checkbox]")).toHaveCount(0);
    await expect(page.getByText("שיוך פניות זמין למנהל/ת ולממלא/ת מקום בלבד")).toBeVisible();
    await page.locator("tbody tr").first().getByRole("button", { name: /שיוך/ }).click();
    await expect(page.getByText("אין לך הרשאה לשייך פניות")).toBeVisible();
    await expect(page.getByRole("dialog")).toBeHidden();
  });

  test("new lead: malformed input is rejected with field errors", async ({ page }) => {
    await open(page, "/s02");
    await page.getByRole("button", { name: "פנייה חדשה" }).click();
    const dlg = page.getByRole("dialog");
    await dlg.getByLabel("טלפון", { exact: true }).fill("12");
    await dlg.getByLabel("אימייל").fill("not-an-email");
    await dlg.getByLabel("ח״פ / ע״מ (אם ידוע)").fill("516123453");
    await dlg.getByRole("button", { name: "קליטת פנייה" }).click();
    await expect(dlg.getByText("יש להזין שם חברה או שם פונה.")).toBeVisible();
    await expect(dlg.getByText(/מספר טלפון לא תקין/)).toBeVisible();
    await expect(dlg.getByText("כתובת אימייל לא תקינה.")).toBeVisible();
    await expect(dlg.getByText(/ספרת ביקורת שגויה/)).toBeVisible();
    await expect(dlg.getByLabel("טלפון", { exact: true })).toHaveAttribute("aria-invalid", "true");
    await expect(page.locator("tbody tr")).toHaveCount(8);
  });

  test("new lead: valid business ID → linking required, no new customer; phone match → suspicion only", async ({ page }) => {
    await open(page, "/s02");
    await page.getByRole("button", { name: "פנייה חדשה" }).click();
    let dlg = page.getByRole("dialog");
    await dlg.getByLabel("חברה / שם פונה *").fill("פנייה בדיקה א (דמו)");
    await dlg.getByLabel("טלפון", { exact: true }).fill("03-555-0199");
    await dlg.getByLabel("ח״פ / ע״מ (אם ידוע)").fill("51-612345-2");
    await dlg.getByRole("button", { name: "קליטת פנייה" }).click();
    await expect(page.getByText(/ח״פ תואם ל־מסגריית הדרום \(דמו\): לא נוצר לקוח חדש, נדרש קישור ידני/)).toBeVisible();
    await expect(page.locator("tbody tr", { hasText: "פנייה בדיקה א" })).toContainText("נדרש קישור");

    await page.getByRole("button", { name: "פנייה חדשה" }).click();
    dlg = page.getByRole("dialog");
    await dlg.getByLabel("חברה / שם פונה *").fill("פנייה בדיקה ב (דמו)");
    await dlg.getByLabel("טלפון", { exact: true }).fill("035550103");
    await dlg.getByRole("button", { name: "קליטת פנייה" }).click();
    await expect(page.getByText(/סומנה כחשד לכפילות \(טלפון זהה ל־פרופילי גליל \(דמו\)\). לא בוצע מיזוג/)).toBeVisible();
    await expect(page.locator("tbody tr")).toHaveCount(10); // both kept as separate records — nothing merged
  });

  test("error state retry returns to normal view", async ({ page }) => {
    await open(page, "/s02?state=error");
    await expect(page.getByRole("alert").filter({ hasText: "שירות הפניות אינו זמין" })).toBeVisible();
    await page.getByRole("link", { name: "נסה שוב" }).click();
    await expect(page.locator("tbody tr")).toHaveCount(8);
  });

  test("scenario selector switches state", async ({ page }) => {
    await open(page, "/s02");
    await page.getByRole("button", { name: /נתוני הדגמה/ }).click();
    await page.getByRole("dialog", { name: "אזור הדגמה" }).getByLabel("תרחיש תצוגה").selectOption("empty");
    await expect(page.getByText("אין פניות בתיבה")).toBeVisible();
  });
});

test.describe("S01 dashboard", () => {
  test("assign from urgent queue, complete task, absence toggle", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await open(page, "/s01");
    await expect(page.getByText("4 בתור")).toBeVisible();
    await page.getByRole("button", { name: "שיוך ריהוט גן נוף (דמו)" }).click();
    await page.getByRole("dialog").getByLabel("אחראי").selectOption("u3");
    await page.getByRole("dialog").getByRole("button", { name: "אישור שיוך" }).click();
    await expect(page.getByText("3 בתור")).toBeVisible();
    const task = page.getByRole("checkbox").first();
    await task.check();
    await expect(page.getByText("המשימה סומנה כבוצעה")).toBeVisible();
    await page.getByRole("button", { name: "הפעלת מצב היעדרות" }).click();
    await expect(page.getByText(/מנותבות זמנית ליואב כהן\. ההעברה אינה מעניקה הרשאות מנהל/)).toBeVisible();
    await page.getByRole("button", { name: "סיום מצב היעדרות" }).click();
  });

  test("empty (all-clear) and limited role hide financial KPI", async ({ page }) => {
    await asRole(page, "deputy");
    await open(page, "/s01?state=empty");
    await expect(page.getByText("הכול מטופל")).toBeVisible();
    await expect(page.getByText("נתון כספי — זמין למנהל/ת בלבד")).toBeVisible();
    expect(await page.content()).not.toContain("126,500");
    await expect(page.getByRole("button", { name: "הפעלת מצב היעדרות" })).toHaveCount(0);
  });
});

test.describe("S03 card", () => {
  test("RTL keyboard tabs, add note, schedule follow-up, demo-only contact", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await open(page, "/s03/C-101");
    const tab = (n: string) => page.getByRole("tab", { name: n });
    await tab("סקירה").focus();
    await page.keyboard.press("ArrowLeft");
    await expect(tab("אנשי קשר")).toBeFocused();
    await expect(tab("אנשי קשר")).toHaveAttribute("aria-selected", "true");
    await expect(page.getByRole("tabpanel")).toContainText("03-555-0101");
    await page.keyboard.press("End");
    await expect(tab("קבצים")).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("ArrowLeft");
    await expect(tab("סקירה")).toHaveAttribute("aria-selected", "true");

    await tab("פעילות").click();
    await page.getByRole("button", { name: "הוספת הערה" }).click();
    await expect(page.getByText("יש להזין טקסט להערה.")).toBeVisible();
    await page.getByLabel("הוספת הערה").fill("הלקוח ביקש דוגמת גוון (בדיקה)");
    await page.getByRole("button", { name: "הוספת הערה" }).click();
    await expect(page.getByRole("tabpanel")).toContainText("הלקוח ביקש דוגמת גוון (בדיקה)");

    await tab("משימות").click();
    await page.getByLabel("תיאור").fill("שיחת מעקב (בדיקה)");
    await page.getByRole("button", { name: "קביעה" }).click();
    await expect(page.getByRole("tabpanel")).toContainText("שיחת מעקב (בדיקה)");

    await page.getByRole("button", { name: /התקשרות אל/ }).click();
    await expect(page.getByText("בגרסת ההדגמה לא מתבצעת שיחה.")).toBeVisible();
  });

  for (const role of ["deputy", "sales"] as const) {
    test(`${role}: confidential fields are absent from server response and DOM, not CSS-hidden`, async ({ page, request }) => {
      await asRole(page, role);
      await open(page, "/s03/C-101");
      await expect(page.getByTestId("confidential")).toHaveCount(0);
      await expect(page.getByText("זמין למנהל/ת בלבד. הנתונים לא נשלחו לדפדפן.")).toBeVisible();
      const raw = await (await request.get("/s03/C-101", { headers: { cookie: `yc_role=${role}` } })).text();
      for (const secret of ["11240", "11,240", "31.4", "38.5", "estimatedCost", "marginPct", "supplierPowderPricePerKg"]) expect(raw).not.toContain(secret);
    });
  }

  test("manager receives confidential fields", async ({ page, request }) => {
    await open(page, "/s03/C-101");
    await expect(page.getByTestId("confidential")).toContainText("31.4%");
    expect(await (await request.get("/s03/C-101")).text()).toContain("marginPct");
  });

  test("client bundle does not contain confidential fixtures", async ({ page }) => {
    const bodies: string[] = [];
    page.on("response", async (r) => { if (r.url().endsWith(".js")) bodies.push(await r.text()); });
    await asRole(page, "sales");
    await open(page, "/s03/C-101");
    expect(bodies.length).toBeGreaterThan(0);
    for (const b of bodies) { expect(b).not.toContain("supplierPowderPricePerKg\":38.5"); expect(b).not.toContain("126500"); }
  });

  test("unknown id → not-found page with way back", async ({ page }) => {
    await page.goto("/s03/X-999");
    await expect(page.getByText("הרשומה לא נמצאה")).toBeVisible();
    await page.getByRole("link", { name: "חזרה למרכז הפניות" }).click();
    await expect(page).toHaveURL(/\/s02$/);
  });

  test("lead card (L-2039) shows duplicate provenance and lead/customer distinction", async ({ page }) => {
    await open(page, "/s03/L-2039");
    await expect(page.getByText("ליד", { exact: true })).toBeVisible();
    await expect(page.getByText("טלפון זהה ל־אלומיניום גליל (דמו) — חשד בלבד, לא ימוזג אוטומטית")).toBeAttached();
  });
});

test("no request leaves localhost (no Priority, no external services)", async ({ page }) => {
  const external: string[] = [];
  page.on("request", (r) => { if (!r.url().startsWith("http://localhost:3100")) external.push(r.url()); });
  for (const p of ["/s01", "/s02", "/s03/C-101"]) await open(page, p);
  expect(external).toEqual([]);
});
