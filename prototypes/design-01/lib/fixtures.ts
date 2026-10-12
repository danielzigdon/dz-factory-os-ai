// Deterministic, fictitious, non-sensitive demo data. No real customers, phones or business IDs.
// Phones are in the 03-555-01xx demo block; emails use example.co.il; business IDs pass the check digit but are invented.

import type { Card, Lead, User } from "./types";

/** Fixed "now" so every render and screenshot is identical: Mon 12.10.2026 10:00 Asia/Jerusalem. */
export const NOW = new Date("2026-10-12T07:00:00Z");
const minutesAgo = (m: number) => new Date(NOW.getTime() - m * 60_000).toISOString();
const minutesFromNow = (m: number) => new Date(NOW.getTime() + m * 60_000).toISOString();

export const USERS: User[] = [
  { id: "u1", name: "אורית לוי", role: "manager", available: true },
  { id: "u2", name: "יואב כהן", role: "deputy", available: true },
  { id: "u3", name: "נועה פרץ", role: "sales", available: true },
  { id: "u4", name: "עמית ברק", role: "sales", available: false },
];

export const LEADS: Lead[] = [
  {
    id: "L-2041", company: "מסגריית הדרום (דמו)", contactName: "אבי שמש", phone: "+97235550101", email: "avi@south-demo.example.co.il",
    businessId: "516123452", source: "website", receivedAt: minutesAgo(42), urgency: "urgent", status: "NEW", ownerId: null,
    nextTask: null, customerId: "C-101", duplicate: { rule: "business_id", withId: "C-101", withName: "מסגריית הדרום (דמו)" },
  },
  {
    id: "L-2040", company: "מעקות השרון (דמו)", contactName: "רותם גל", phone: "+97235550102", email: "rotem@sharon-demo.example.co.il",
    businessId: null, source: "whatsapp", receivedAt: minutesAgo(75), urgency: "urgent", status: "TRIAGE", ownerId: null,
    nextTask: null, customerId: null, duplicate: null,
  },
  {
    id: "L-2039", company: "פרופילי גליל (דמו)", contactName: "סהר נחום", phone: "+97235550103", email: "sahar@galil-demo.example.co.il",
    businessId: null, source: "email", receivedAt: minutesAgo(130), urgency: "normal", status: "ASSIGNED", ownerId: "u3",
    nextTask: { title: "שיחת בירור צרכים", dueAt: minutesAgo(20) }, customerId: null,
    duplicate: { rule: "phone", withId: "C-102", withName: "אלומיניום גליל (דמו)" },
  },
  {
    id: "L-2038", company: "שערי הכרמל (דמו)", contactName: "מאיה דור", phone: "+97235550104", email: "maya@carmel-demo.example.co.il",
    businessId: "513482919", source: "phone", receivedAt: minutesAgo(190), urgency: "normal", status: "CONTACTED", ownerId: "u4",
    nextTask: { title: "שליחת מפרט גוונים", dueAt: minutesFromNow(120) }, customerId: null, duplicate: null,
  },
  {
    id: "L-2037", company: "ריהוט גן נוף (דמו)", contactName: "עידו רז", phone: "+97235550105", email: "ido@nof-demo.example.co.il",
    businessId: null, source: "website", receivedAt: minutesAgo(26), urgency: "low", status: "NEW", ownerId: null,
    nextTask: null, customerId: null, duplicate: null,
  },
  {
    id: "L-2036", company: "אלומיניום גליל (דמו)", contactName: "לירון בן חיים", phone: "+97235550106", email: "liron@galil-alu-demo.example.co.il",
    businessId: null, source: "email", receivedAt: minutesAgo(300), urgency: "normal", status: "QUALIFIED", ownerId: "u3",
    nextTask: { title: "הכנת טיוטת הצעה", dueAt: minutesFromNow(240) }, customerId: "C-102",
    duplicate: { rule: "email", withId: "C-102", withName: "אלומיניום גליל (דמו)" },
  },
  {
    id: "L-2035", company: "מבני פלדה אופק (דמו)", contactName: "שני אלון", phone: "+97235550107", email: "shani@ofek-demo.example.co.il",
    businessId: "514290733", source: "phone", receivedAt: minutesAgo(1440), urgency: "urgent", status: "ASSIGNED", ownerId: "u2",
    nextTask: { title: "חזרה ללקוח בנושא לוחות זמנים", dueAt: minutesAgo(180) }, customerId: null, duplicate: null,
  },
  {
    id: "L-2034", company: "מטבחי עמק (דמו)", contactName: "גיל טל", phone: "+97235550108", email: "gil@emek-demo.example.co.il",
    businessId: null, source: "whatsapp", receivedAt: minutesAgo(2880), urgency: "low", status: "DISQUALIFIED", ownerId: "u4",
    nextTask: null, customerId: null, duplicate: null,
  },
];

