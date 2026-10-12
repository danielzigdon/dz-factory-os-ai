"use client";
import { AlertTriangle, ArrowDownUp, Copy, Filter, Flame, Link2, Plus, RotateCcw, Search, UserPlus } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { userName } from "@/lib/fixtures";
import { ago, fmtPhone, isOverdue, SOURCE_LABEL, STATUS_LABEL, URGENCY_LABEL, URGENCY_RANK } from "@/lib/format";
import { can } from "@/lib/permissions";
import { useStore } from "@/lib/store";
import type { Lead, LeadStatus, Source } from "@/lib/types";
import { Button, ConfirmationDialog, DueDate, EmptyState, OwnerSelect, StatusBadge, type Tone } from "./ui";

export const STATUS_TONE: Record<LeadStatus, Tone> = {
  NEW: "primary", TRIAGE: "warning", ASSIGNED: "neutral", CONTACTED: "neutral", QUALIFIED: "success", DISQUALIFIED: "neutral",
};

export function UrgencyBadge({ u }: { u: Lead["urgency"] }) {
  if (u === "urgent") return <StatusBadge tone="danger" icon={Flame}>{URGENCY_LABEL[u]}</StatusBadge>;
  return <StatusBadge tone="neutral">{URGENCY_LABEL[u]}</StatusBadge>;
}

/** Duplicate provenance (A-01): business-ID match needs human linking; phone/email is only a suspicion. */
export function DuplicateBadge({ d }: { d: NonNullable<Lead["duplicate"]> }) {
  const exact = d.rule === "business_id";
  const why = exact ? `ח״פ זהה ל־${d.withName} — נדרש קישור ידני` : `${d.rule === "phone" ? "טלפון" : "אימייל"} זהה ל־${d.withName} — חשד בלבד, לא ימוזג אוטומטית`;
  return (
    <span title={why} className="inline-flex">
      <StatusBadge tone={exact ? "warning" : "neutral"} icon={exact ? Link2 : Copy}>{exact ? "נדרש קישור" : "חשד לכפילות"}</StatusBadge>
      <span className="sr-only">{why}</span>
    </span>
  );
}

export type QuickFilter = "unassigned" | "urgent" | "overdue";

export function useLeadFilters(leads: Lead[], init: { q?: string; quick?: QuickFilter | null }) {
  const [q, setQ] = useState(init.q ?? "");
  const [quick, setQuick] = useState<Set<QuickFilter>>(new Set(init.quick ? [init.quick] : []));
  const [status, setStatus] = useState<LeadStatus | "">("");
  const [source, setSource] = useState<Source | "">("");
  const [sort, setSort] = useState<{ key: "receivedAt" | "urgency"; dir: "asc" | "desc" }>({ key: "receivedAt", dir: "desc" });

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const digits = needle.replace(/\D/g, "");
    const out = leads.filter((l) =>
      (!needle || [l.company, l.contactName, l.email, l.id].some((s) => s.toLowerCase().includes(needle)) || (digits.length >= 3 && ("0" + l.phone.slice(4)).includes(digits))) &&
      (!quick.has("unassigned") || l.ownerId === null) &&
      (!quick.has("urgent") || l.urgency === "urgent") &&
      (!quick.has("overdue") || (l.nextTask !== null && isOverdue(l.nextTask.dueAt))) &&
      (!status || l.status === status) &&
      (!source || l.source === source));
    const k = sort.dir === "asc" ? 1 : -1;
    return out.sort((a, b) =>
      sort.key === "urgency" ? (URGENCY_RANK[a.urgency] - URGENCY_RANK[b.urgency]) * k : a.receivedAt.localeCompare(b.receivedAt) * k);
  }, [leads, q, quick, status, source, sort]);

  const active = q !== "" || quick.size > 0 || status !== "" || source !== "";
  const reset = () => { setQ(""); setQuick(new Set()); setStatus(""); setSource(""); };
  const toggleQuick = (f: QuickFilter) => setQuick((s) => { const n = new Set(s); if (n.has(f)) n.delete(f); else n.add(f); return n; });
  return { rows, q, setQ, quick, toggleQuick, status, setStatus, source, setSource, sort, setSort, active, reset };
}

type Filters = ReturnType<typeof useLeadFilters>;

const QUICK_LABEL: Record<QuickFilter, string> = { unassigned: "ללא אחראי", urgent: "דחוף", overdue: "משימה באיחור" };

