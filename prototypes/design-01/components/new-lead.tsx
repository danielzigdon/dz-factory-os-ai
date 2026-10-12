"use client";
import { Plus } from "lucide-react";
import { useState } from "react";
import { CARDS, NOW } from "@/lib/fixtures";
import { normalizeBusinessId, normalizeEmail, normalizePhone, SOURCE_LABEL } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { Duplicate, Lead, Source } from "@/lib/types";
import { Button, ConfirmationDialog } from "./ui";

interface Form { company: string; contactName: string; phone: string; email: string; businessId: string; source: Source }
const EMPTY: Form = { company: "", contactName: "", phone: "", email: "", businessId: "", source: "website" };
let seq = 2042;

/** Mock intake with A-01 rules: valid business ID → human linking; phone/email only → suspicion; never auto-merge. */
export function NewLeadButton() {
  const { leads, addLead, toast } = useStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Form>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});

  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, [k]: e.target.value });

  function submit() {
    const err: typeof errors = {};
    if (!form.company.trim()) err.company = "יש להזין שם חברה או שם פונה.";
    const phone = form.phone ? normalizePhone(form.phone) : null;
    if (form.phone && !phone) err.phone = "מספר טלפון לא תקין. לדוגמה: \u206603-555-0199\u2069";
    const email = form.email ? normalizeEmail(form.email) : null;
    if (form.email && !email) err.email = "כתובת אימייל לא תקינה.";
    if (!phone && !email && !err.phone && !err.email) err.phone = "יש להזין טלפון או אימייל.";
    const bid = normalizeBusinessId(form.businessId);
    if (!bid.valid) err.businessId = "ח״פ / ע״מ לא תקין (ספרת ביקורת שגויה). הפנייה תיקלט בלי מזהה עסק אם תמחק/י את השדה.";
    setErrors(err);
    if (Object.keys(err).length) return;

    const customers = Object.values(CARDS).filter((c) => c.kind === "customer");
    let duplicate: Duplicate | null = null;
    const byBid = bid.value && customers.find((c) => c.businessId === bid.value);
    if (byBid) duplicate = { rule: "business_id", withId: byBid.id, withName: byBid.name };
    else {
      const byPhone = phone && leads.find((l) => l.phone === phone);
      const byEmail = email && leads.find((l) => l.email === email);
      if (byPhone) duplicate = { rule: "phone", withId: byPhone.id, withName: byPhone.company };
      else if (byEmail) duplicate = { rule: "email", withId: byEmail.id, withName: byEmail.company };
    }
    const lead: Lead = {
      id: `L-${seq++}`, company: form.company.trim(), contactName: form.contactName.trim() || "—", phone: phone ?? "", email: email ?? "",
      businessId: bid.value, source: form.source, receivedAt: NOW.toISOString(), urgency: "normal", status: "NEW", ownerId: null,
      nextTask: null, customerId: null, duplicate,
    };
    addLead(lead);
    setOpen(false);
    setForm(EMPTY);
    toast(duplicate ? "info" : "success", duplicate
      ? duplicate.rule === "business_id"
        ? `הפנייה נקלטה. ח״פ תואם ל־${duplicate.withName}: לא נוצר לקוח חדש, נדרש קישור ידני.`
        : `הפנייה נקלטה וסומנה כחשד לכפילות (${duplicate.rule === "phone" ? "טלפון" : "אימייל"} זהה ל־${duplicate.withName}). לא בוצע מיזוג.`
      : "הפנייה נקלטה (הדגמה בלבד).");
  }

  const field = (k: keyof Form, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div className="flex flex-col gap-1 text-sm">
      <label htmlFor={`f-${k}`}>{label}</label>
      <input id={`f-${k}`} value={form[k]} onChange={set(k)} aria-invalid={!!errors[k]} aria-describedby={errors[k] ? `err-${k}` : undefined} {...props}
        className={`min-h-11 rounded-input border bg-bg px-3 ${errors[k] ? "border-danger" : "border-border"}`} />
      {errors[k] && <span id={`err-${k}`} className="text-xs text-danger">{errors[k]}</span>}
    </div>
  );

  return (
    <>
      <Button variant="primary" onClick={() => { setErrors({}); setOpen(true); }}><Plus aria-hidden size={18} /> פנייה חדשה</Button>
      <ConfirmationDialog open={open} onClose={() => setOpen(false)} title="פנייה חדשה (הדגמה)" confirmLabel="קליטת פנייה" onConfirm={submit}>
        {field("company", "חברה / שם פונה *")}
        {field("contactName", "איש קשר")}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {field("phone", "טלפון", { dir: "ltr", inputMode: "tel", placeholder: "03-555-0199" })}
          {field("email", "אימייל", { dir: "ltr", type: "text", inputMode: "email" })}
        </div>
        {field("businessId", "ח״פ / ע״מ (אם ידוע)", { dir: "ltr", inputMode: "numeric" })}
        <label className="flex flex-col gap-1 text-sm">
          <span>מקור</span>
          <select value={form.source} onChange={set("source")} className="min-h-11 rounded-input border border-border bg-bg px-3">
            {(Object.keys(SOURCE_LABEL) as Source[]).map((s) => <option key={s} value={s}>{SOURCE_LABEL[s]}</option>)}
          </select>
        </label>
      </ConfirmationDialog>
    </>
  );
}
