import { expect, type Page } from "@playwright/test";

export const SCREENS = [
  { code: "S01", path: "/s01", heading: "לוח מנהל" },
  { code: "S02", path: "/s02", heading: "מרכז פניות" },
  { code: "S03", path: "/s03/C-101", heading: "מסגריית הדרום (דמו)" },
] as const;
export const WIDTHS = [360, 390, 768, 1280, 1440] as const;

export async function asRole(page: Page, role: "manager" | "deputy" | "sales") {
  await page.context().addCookies([{ name: "yc_role", value: role, url: "http://localhost:3100" }]);
}

export async function open(page: Page, path: string) {
  await page.goto(path);
  await page.waitForLoadState("networkidle");
  await expect(page.locator("h1").first()).toBeVisible();
}
