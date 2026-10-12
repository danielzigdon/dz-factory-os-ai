"use client";
import { CalendarPlus, ChevronLeft, ChevronRight, FileText, Lock, Mail, MessageSquarePlus, Phone, PlugZap } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { DuplicateBadge } from "@/components/leads";
import { Button, DueDate, EmptyState, ErrorState, Panel, PermissionGuard, StatusBadge } from "@/components/ui";
import { NOW, userName } from "@/lib/fixtures";
import { ago, fmtDateTime, fmtILS, fmtPhone, SOURCE_LABEL, STATUS_LABEL } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { Activity, CardDTO, LeadStatus, Task } from "@/lib/types";

const TABS = [
  { id: "overview", label: "סקירה" },
  { id: "contacts", label: "אנשי קשר" },
  { id: "activity", label: "פעילות" },
  { id: "tasks", label: "משימות" },
  { id: "quotes", label: "הצעות" },
  { id: "files", label: "קבצים" },
] as const;
type TabId = (typeof TABS)[number]["id"];

const QUOTE_STATUS = { DRAFT: "טיוטה", REVIEW: "בבדיקה", APPROVED_INTERNAL: "אושרה פנימית", SENT: "נשלחה" } as const;
const ACT_KIND = { note: "הערה", call: "שיחה", email: "מייל", system: "מערכת" } as const;

function ActivityTimeline({ items }: { items: Activity[] }) {
  if (!items.length) return <EmptyState title="אין פעילות" text="עדיין לא תועדה פעילות." />;
  return (
    <ol className="relative space-y-4 border-r border-border pe-0 ps-0">
      {items.map((a) => (
        <li key={a.id} className="relative pr-5">
          <span aria-hidden className="absolute top-1.5 -right-[5px] size-2.5 rounded-full bg-primary" />
          <div className="flex flex-wrap items-center gap-2 text-xs text-text-secondary">
            <StatusBadge tone="neutral">{ACT_KIND[a.kind]}</StatusBadge>
            <span className="tabular">{fmtDateTime(a.at)}</span> · <span>{a.by}</span>
          </div>
          <p className="mt-1 text-sm">{a.text}</p>
        </li>
      ))}
    </ol>
  );
}