const today = (h: number, m = 0) => new Date(Date.UTC(2026, 9, 12, h - 3, m)).toISOString();

export const CARDS: Record<string, Card> = {
  "C-101": {
    id: "C-101", kind: "customer", name: "מסגריית הדרום (דמו)", status: "לקוח פעיל", ownerId: "u3",
    lastContactAt: minutesAgo(60 * 26), businessId: "516123452", source: "website",
    contacts: [
      { name: "אבי שמש", role: "מנהל רכש", phone: "+97235550101", email: "avi@south-demo.example.co.il" },
      { name: "דנה שמש", role: "הנהלת חשבונות", phone: "+97235550111", email: "dana@south-demo.example.co.il" },
    ],
    activities: [
      { id: "a1", at: minutesAgo(42), kind: "system", text: "פנייה חדשה L-2041 מהאתר — זוהתה התאמה לפי ח״פ, ממתינה לקישור ידני", by: "מערכת" },
      { id: "a2", at: minutesAgo(60 * 26), kind: "call", text: "שיחה: בירור לגבי גוון RAL 7016 לשערים", by: "נועה פרץ" },
      { id: "a3", at: minutesAgo(60 * 72), kind: "email", text: "נשלח קטלוג גוונים", by: "נועה פרץ" },
    ],
    tasks: [
      { id: "t1", title: "לקשר את הפנייה L-2041 ללקוח", dueAt: today(11), done: false, ownerId: "u1" },
      { id: "t2", title: "מעקב אחרי הצעה Q-310", dueAt: today(15, 30), done: false, ownerId: "u3" },
    ],
    quotes: [
      { id: "Q-310", title: "צביעת שערים — 24 יח׳", status: "SENT", version: 2, total: 18400 },
      { id: "Q-298", title: "מעקות מרפסת — 60 מ״א", status: "DRAFT", version: 1, total: 9650 },
    ],
    files: [
      { id: "f1", name: "שרטוט-שער-דמו.pdf", size: "420 KB" },
      { id: "f2", name: "דרישות-גוון-דמו.xlsx", size: "38 KB" },
    ],
  },
  "C-102": {
    id: "C-102", kind: "customer", name: "אלומיניום גליל (דמו)", status: "לקוח פעיל", ownerId: "u3",
    lastContactAt: minutesAgo(60 * 5), businessId: "512345679", source: "email",
    contacts: [{ name: "לירון בן חיים", role: "מנהל תפעול", phone: "+97235550106", email: "liron@galil-alu-demo.example.co.il" }],
    activities: [{ id: "a1", at: minutesAgo(60 * 5), kind: "email", text: "התקבלה בקשה לפרופילים בגוון לבן מט", by: "נועה פרץ" }],
    tasks: [{ id: "t1", title: "הכנת טיוטת הצעה", dueAt: today(14), done: false, ownerId: "u3" }],
    quotes: [],
    files: [],
  },
};

// Every lead also has a lead-kind card, derived deterministically.
for (const l of LEADS) {
  if (CARDS[l.id]) continue;
  CARDS[l.id] = {
    id: l.id, kind: "lead", name: l.company, status: l.status, ownerId: l.ownerId, lastContactAt: l.receivedAt,
    businessId: l.businessId, source: l.source,
    contacts: [{ name: l.contactName, role: "איש קשר", phone: l.phone, email: l.email }],
    activities: [{ id: "a1", at: l.receivedAt, kind: "system", text: `הפנייה נקלטה (${l.id})`, by: "מערכת" }],
    tasks: l.nextTask ? [{ id: "t1", title: l.nextTask.title, dueAt: l.nextTask.dueAt, done: false, ownerId: l.ownerId ?? "u1" }] : [],
    quotes: [],
    files: [],
  };
}

export const userName = (id: string | null) => USERS.find((u) => u.id === id)?.name ?? "ללא אחראי";