export function FilterBar({ f, count }: { f: Filters; count: number }) {
  const [open, setOpen] = useState(false);
  const selects = (
    <>
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-text-secondary">סטטוס</span>
        <select value={f.status} onChange={(e) => f.setStatus(e.target.value as LeadStatus | "")} className="min-h-11 rounded-input border border-border-strong bg-bg px-3">
          <option value="">הכול</option>
          {(Object.keys(STATUS_LABEL) as LeadStatus[]).map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-text-secondary">מקור</span>
        <select value={f.source} onChange={(e) => f.setSource(e.target.value as Source | "")} className="min-h-11 rounded-input border border-border-strong bg-bg px-3">
          <option value="">הכול</option>
          {(Object.keys(SOURCE_LABEL) as Source[]).map((s) => <option key={s} value={s}>{SOURCE_LABEL[s]}</option>)}
        </select>
      </label>
    </>
  );
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end gap-2">
        <label className="relative min-w-0 flex-1 basis-60">
          <span className="sr-only">חיפוש פניות</span>
          <Search aria-hidden size={16} className="absolute top-1/2 right-3 -translate-y-1/2 text-text-secondary" />
          <input type="search" value={f.q} onChange={(e) => f.setQ(e.target.value)} placeholder="חיפוש לפי חברה, איש קשר, טלפון או אימייל"
            className="min-h-11 w-full rounded-input border border-border-strong bg-bg pe-3 ps-9 text-sm" />
        </label>
        <Button className="md:hidden" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="mobile-filters">
          <Filter aria-hidden size={16} /> סינון{f.active ? " (פעיל)" : ""}
        </Button>
        <div className="hidden items-end gap-2 md:flex">{selects}</div>
      </div>
      <div id="mobile-filters" className={`${open ? "grid" : "hidden"} grid-cols-2 gap-2 md:hidden`}>{selects}</div>
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="סינון מהיר">
        {(Object.keys(QUICK_LABEL) as QuickFilter[]).map((k) => (
          <button key={k} type="button" aria-pressed={f.quick.has(k)} onClick={() => f.toggleQuick(k)}
            className={`min-h-11 rounded-full border px-3 text-sm desk:min-h-9 ${f.quick.has(k) ? "border-primary bg-primary/15 text-text-primary" : "border-border-strong text-text-secondary hover:border-primary"}`}>
            {QUICK_LABEL[k]}
          </button>
        ))}
        {f.active && (
          <button type="button" onClick={f.reset} className="inline-flex min-h-11 items-center gap-1 px-2 text-sm text-focus underline-offset-4 hover:underline desk:min-h-9">
            <RotateCcw aria-hidden size={14} /> ניקוי סינון
          </button>
        )}
        <span role="status" className="ms-auto text-sm text-text-secondary">{count} פניות מוצגות</span>
      </div>
    </div>
  );
}

function SortButton({ f, k, label }: { f: Filters; k: "receivedAt" | "urgency"; label: string }) {
  const active = f.sort.key === k;
  return (
    <button type="button" onClick={() => f.setSort({ key: k, dir: active && f.sort.dir === "desc" ? "asc" : "desc" })}
      className="inline-flex items-center gap-1 hover:text-text-primary">
      {label} <ArrowDownUp aria-hidden size={12} className={active ? "text-focus" : ""} />
    </button>
  );
}

/** Assignment flow shared by table, cards and dashboard; unauthorized roles get an explicit refusal (A-07). */
export function useAssign() {
  const { role, assign, toast } = useStore();
  const [target, setTarget] = useState<string[] | null>(null);
  const [owner, setOwner] = useState("");
  const start = (ids: string[]) => {
    if (!can(role, ids.length > 1 ? "leads:bulk_assign" : "leads:assign")) {
      toast("error", "אין לך הרשאה לשייך פניות. שיוך זמין למנהל/ת ולממלא/ת מקום בלבד.");
      return;
    }
    setOwner("");
    setTarget(ids);
  };
  const dialog = (
    <ConfirmationDialog open={target !== null} onClose={() => setTarget(null)}
      title={target && target.length > 1 ? `שיוך ${target.length} פניות` : "שיוך פנייה"}
      confirmLabel="אישור שיוך" confirmDisabled={!owner}
      onConfirm={() => { if (target) { assign(target, owner); toast("success", `${target.length} פניות שויכו ל${userName(owner)}`); } setTarget(null); }}>
      {target && target.length > 1 && <p className="text-sm text-warning">פעולה מרוכזת: השיוך יחול על כל הפניות שנבחרו.</p>}
      <OwnerSelect id="assign-owner" value={owner} onChange={setOwner} />
      <p className="text-xs text-text-secondary">השיוך מתבצע בהדגמה בלבד ואינו נשמר.</p>
    </ConfirmationDialog>
  );
  return { start, dialog, allowed: can(role, "leads:assign") };
}

