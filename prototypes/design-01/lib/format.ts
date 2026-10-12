import { NOW } from "./fixtures";
import type { LeadStatus, Source, Urgency } from "./types";

export const STATUS_LABEL: Record<LeadStatus, string> = {
  NEW: "חדש", TRIAGE: "במיון", ASSIGNED: "שובץ", CONTACTED: "נוצר קשר", QUALIFIED: "מוסמך", DISQUALIFIED: "נפסל",
};
export const SOURCE_LABEL: Record<Source, string> = { website: "אתר", email: "מייל", whatsapp: "WhatsApp", phone: "טלפון" };
export const URGENCY_LABEL: Record<Urgency, string> = { urgent: "דחוף", normal: "רגיל", low: "נמוך" };
export const URGENCY_RANK: Record<Urgency, number> = { urgent: 0, normal: 1, low: 2 };

const TZ = "Asia/Jerusalem";
export const fmtTime = (iso: string) => new Intl.DateTimeFormat("he-IL", { timeZone: TZ, hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
export const fmtDateTime = (iso: string) =>
  new Intl.DateTimeFormat("he-IL", { timeZone: TZ, day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
export const fmtILS = (n: number, decimals = 0) =>
  new Intl.NumberFormat("he-IL", { style: "currency", currency: "ILS", minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(n);

/** "לפני 42 דק׳" relative to the fixed demo clock. */
export function ago(iso: string): string {
  const m = Math.round((NOW.getTime() - new Date(iso).getTime()) / 60_000);
  if (m < 1) return "עכשיו";
  if (m < 60) return `לפני ${m} דק׳`;
  const h = Math.round(m / 60);
  if (m < 60 * 24) return h === 1 ? "לפני שעה" : h === 2 ? "לפני שעתיים" : `לפני ${h} שעות`;
  const d = Math.round(m / 1440);
  return d === 1 ? "לפני יום" : d === 2 ? "לפני יומיים" : `לפני ${d} ימים`;
}
export const isOverdue = (iso: string) => new Date(iso).getTime() < NOW.getTime();

/** +97235550101 → 03-555-0101 */
export function fmtPhone(e164: string): string {
  const local = "0" + e164.replace(/^\+972/, "");
  return local.length === 9 ? `${local.slice(0, 2)}-${local.slice(2, 5)}-${local.slice(5)}` : `${local.slice(0, 3)}-${local.slice(3, 6)}-${local.slice(6)}`;
}

/** Normalisation + Israeli business-ID check digit, as specified in A-01. */
export function normalizeBusinessId(raw: string): { value: string | null; valid: boolean } {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return { value: null, valid: true };
  if (digits.length > 9) return { value: null, valid: false };
  const v = digits.padStart(9, "0");
  const sum = [...v].reduce((a, d, i) => { const x = +d * ((i % 2) + 1); return a + (x > 9 ? x - 9 : x); }, 0);
  return sum % 10 === 0 ? { value: v, valid: true } : { value: null, valid: false };
}
export function normalizePhone(raw: string): string | null {
  const d = raw.replace(/\D/g, "");
  if (/^972\d{8,9}$/.test(d)) return "+" + d;
  if (/^0\d{8,9}$/.test(d)) return "+972" + d.slice(1);
  return null;
}
export const normalizeEmail = (raw: string) => {
  const e = raw.trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) ? e : null;
};
