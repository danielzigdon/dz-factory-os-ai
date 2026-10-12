"use client";
import { AlarmClock, ArrowLeft, Banknote, Inbox, UserX, UserPlus } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { STATUS_TONE, UrgencyBadge, useAssign } from "@/components/leads";
import { Button, DueDate, EmptyState, ErrorState, LoadingSkeleton, Panel, PermissionGuard, StatCard, StatusBadge } from "@/components/ui";
import { userName } from "@/lib/fixtures";
import { ago, fmtILS, isOverdue, STATUS_LABEL, URGENCY_RANK } from "@/lib/format";
import { can, ROLE_LABEL } from "@/lib/permissions";
import { useStore } from "@/lib/store";

export default function DashboardView({ openLeadValue }: { openLeadValue?: number }) {
  const params = useSearchParams();
  const state = params.get("state");
  const store = useStore();
  const { role, users, toggleAvailability, toast } = store;
  const leads = state === "empty" ? [] : store.leads;
  const { start, dialog } = useAssign();
  const [done, setDone] = useState<Set<string>>(new Set());

  const open = leads.filter((l) => l.status !== "DISQUALIFIED");
  const unassigned = open.filter((l) => l.ownerId === null);
  const overdue = open.filter((l) => l.nextTask && isOverdue(l.nextTask.dueAt));
  const queue = open.filter((l) => l.ownerId === null || l.urgency === "urgent")
    .sort((a, b) => URGENCY_RANK[a.urgency] - URGENCY_RANK[b.urgency] || a.receivedAt.localeCompare(b.receivedAt));
  const tasks = open.filter((l) => l.nextTask).sort((a, b) => a.nextTask!.dueAt.localeCompare(b.nextTask!.dueAt));
  const manager = users.find((u) => u.role === "manager")!;
  const deputy = users.find((u) => u.role === "deputy")!;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-bold desk:text-[28px]">לוח מנהל</h1>
          <p className="text-sm text-text-secondary">יום שני, 12.10.2026 · מה דורש טיפול עכשיו</p>
        </div>
        <Link href="/s02" className="inline-flex min-h-11 items-center gap-2 rounded-input bg-primary px-4 text-sm font-semibold text-bg hover:bg-primary-hover">
          למרכז הפניות <ArrowLeft aria-hidden size={16} />
        </Link>
      </div>

      {state === "error" ? <ErrorState text="לא ניתן לטעון את נתוני הלוח (הדמיית שגיאת API)." retryHref="/s01" /> : state === "loading" ? (
        <div className="space-y-4"><div className="grid grid-cols-2 gap-3 desk:grid-cols-4">{[0, 1, 2, 3].map((i) => <div key={i} className="skeleton h-28" />)}</div><LoadingSkeleton rows={5} label="טוען את לוח המנהל…" /></div>
      ) : (
        <>
          <section aria-label="מדדים עיקריים" className="grid grid-cols-2 gap-3 desk:grid-cols-4">
            <StatCard icon={Inbox} label="פניות חדשות" value={open.filter((l) => l.status === "NEW").length} hint="היום" href="/s02" />
            <StatCard icon={UserX} label="ללא אחראי" value={unassigned.length} tone={unassigned.length ? "warning" : "neutral"} hint="ממתינות לשיוך" href="/s02?filter=unassigned" />
            <StatCard icon={AlarmClock} label="מעקבים באיחור" value={overdue.length} tone={overdue.length ? "danger" : "neutral"} hint={overdue.length ? "דורש טיפול מיידי" : "אין איחורים"} href="/s02?filter=overdue" />
            {openLeadValue !== undefined
              ? <StatCard icon={Banknote} label="שווי פניות פתוחות" value={<span className="ltr">{fmtILS(state === "empty" ? 0 : openLeadValue)}</span>} hint="הערכה · נתוני הדגמה" />
              : <div className="rounded-card border border-border bg-surface p-4"><PermissionGuard allowed={false} reason="נתון כספי — זמין למנהל/ת בלבד">{null}</PermissionGuard></div>}
          </section>

          <div className="grid gap-4 desk:grid-cols-3">
            <Panel id="queue-h" title="פניות דחופות וללא אחראי" className="desk:col-span-2"
              action={<StatusBadge tone={queue.length ? "danger" : "success"}>{queue.length} בתור</StatusBadge>}>
              {queue.length === 0 ? <EmptyState title="הכול מטופל" text="אין פניות דחופות או פניות ללא אחראי." /> : (
                <ul className="divide-y divide-border">
                  {queue.map((l) => (
                    <li key={l.id} className="flex flex-wrap items-center gap-x-3 gap-y-2 py-3">
                      <div className="min-w-0 flex-1 basis-56">
                        <Link href={`/s03/${l.id}`} className="font-semibold hover:text-focus hover:underline">{l.company}</Link>
                        <div className="text-xs text-text-secondary">{ago(l.receivedAt)} · {userName(l.ownerId)}</div>
                      </div>
                      <UrgencyBadge u={l.urgency} />
                      <StatusBadge tone={STATUS_TONE[l.status]}>{STATUS_LABEL[l.status]}</StatusBadge>
                      <Button onClick={() => start([l.id])} aria-label={`שיוך ${l.company}`} className="min-h-10 px-3"><UserPlus aria-hidden size={15} /> שייך</Button>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>

            <div className="space-y-4">
              <Panel id="tasks-h" title="משימות להיום">
                {tasks.length === 0 ? <EmptyState title="אין משימות פתוחות" text="משימות מעקב יופיעו כאן." /> : (
                  <ul className="space-y-2">
                    {tasks.map((l) => (
                      <li key={l.id}>
                        <label className="flex cursor-pointer items-start gap-3 rounded-input p-2 hover:bg-surface-raised">
                          <input type="checkbox" className="mt-1 size-4 accent-primary" checked={done.has(l.id)}
                            onChange={() => { const n = new Set(done); if (n.has(l.id)) n.delete(l.id); else { n.add(l.id); toast("success", "המשימה סומנה כבוצעה (הדגמה)"); } setDone(n); }} />
                          <span className={`min-w-0 flex-1 ${done.has(l.id) ? "text-text-secondary line-through" : ""}`}>
                            <span className="block">{l.nextTask!.title}</span>
                            <span className="block text-xs text-text-secondary">{l.company} · {userName(l.ownerId)}</span>
                            {!done.has(l.id) && <DueDate iso={l.nextTask!.dueAt} />}
                          </span>
                        </label>
                      </li>
                    ))}
                  </ul>
                )}
              </Panel>

              <Panel id="avail-h" title="זמינות אחראים">
                <ul className="space-y-2 text-sm">
                  {[manager, deputy].map((u) => (
                    <li key={u.id} className="flex items-center justify-between gap-2">
                      <span>{u.name} <span className="text-text-secondary">· {ROLE_LABEL[u.role]}</span></span>
                      <StatusBadge tone={u.available ? "success" : "warning"}>{u.available ? "זמין/ה" : "לא זמין/ה"}</StatusBadge>
                    </li>
                  ))}
                </ul>
                {!manager.available && (
                  <p role="status" className="mt-3 rounded-input border border-warning/50 p-2 text-xs text-warning">
                    פניות פתוחות מנותבות זמנית ל{deputy.name}. ההעברה אינה מעניקה הרשאות מנהל.
                  </p>
                )}
                <div className="mt-3">
                  {can(role, "availability:write")
                    ? <Button className="w-full" onClick={() => { toggleAvailability(manager.id); toast("info", manager.available ? "מצב היעדרות הופעל (הדגמה)" : "מצב היעדרות בוטל (הדגמה)"); }}>
                        {manager.available ? "הפעלת מצב היעדרות" : "סיום מצב היעדרות"}
                      </Button>
                    : <PermissionGuard allowed={false} reason="הפעלת היעדרות זמינה למנהל/ת בלבד">{null}</PermissionGuard>}
                </div>
              </Panel>
            </div>
          </div>
          <p className="text-xs text-text-secondary">נתוני ייצור, הזמנות ורווחיות יוצגו רק לאחר חיבור קריאה ל-Priority (A-08). כל הנתונים במסך בדויים.</p>
        </>
      )}
      {dialog}
    </div>
  );
}