export function LeadTable({ f, onAssign, selected, setSelected, allowed }: {
  f: Filters; onAssign: (ids: string[]) => void; selected: Set<string>; setSelected: (s: Set<string>) => void; allowed: boolean;
}) {
  const all = f.rows.length > 0 && f.rows.every((r) => selected.has(r.id));
  const ariaSort = (k: "receivedAt" | "urgency") => (f.sort.key === k ? (f.sort.dir === "asc" ? "ascending" : "descending") : "none");
  return (
    <div className="hidden overflow-x-auto rounded-card border border-border md:block">
      <table className="w-full min-w-[980px] text-sm">
        <caption className="sr-only">רשימת פניות</caption>
        <thead className="bg-surface-raised text-right text-xs text-text-secondary">
          <tr>
            <th scope="col" className="w-10 p-3">
              {allowed && <input type="checkbox" aria-label="בחירת כל הפניות המוצגות" checked={all}
                onChange={() => setSelected(all ? new Set() : new Set(f.rows.map((r) => r.id)))} className="size-4 accent-primary" />}
            </th>
            <th scope="col" className="p-3 font-medium">שם / חברה</th>
            <th scope="col" className="p-3 font-medium">מקור</th>
            <th scope="col" className="p-3 font-medium" aria-sort={ariaSort("receivedAt")}><SortButton f={f} k="receivedAt" label="התקבל" /></th>
            <th scope="col" className="p-3 font-medium" aria-sort={ariaSort("urgency")}><SortButton f={f} k="urgency" label="דחיפות" /></th>
            <th scope="col" className="p-3 font-medium">סטטוס</th>
            <th scope="col" className="p-3 font-medium">אחראי</th>
            <th scope="col" className="p-3 font-medium">משימה הבאה</th>
            <th scope="col" className="p-3 font-medium">פעולה</th>
          </tr>
        </thead>
        <tbody>
          {f.rows.map((l) => (
            <tr key={l.id} className="border-t border-border bg-surface hover:bg-surface-raised">
              <td className="p-3">
                {allowed && <input type="checkbox" aria-label={`בחירת ${l.company}`} checked={selected.has(l.id)}
                  onChange={() => { const n = new Set(selected); if (n.has(l.id)) n.delete(l.id); else n.add(l.id); setSelected(n); }} className="size-4 accent-primary" />}
              </td>
              <td className="p-3">
                <Link href={`/s03/${l.id}`} className="font-semibold hover:text-focus hover:underline">{l.company}</Link>
                <div className="text-xs text-text-secondary">{l.contactName} · <span className="ltr tabular">{fmtPhone(l.phone)}</span></div>
                {l.duplicate && <div className="mt-1"><DuplicateBadge d={l.duplicate} /></div>}
              </td>
              <td className="p-3">{SOURCE_LABEL[l.source]}</td>
              <td className="tabular whitespace-nowrap p-3 text-text-secondary">{ago(l.receivedAt)}</td>
              <td className="p-3"><UrgencyBadge u={l.urgency} /></td>
              <td className="p-3"><StatusBadge tone={STATUS_TONE[l.status]}>{STATUS_LABEL[l.status]}</StatusBadge></td>
              <td className={`p-3 ${l.ownerId ? "" : "font-semibold text-warning"}`}>{l.ownerId ? userName(l.ownerId) : <span className="inline-flex items-center gap-1"><AlertTriangle aria-hidden size={13} /> ללא אחראי</span>}</td>
              <td className="p-3">{l.nextTask ? <div><div>{l.nextTask.title}</div><DueDate iso={l.nextTask.dueAt} /></div> : <span className="text-text-secondary">—</span>}</td>
              <td className="p-3">
                <Button onClick={() => onAssign([l.id])} aria-label={`שיוך ${l.company}`} className="min-h-9 px-3">
                  <UserPlus aria-hidden size={15} /> שייך
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function LeadCard({ l, onAssign }: { l: Lead; onAssign: (ids: string[]) => void }) {
  return (
    <li className="rounded-card border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <Link href={`/s03/${l.id}`} className="block break-words font-semibold hover:text-focus">{l.company}</Link>
          <div className="text-xs text-text-secondary">{l.contactName} · {SOURCE_LABEL[l.source]} · {ago(l.receivedAt)}</div>
        </div>
        <UrgencyBadge u={l.urgency} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <StatusBadge tone={STATUS_TONE[l.status]}>{STATUS_LABEL[l.status]}</StatusBadge>
        {l.duplicate && <DuplicateBadge d={l.duplicate} />}
      </div>
      <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
        <dt className="text-text-secondary">אחראי</dt>
        <dd className={l.ownerId ? "" : "font-semibold text-warning"}>{userName(l.ownerId)}</dd>
        <dt className="text-text-secondary">משימה הבאה</dt>
        <dd>{l.nextTask ? <>{l.nextTask.title}<br /><DueDate iso={l.nextTask.dueAt} /></> : "—"}</dd>
      </dl>
      <div className="mt-3 flex gap-2">
        <Button onClick={() => onAssign([l.id])} aria-label={`שיוך ${l.company}`} className="flex-1"><UserPlus aria-hidden size={16} /> שייך</Button>
        <Link href={`/s03/${l.id}`} className="inline-flex min-h-11 flex-1 items-center justify-center rounded-input border border-border-strong text-sm hover:border-primary">פרטים</Link>
      </div>
    </li>
  );
}

export function LeadCards({ rows, onAssign }: { rows: Lead[]; onAssign: (ids: string[]) => void }) {
  return <ul className="space-y-3 md:hidden" aria-label="רשימת פניות">{rows.map((l) => <LeadCard key={l.id} l={l} onAssign={onAssign} />)}</ul>;
}

export function NoResults({ onReset }: { onReset: () => void }) {
  return <EmptyState title="אין פניות שתואמות לסינון" text="נסה/י לשנות את החיפוש או לנקות את הסינון." action={<Button onClick={onReset}><RotateCcw aria-hidden size={16} /> ניקוי סינון</Button>} />;
}

export const NewLeadIcon = Plus;