export default function CardView({ card }: { card: CardDTO }) {
  const params = useSearchParams();
  const { leads, toast } = useStore();
  const [tab, setTab] = useState<TabId>((params.get("tab") as TabId) || "overview");
  const [activities, setActivities] = useState<Activity[]>(card.activities);
  const [tasks, setTasks] = useState<Task[]>(card.tasks);
  const [note, setNote] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDue, setTaskDue] = useState("2026-10-13T09:00");
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const stripRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  // overflow: tabs don't fit → both scroll buttons are rendered (fixed width, no layout shift); start/end: enabled state.
  const [hint, setHint] = useState({ overflow: false, start: false, end: false });
  const lead = leads.find((l) => l.id === card.id);

  // RTL scrollLeft is 0 at the start (right) and negative towards the end (left).
  const updateHint = useCallback(() => {
    const el = stripRef.current;
    if (!el) return;
    const row = rowRef.current;
    const max = el.scrollWidth - el.clientWidth;
    const pos = Math.abs(el.scrollLeft);
    const overflow = row ? el.scrollWidth > row.clientWidth : max > 0;
    setHint({ overflow, start: overflow && pos > 2, end: overflow && max - pos > 2 });
  }, []);
  useEffect(() => {
    updateHint();
    const ro = new ResizeObserver(updateHint);
    if (rowRef.current) ro.observe(rowRef.current);
    return () => ro.disconnect();
  }, [updateHint]);
  // Page the strip by ~70% of its width, clamped to the edges (RTL: 0 = start, -max = end).
  const scrollStrip = (dir: 1 | -1) => {
    const el = stripRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const target = Math.min(0, Math.max(-max, el.scrollLeft + dir * Math.round(el.clientWidth * 0.7)));
    el.scrollTo({ left: Math.abs(target) < 24 ? 0 : max + target < 24 ? -max : target, behavior: "smooth" });
  };
  function selectTab(i: number) {
    setTab(TABS[i].id);
  }
  // Runs after the selected tab has re-rendered (it becomes bold and slightly wider), then brings it fully into view;
  // the first/last tab snap to the strip edge so no sliver remains.
  useEffect(() => {
    const el = stripRef.current;
    const i = TABS.findIndex((t) => t.id === tab);
    const t = tabRefs.current[i];
    if (!el || !t) return;
    if (i === 0) el.scrollTo({ left: 0 });
    else if (i === TABS.length - 1) el.scrollTo({ left: -(el.scrollWidth - el.clientWidth) });
    else t.scrollIntoView({ block: "nearest", inline: "nearest" });
    updateHint();
  }, [tab, updateHint]);

  // RTL tab keyboard support: ArrowLeft = next, ArrowRight = previous (WAI-ARIA tabs pattern, mirrored).
  function onTabKey(e: KeyboardEvent, i: number) {
    const n = TABS.length;
    const next = e.key === "ArrowLeft" ? (i + 1) % n : e.key === "ArrowRight" ? (i - 1 + n) % n : e.key === "Home" ? 0 : e.key === "End" ? n - 1 : -1;
    if (next < 0) return;
    e.preventDefault();
    selectTab(next);
    tabRefs.current[next]?.focus();
  }

  function addNote() {
    if (!note.trim()) { toast("error", "יש להזין טקסט להערה."); return; }
    setActivities((a) => [{ id: `n${a.length + 1}`, at: NOW.toISOString(), kind: "note", text: note.trim(), by: "את/ה (הדגמה)" }, ...a]);
    setNote("");
    toast("success", "ההערה נוספה (מקומית בלבד)");
  }
  function addTask() {
    if (!taskTitle.trim()) { toast("error", "יש להזין תיאור למשימה."); return; }
    const dueAt = new Date(`${taskDue}:00+03:00`).toISOString();
    setTasks((t) => [...t, { id: `t${t.length + 1}`, title: taskTitle.trim(), dueAt, done: false, ownerId: card.ownerId ?? "u1" }]);
    setTaskTitle("");
    toast("success", "משימת מעקב נקבעה (מקומית בלבד)");
  }
  const demoContact = (kind: "call" | "email") => toast("info", kind === "call" ? "בגרסת ההדגמה לא מתבצעת שיחה." : "בגרסת ההדגמה לא נשלח מייל.");

  const statusLabel = card.kind === "lead" ? STATUS_LABEL[card.status as LeadStatus] ?? card.status : card.status;
  const primary = card.contacts[0];
  const nextTask = tasks.filter((t) => !t.done).sort((a, b) => a.dueAt.localeCompare(b.dueAt))[0];

  return (
    <div className="space-y-4">
      <header className="rounded-panel border border-border bg-surface p-4 desk:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge tone={card.kind === "customer" ? "success" : "primary"}>{card.kind === "customer" ? "לקוח" : "ליד"}</StatusBadge>
              <span className="ltr text-xs text-text-secondary tabular">{card.id}</span>
            </div>
            <h1 className="mt-1 break-words text-[22px] font-bold desk:text-[26px]">{card.name}</h1>
            <dl className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm">
              <div className="flex gap-1"><dt className="text-text-secondary">סטטוס:</dt><dd>{statusLabel}</dd></div>
              <div className="flex gap-1"><dt className="text-text-secondary">אחראי:</dt><dd>{userName(card.ownerId)}</dd></div>
              <div className="flex gap-1"><dt className="text-text-secondary">קשר אחרון:</dt><dd className="tabular">{ago(card.lastContactAt)}</dd></div>
              <div className="flex gap-1"><dt className="text-text-secondary">מקור:</dt><dd>{SOURCE_LABEL[card.source]}</dd></div>
              {card.businessId && <div className="flex gap-1"><dt className="text-text-secondary">ח״פ:</dt><dd className="ltr tabular">{card.businessId}</dd></div>}
            </dl>
            {lead?.duplicate && <div className="mt-2"><DuplicateBadge d={lead.duplicate} /></div>}
          </div>
          {primary && (
            <div className="flex w-full gap-2 sm:w-auto">
              <Button className="flex-1 sm:flex-none" onClick={() => demoContact("call")} aria-label={`התקשרות אל ${primary.name} (הדגמה)`}><Phone aria-hidden size={16} /> התקשרות</Button>
              <Button className="flex-1 sm:flex-none" onClick={() => demoContact("email")} aria-label={`שליחת מייל אל ${primary.name} (הדגמה)`}><Mail aria-hidden size={16} /> מייל</Button>
            </div>
          )}
        </div>
      </header>

      <div className="grid gap-4 desk:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0 rounded-panel border border-border bg-surface">
          {/* Tab strip: the scroll buttons sit BESIDE the scroller (own flex cells), so they never cover a tab label.
              RTL flex order: start button (right) · scroller · end button (left). */}
          <div ref={rowRef} className="flex items-stretch border-b border-border">
            {hint.overflow && (
              <button type="button" tabIndex={-1} aria-hidden onClick={() => scrollStrip(1)} data-testid="tabs-more-start" disabled={!hint.start}
                className="grid w-11 shrink-0 place-items-center border-l border-border text-focus enabled:hover:bg-surface-raised disabled:cursor-default disabled:opacity-35">
                <span className="grid size-7 place-items-center rounded-full border border-border-strong bg-surface-raised"><ChevronRight size={16} /></span>
              </button>
            )}
            <div ref={stripRef} role="tablist" aria-label="מקטעי כרטיס" onScroll={updateHint}
              className="flex min-w-0 flex-1 overflow-x-auto overscroll-x-contain [scrollbar-width:none]">
              {TABS.map((t, i) => (
                <button key={t.id} ref={(el) => { tabRefs.current[i] = el; }} role="tab" id={`tab-${t.id}`} aria-selected={tab === t.id}
                  aria-controls={`panel-${t.id}`} tabIndex={tab === t.id ? 0 : -1} onClick={() => selectTab(i)} onKeyDown={(e) => onTabKey(e, i)}
                  className={`relative min-h-12 shrink-0 px-4 text-sm focus-visible:outline-offset-[-3px] ${tab === t.id ? "font-semibold text-text-primary" : "text-text-secondary hover:text-text-primary"}`}>
                  {t.label}
                  {tab === t.id && <span aria-hidden className="absolute inset-x-2 bottom-0 h-0.5 rounded bg-primary" />}
                </button>
              ))}
            </div>
            {hint.overflow && (
              <button type="button" tabIndex={-1} aria-hidden onClick={() => scrollStrip(-1)} data-testid="tabs-more-end" disabled={!hint.end}
                className="flex shrink-0 items-center gap-1 border-r border-border px-2 text-xs text-focus enabled:hover:bg-surface-raised disabled:cursor-default disabled:opacity-35">
                <span>עוד</span>
                <span className="grid size-7 place-items-center rounded-full border border-border-strong bg-surface-raised"><ChevronLeft size={16} /></span>
              </button>
            )}
          </div>
          {hint.end && <p className="sr-only">יש טאבים נוספים. אפשר לעבור ביניהם עם מקשי החיצים.</p>}
          <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} tabIndex={0} className="p-4">
            {tab === "overview" && (
              <div className="grid gap-5 desk:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
                <div className="min-w-0 space-y-4">
                  <dl className="grid grid-cols-3 gap-2">
                    {[["משימות פתוחות", tasks.filter((t) => !t.done).length], ["הצעות", card.quotes.length], ["אנשי קשר", card.contacts.length]].map(([k, v]) => (
                      <div key={k} className="rounded-card border border-border px-3 py-2">
                        <dt className="text-xs text-text-secondary">{k}</dt><dd className="tabular text-xl font-bold">{v}</dd>
                      </div>
                    ))}
                  </dl>
                  <section aria-labelledby="ov-act">
                    <div className="mb-2 flex items-center justify-between">
                      <h2 id="ov-act" className="text-sm font-semibold">פעילות אחרונה</h2>
                      <button type="button" onClick={() => selectTab(2)} className="text-xs text-focus underline-offset-4 hover:underline">לכל הפעילות</button>
                    </div>
                    <ActivityTimeline items={activities.slice(0, 4)} />
                  </section>
                </div>
                <div className="min-w-0 space-y-4">
                  <section aria-labelledby="ov-contacts" className="rounded-card border border-border p-3">
                    <h2 id="ov-contacts" className="mb-2 text-sm font-semibold">אנשי קשר</h2>
                    <ul className="space-y-2 text-sm">
                      {card.contacts.map((c) => (
                        <li key={c.email} className="flex flex-wrap items-baseline justify-between gap-x-3">
                          <span><span className="font-medium">{c.name}</span> <span className="text-text-secondary">· {c.role}</span></span>
                          <span className="ltr tabular text-text-secondary">{fmtPhone(c.phone)}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                  <section aria-labelledby="ov-tasks" className="rounded-card border border-border p-3">
                    <h2 id="ov-tasks" className="mb-2 text-sm font-semibold">משימות פתוחות</h2>
                    {tasks.filter((t) => !t.done).length === 0 ? <p className="text-sm text-text-secondary">אין משימות פתוחות.</p> : (
                      <ul className="space-y-2 text-sm">
                        {tasks.filter((t) => !t.done).map((t) => <li key={t.id}><div>{t.title}</div><DueDate iso={t.dueAt} /></li>)}
                      </ul>
                    )}
                  </section>
                  <section aria-labelledby="ov-quotes" className="rounded-card border border-border p-3">
                    <h2 id="ov-quotes" className="mb-2 text-sm font-semibold">הצעות</h2>
                    {card.quotes.length === 0 ? <p className="text-sm text-text-secondary">אין הצעות.</p> : (
                      <ul className="space-y-1 text-sm">
                        {card.quotes.map((q) => (
                          <li key={q.id} className="flex flex-wrap items-center justify-between gap-2">
                            <span>{q.title}</span><StatusBadge tone={q.status === "SENT" ? "primary" : "neutral"}>{QUOTE_STATUS[q.status]}</StatusBadge>
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>
                </div>
              </div>
            )}
            {tab === "contacts" && (
              <ul className="grid gap-3 sm:grid-cols-2">
                {card.contacts.map((c) => (
                  <li key={c.email} className="rounded-card border border-border p-3 text-sm">
                    <div className="font-semibold">{c.name}</div>
                    <div className="text-text-secondary">{c.role}</div>
                    <div className="mt-2 flex items-center gap-2"><Phone aria-hidden size={14} /><span className="ltr tabular">{fmtPhone(c.phone)}</span></div>
                    <div className="flex min-w-0 items-center gap-2"><Mail aria-hidden size={14} /><span className="ltr break-all">{c.email}</span></div>
                  </li>
                ))}
              </ul>
            )}
            {tab === "activity" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="note" className="text-sm font-semibold">הוספת הערה</label>
                  <textarea id="note" value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="תיעוד שיחה, בקשה או החלטה…"
                    className="w-full rounded-input border border-border-strong bg-bg p-3 text-sm" />
                  <Button variant="primary" onClick={addNote}><MessageSquarePlus aria-hidden size={16} /> הוספת הערה</Button>
                </div>
                <ActivityTimeline items={activities} />
              </div>
            )}
            {tab === "tasks" && (
              <div className="space-y-4">
                <fieldset className="grid gap-2 sm:grid-cols-[1fr_auto_auto] sm:items-end">
                  <legend className="mb-2 text-sm font-semibold">קביעת מעקב</legend>
                  <label className="flex flex-col gap-1 text-sm"><span className="text-text-secondary">תיאור</span>
                    <input value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} className="min-h-11 rounded-input border border-border-strong bg-bg px-3" placeholder="לדוגמה: חזרה ללקוח" /></label>
                  <label className="flex flex-col gap-1 text-sm"><span className="text-text-secondary">מועד</span>
                    <input type="datetime-local" value={taskDue} onChange={(e) => setTaskDue(e.target.value)} className="min-h-11 rounded-input border border-border-strong bg-bg px-3 [color-scheme:dark]" /></label>
                  <Button variant="primary" onClick={addTask}><CalendarPlus aria-hidden size={16} /> קביעה</Button>
                </fieldset>
                {tasks.length === 0 ? <EmptyState title="אין משימות" text="קבע/י משימת מעקב ראשונה." /> : (
                  <ul className="divide-y divide-border">
                    {tasks.map((t) => (
                      <li key={t.id} className="flex items-start gap-3 py-3">
                        <input type="checkbox" aria-label={`סימון ${t.title} כבוצעה`} checked={t.done} className="mt-1 size-4 accent-primary"
                          onChange={() => setTasks((ts) => ts.map((x) => (x.id === t.id ? { ...x, done: !x.done } : x)))} />
                        <div className={t.done ? "text-text-secondary line-through" : ""}>
                          <div>{t.title}</div>
                          <div className="text-xs text-text-secondary">{userName(t.ownerId)}</div>
                          {!t.done && <DueDate iso={t.dueAt} />}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            {tab === "quotes" && (card.quotes.length === 0 ? <EmptyState title="אין הצעות" text="הצעות מחיר ייבנו ב-Sprint 3." /> : (
              <ul className="space-y-2">
                {card.quotes.map((q) => (
                  <li key={q.id} className="flex flex-wrap items-center justify-between gap-2 rounded-card border border-border p-3 text-sm">
                    <div><div className="font-semibold">{q.title}</div><div className="text-xs text-text-secondary"><span className="ltr">{q.id}</span> · גרסה {q.version}</div></div>
                    <div className="flex items-center gap-2"><StatusBadge tone={q.status === "SENT" ? "primary" : "neutral"}>{QUOTE_STATUS[q.status]}</StatusBadge><span className="ltr tabular font-semibold">{fmtILS(q.total)}</span></div>
                  </li>
                ))}
                <li className="text-xs text-text-secondary">סכומים לפני מע״מ · נתוני הדגמה</li>
              </ul>
            ))}
            {tab === "files" && (card.files.length === 0 ? <EmptyState title="אין קבצים" text="קבצים מצורפים יופיעו כאן." /> : (
              <ul className="space-y-2">
                {card.files.map((f) => (
                  <li key={f.id}>
                    <button type="button" onClick={() => toast("info", "בגרסת ההדגמה אין קבצים אמיתיים להורדה.")}
                      className="flex w-full items-center gap-3 rounded-card border border-border-strong p-3 text-right text-sm hover:bg-surface-raised">
                      <FileText aria-hidden size={18} className="text-primary" /><span className="flex-1 break-all">{f.name}</span><span className="text-text-secondary">{f.size}</span>
                    </button>
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>

        <aside className="space-y-4" aria-label="מידע משני">
          <Panel id="next-h" title="המשימה הבאה">
            {nextTask ? <div className="text-sm"><div>{nextTask.title}</div><DueDate iso={nextTask.dueAt} /></div>
              : <p className="text-sm text-text-secondary">אין משימה פתוחה. <button className="text-focus underline" onClick={() => setTab("tasks")}>קביעת מעקב</button></p>}
          </Panel>
          <Panel id="src-h" title="מקור וחיבורים">
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-2"><dt className="text-text-secondary">מקור</dt><dd>{SOURCE_LABEL[card.source]}</dd></div>
              <div className="flex justify-between gap-2"><dt className="text-text-secondary">Priority</dt>
                <dd><StatusBadge tone="neutral" icon={PlugZap}>טרם חובר</StatusBadge></dd></div>
            </dl>
            <p className="mt-2 text-xs text-text-secondary">לא נוצרת רשומת לקוח ב-Priority מתוך הכרטיס.</p>
          </Panel>
          <Panel id="fin-h" title="נתונים כספיים חסויים" action={<Lock aria-hidden size={16} className="text-text-secondary" />}>
            <PermissionGuard allowed={!!card.confidential} reason={card.kind === "lead" ? "אין נתונים כספיים לליד." : "זמין למנהל/ת בלבד. הנתונים לא נשלחו לדפדפן."}>
              {card.confidential && (
                <dl data-testid="confidential" className="space-y-2 text-sm">
                  <div className="flex justify-between"><dt className="text-text-secondary">עלות משוערת</dt><dd className="ltr tabular">{fmtILS(card.confidential.estimatedCost)}</dd></div>
                  <div className="flex justify-between"><dt className="text-text-secondary">רווח גולמי משוער</dt><dd className="ltr tabular">{card.confidential.marginPct}%</dd></div>
                  <div className="flex justify-between"><dt className="text-text-secondary">מחיר אבקה מספק (ק״ג)</dt><dd className="ltr tabular">{fmtILS(card.confidential.supplierPowderPricePerKg, 2)}</dd></div>
                </dl>
              )}
              {card.confidential && <p className="mt-2 text-xs text-warning">הערכה — העלויות טרם אומתו (R-20)</p>}
            </PermissionGuard>
          </Panel>
        </aside>
      </div>
    </div>
  );
}
