"use client";
import { Bell, Database, Inbox, LayoutDashboard, Menu, PlugZap, Search, UserRound, X, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { isOverdue } from "@/lib/format";
import { ROLE_LABEL } from "@/lib/permissions";
import { useStore } from "@/lib/store";
import type { Role } from "@/lib/types";
import { Toasts } from "./ui";

interface NavItem { href: string; match: string; label: string; icon: LucideIcon; code: string }
export const NAV: NavItem[] = [
  { href: "/s01", match: "/s01", label: "לוח מנהל", icon: LayoutDashboard, code: "S01" },
  { href: "/s02", match: "/s02", label: "מרכז פניות", icon: Inbox, code: "S02" },
  { href: "/s03/C-101", match: "/s03", label: "כרטיס לקוח", icon: UserRound, code: "S03" },
];

function NavLinks({ onNavigate, compact = false }: { onNavigate?: () => void; compact?: boolean }) {
  const path = usePathname();
  return (
    <ul className={compact ? "grid grid-cols-3" : "space-y-1"}>
      {NAV.map((n) => {
        const active = path.startsWith(n.match);
        return (
          <li key={n.href}>
            <Link href={n.href} onClick={onNavigate} aria-current={active ? "page" : undefined}
              className={compact
                ? `flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs ${active ? "text-focus" : "text-text-secondary"}`
                : `relative flex min-h-11 items-center gap-3 rounded-input px-3 text-sm ${active ? "bg-surface-raised font-semibold text-text-primary" : "text-text-secondary hover:bg-surface-raised hover:text-text-primary"}`}>
              {active && <span aria-hidden className={compact ? "absolute top-0 h-0.5 w-10 rounded bg-primary" : "absolute inset-y-2 right-0 w-1 rounded-l bg-primary"} />}
              <n.icon aria-hidden size={compact ? 20 : 18} />
              <span>{n.label}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-2 px-3">
      <span aria-hidden className="grid size-8 place-items-center rounded-input bg-primary text-sm font-black text-bg">YC</span>
      <div className="leading-tight">
        <div className="font-bold">Yuval Control</div>
        <div className="text-xs text-text-secondary">יובל גוונים</div>
      </div>
    </div>
  );
}

export function SideNav() {
  return (
    <nav aria-label="ניווט ראשי" className="fixed inset-y-0 right-0 hidden w-[240px] flex-col gap-6 border-l border-border bg-sidebar py-5 desk:flex">
      <Brand />
      <div className="px-3"><NavLinks /></div>
      <div className="mt-auto space-y-2 px-6 text-xs text-text-secondary">
        <p>מסכים נוספים (S04–S12) יתווספו בשלבים הבאים.</p>
      </div>
    </nav>
  );
}

/** Mobile (<768px): bottom navigation — chosen consistently per contract §3. */
export function MobileNav() {
  return (
    <nav aria-label="ניווט ראשי" className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-sidebar pb-[env(safe-area-inset-bottom)] md:hidden">
      <NavLinks compact />
    </nav>
  );
}

/** Tablet (768–1199px): navigation drawer. */
function NavDrawer() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-label="פתיחת תפריט ניווט" aria-haspopup="dialog"
        className="hidden min-h-11 min-w-11 place-items-center rounded-input border border-border md:max-desk:grid">
        <Menu aria-hidden size={20} />
      </button>
      <dialog ref={ref} onClose={() => setOpen(false)} aria-label="תפריט ניווט"
        className="my-0 mr-0 ml-auto h-dvh max-h-none w-[260px] border-l border-border bg-sidebar p-0 text-text-primary">
        <div className="flex items-center justify-between py-4 pe-2">
          <Brand />
          <button type="button" onClick={() => setOpen(false)} aria-label="סגירת תפריט" className="rounded-input p-2 hover:bg-surface-raised"><X aria-hidden size={18} /></button>
        </div>
        <nav aria-label="ניווט ראשי" className="px-3"><NavLinks onNavigate={() => setOpen(false)} /></nav>
      </dialog>
    </>
  );
}

function RoleSwitcher() {
  const { role, setRole, toast } = useStore();
  const router = useRouter();
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="hidden text-text-secondary lg:inline">תפקיד (הדמיה)</span>
      <select aria-label="תפקיד מדומה" value={role}
        onChange={(e) => { setRole(e.target.value as Role); router.refresh(); toast("info", `התצוגה עודכנה להרשאות: ${ROLE_LABEL[e.target.value as Role]}`); }}
        className="min-h-11 rounded-input border border-border bg-bg px-2 text-text-primary">
        {(Object.keys(ROLE_LABEL) as Role[]).map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
      </select>
    </label>
  );
}

function ScenarioSelect() {
  const router = useRouter();
  const path = usePathname();
  const params = useSearchParams();
  const value = params.get("state") ?? "";
  return (
    <select aria-label="תרחיש תצוגה (הדגמה)" value={value}
      onChange={(e) => {
        const p = new URLSearchParams(params.toString());
        if (e.target.value) p.set("state", e.target.value); else p.delete("state");
        router.push(`${path}${p.size ? `?${p}` : ""}`);
      }}
      className="min-h-11 rounded-input border border-border bg-bg px-2 text-sm text-text-primary">
      <option value="">תרחיש: רגיל</option>
      <option value="loading">תרחיש: טעינה</option>
      <option value="empty">תרחיש: ריק</option>
      <option value="error">תרחיש: שגיאה</option>
    </select>
  );
}

function Notifications() {
  const { leads } = useStore();
  const [open, setOpen] = useState(false);
  const items = leads.filter((l) => l.status !== "DISQUALIFIED" && (l.ownerId === null || (l.nextTask && isOverdue(l.nextTask.dueAt))));
  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="notif-panel"
        aria-label={`התראות: ${items.length} דורשות טיפול`} className="relative grid min-h-11 min-w-11 place-items-center rounded-input border border-border hover:bg-surface-raised">
        <Bell aria-hidden size={18} />
        <span aria-hidden className="tabular absolute -top-1 -left-1 grid size-5 place-items-center rounded-full bg-danger text-[11px] font-bold text-bg">{items.length}</span>
      </button>
      {open && (
        <div id="notif-panel" className="absolute left-0 top-12 z-50 w-[min(86vw,320px)] rounded-card border border-border bg-surface-raised p-2 shadow-xl">
          <p className="px-2 py-1 text-xs text-text-secondary">התראות (נתוני הדגמה)</p>
          <ul>
            {items.map((l) => (
              <li key={l.id}>
                <Link href={`/s03/${l.id}`} onClick={() => setOpen(false)} className="block rounded-input px-2 py-2 text-sm hover:bg-surface">
                  {l.ownerId === null ? "ללא אחראי: " : "משימה באיחור: "}{l.company}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function GlobalSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");
  return (
    <form role="search" onSubmit={(e) => { e.preventDefault(); router.push(`/s02?q=${encodeURIComponent(q)}`); }} className="hidden min-w-0 flex-1 lg:block">
      <label className="relative block max-w-md">
        <span className="sr-only">חיפוש כללי בפניות</span>
        <Search aria-hidden size={16} className="absolute top-1/2 right-3 -translate-y-1/2 text-text-secondary" />
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="חיפוש חברה, איש קשר, טלפון…"
          className="min-h-10 w-full rounded-input border border-border bg-bg pe-3 ps-9 text-sm placeholder:text-text-secondary" />
      </label>
    </form>
  );
}

export function TopBar() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-bg/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1600px] items-center gap-2 px-4 py-2 md:px-6">
        <NavDrawer />
        <div className="md:hidden"><span className="sr-only">Yuval Control</span><span aria-hidden className="grid size-9 place-items-center rounded-input bg-primary text-sm font-black text-bg">YC</span></div>
        <GlobalSearch />
        <div className="ms-auto flex items-center gap-2">
          <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-warning/60 px-2 py-1 text-xs text-warning" title="כל הנתונים במסך הם נתוני הדגמה בדויים">
            <Database aria-hidden size={13} /> נתוני הדגמה
          </span>
          <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-border px-2 py-1 text-xs text-text-secondary">
            <PlugZap aria-hidden size={13} /> <span className="ltr">Priority</span><span className="max-sm:hidden">:</span> <span>טרם חובר</span>
          </span>
          <Notifications />
        </div>
      </div>
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-2 border-t border-border/60 px-4 py-2 md:px-6">
        <RoleSwitcher />
        <ScenarioSelect />
      </div>
    </header>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh">
      <a href="#main" className="sr-only z-50 rounded-input bg-primary px-4 py-2 text-bg focus:not-sr-only focus:fixed focus:top-2 focus:right-2">דילוג לתוכן</a>
      <SideNav />
      <div className="desk:pr-[240px]">
        <TopBar />
        <main id="main" tabIndex={-1} className="mx-auto max-w-[1600px] px-4 pt-4 pb-24 md:px-6 md:pb-10 desk:pt-6">{children}</main>
      </div>
      <MobileNav />
      <Toasts />
    </div>
  );
}
