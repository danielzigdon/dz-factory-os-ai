"use client";
import { AlertTriangle, CheckCircle2, Clock, Info, Lock, RefreshCw, ShieldAlert, X, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { fmtDateTime, isOverdue } from "@/lib/format";
import { USERS } from "@/lib/fixtures";
import { useStore, type ToastMsg } from "@/lib/store";

export type Tone = "neutral" | "primary" | "success" | "warning" | "danger";
const TONE: Record<Tone, string> = {
  neutral: "border-border text-text-secondary",
  primary: "border-primary/60 text-focus",
  success: "border-success/60 text-success",
  warning: "border-warning/60 text-warning",
  danger: "border-danger/60 text-danger",
};

/** Status never relies on color alone: every badge carries text and, optionally, an icon. */
export function StatusBadge({ tone, icon: Icon, children }: { tone: Tone; icon?: LucideIcon; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-medium ${TONE[tone]}`}>
      {Icon && <Icon aria-hidden size={13} />}
      {children}
    </span>
  );
}

export function StatCard({ label, value, hint, tone = "neutral", href, icon: Icon }: {
  label: string; value: ReactNode; hint?: string; tone?: Tone; href?: string; icon: LucideIcon;
}) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm text-text-secondary">{label}</span>
        <Icon aria-hidden size={18} className={tone === "danger" ? "text-danger" : tone === "warning" ? "text-warning" : "text-primary"} />
      </div>
      <div className={`tabular mt-2 text-[26px] font-bold leading-tight desk:text-[32px] ${tone === "danger" ? "text-danger" : ""}`}>{value}</div>
      {hint && <div className="mt-1 text-xs text-text-secondary">{hint}</div>}
    </>
  );
  const cls = "block rounded-card border border-border bg-surface p-4";
  return href ? <Link href={href} className={`${cls} hover:bg-surface-raised`}>{body}</Link> : <div className={cls}>{body}</div>;
}

export function Panel({ title, action, children, className = "", id }: { title: string; action?: ReactNode; children: ReactNode; className?: string; id?: string }) {
  return (
    <section aria-labelledby={id} className={`rounded-panel border border-border bg-surface ${className}`}>
      <header className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
        <h2 id={id} className="text-base font-semibold">{title}</h2>
        {action}
      </header>
      <div className="p-4">{children}</div>
    </section>
  );
}

export function Button({ variant = "secondary", className = "", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" | "danger" }) {
  const v = {
    primary: "bg-primary text-bg hover:bg-primary-hover font-semibold",
    secondary: "border border-border-strong bg-surface-raised text-text-primary hover:border-primary",
    ghost: "text-text-primary hover:bg-surface-raised",
    danger: "bg-danger text-bg font-semibold",
  }[variant];
  return (
    <button
      {...props}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-input px-4 text-sm transition-colors desk:min-h-10 disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:cursor-not-allowed aria-disabled:opacity-60 ${v} ${className}`}
    />
  );
}

export function DueDate({ iso }: { iso: string }) {
  const late = isOverdue(iso);
  return (
    <span className={`tabular inline-flex items-center gap-1 ${late ? "text-danger" : "text-text-secondary"}`}>
      <Clock aria-hidden size={13} />
      <span className="ltr">{fmtDateTime(iso)}</span>
      {late && <span className="font-semibold">· באיחור</span>}
    </span>
  );
}

export function EmptyState({ title, text, action }: { title: string; text: string; action?: ReactNode }) {
  return (
    <div role="status" className="flex flex-col items-center gap-2 py-10 text-center">
      <CheckCircle2 aria-hidden size={32} className="text-success" />
      <p className="font-semibold">{title}</p>
      <p className="max-w-sm text-sm text-text-secondary">{text}</p>
      {action}
    </div>
  );
}

export function ErrorState({ title = "לא ניתן לטעון את הנתונים", text, retryHref }: { title?: string; text: string; retryHref: string }) {
  return (
    <div role="alert" className="flex flex-col items-center gap-2 rounded-card border border-danger/50 bg-surface py-10 text-center">
      <AlertTriangle aria-hidden size={32} className="text-danger" />
      <p className="font-semibold text-danger">{title}</p>
      <p className="max-w-sm text-sm text-text-secondary">{text}</p>
      <Link href={retryHref} className="mt-2 inline-flex min-h-11 items-center gap-2 rounded-input bg-primary px-4 text-sm font-semibold text-bg hover:bg-primary-hover">
        <RefreshCw aria-hidden size={16} /> נסה שוב
      </Link>
    </div>
  );
}

export function LoadingSkeleton({ rows = 4, label }: { rows?: number; label: string }) {
  return (
    <div aria-busy="true" aria-live="polite" className="space-y-3">
      <span className="sr-only">{label}</span>
      {Array.from({ length: rows }, (_, i) => <div key={i} className="skeleton h-12" />)}
    </div>
  );
}

/** Renders children only when allowed; otherwise an explanation. Data itself is already filtered on the server. */
export function PermissionGuard({ allowed, children, reason }: { allowed: boolean; children: ReactNode; reason: string }) {
  if (allowed) return <>{children}</>;
  return (
    <div className="flex items-center gap-2 rounded-card border border-dashed border-border p-3 text-sm text-text-secondary">
      <Lock aria-hidden size={16} /> {reason}
    </div>
  );
}

export function OwnerSelect({ value, onChange, id, label = "אחראי" }: { value: string; onChange: (v: string) => void; id: string; label?: string }) {
  return (
    <label htmlFor={id} className="flex flex-col gap-1 text-sm">
      <span className="text-text-secondary">{label}</span>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)}
        className="min-h-11 rounded-input border border-border-strong bg-bg px-3 text-text-primary">
        <option value="">בחר/י אחראי</option>
        {USERS.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
      </select>
    </label>
  );
}

/** Native <dialog> gives focus trapping and Esc handling for free. */
export function ConfirmationDialog({ open, title, children, confirmLabel, onConfirm, onClose, confirmDisabled }: {
  open: boolean; title: string; children: ReactNode; confirmLabel: string; onConfirm: () => void; onClose: () => void; confirmDisabled?: boolean;
}) {
  const titleId = useId();
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog ref={ref} onClose={onClose} aria-labelledby={titleId}
      className="m-auto w-[min(92vw,480px)] rounded-panel border border-border bg-surface p-0 text-text-primary">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <h2 id={titleId} className="text-lg font-semibold">{title}</h2>
        <button type="button" onClick={onClose} aria-label="סגירה" className="rounded-input p-2 hover:bg-surface-raised"><X aria-hidden size={18} /></button>
      </div>
      <div className="space-y-4 px-5 py-4">{children}</div>
      <div className="flex justify-start gap-2 border-t border-border px-5 py-3">
        <Button variant="primary" onClick={onConfirm} disabled={confirmDisabled}>{confirmLabel}</Button>
        <Button onClick={onClose}>ביטול</Button>
      </div>
    </dialog>
  );
}

const TOAST_MS = { success: 5000, info: 6000, error: 9000 } as const;
const TOAST_ICON = { success: CheckCircle2, error: ShieldAlert, info: Info };

/** One toast: auto-dismiss that pauses while hovered or focused (WCAG 2.2.1), manual close, Esc to close. */
function ToastItem({ t, onClose }: { t: ToastMsg; onClose: (id: number) => void }) {
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused) return;
    const h = setTimeout(() => onClose(t.id), TOAST_MS[t.kind]);
    return () => clearTimeout(h);
  }, [paused, t.id, t.kind, onClose]);
  const I = TOAST_ICON[t.kind];
  const tone = t.kind === "error" ? "border-danger" : t.kind === "success" ? "border-success" : "border-primary";
  return (
    <div data-testid="toast" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}
      onKeyDown={(e) => { if (e.key === "Escape") { e.stopPropagation(); onClose(t.id); } }}
      className={`pointer-events-auto flex w-full items-start gap-2 rounded-card border bg-surface-raised px-3 py-2.5 text-sm shadow-lg ${tone}`}>
      <I aria-hidden size={18} className={`mt-0.5 shrink-0 ${t.kind === "error" ? "text-danger" : t.kind === "success" ? "text-success" : "text-primary"}`} />
      <p className="min-w-0 flex-1">{t.text}</p>
      <button type="button" onClick={() => onClose(t.id)} aria-label="סגירת הודעה"
        className="-m-1 grid size-9 shrink-0 place-items-center rounded-input hover:bg-surface"><X aria-hidden size={16} /></button>
    </div>
  );
}

/**
 * Toast dock (DESIGN-01-POLISH):
 *  - mobile: docked just above the bottom navigation, never over it;
 *  - tablet: bottom of the viewport (there is no bottom nav);
 *  - desktop: inside the right sidebar column, so it never covers page content.
 * While visible on mobile/tablet the page reserves the dock's height (--toast-h) as bottom padding, and the focused
 * control is scrolled clear of the dock. Two always-mounted live regions: polite (success/info) and assertive (errors).
 */
export function Toasts() {
  const { toasts, dismissToast } = useStore();
  const dock = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = dock.current;
    if (!el) return;
    const sync = () => {
      const docked = !window.matchMedia("(min-width: 1200px)").matches && toasts.length > 0;
      document.documentElement.style.setProperty("--toast-h", docked ? `${el.offsetHeight + 12}px` : "0px");
      if (!docked) return;
      const active = document.activeElement as HTMLElement | null;
      if (!active || active === document.body || el.contains(active) || active.closest("dialog[open]")) return;
      const overlap = active.getBoundingClientRect().bottom - el.getBoundingClientRect().top + 12;
      if (overlap > 0) window.scrollBy({ top: overlap });
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => ro.disconnect();
  }, [toasts.length]);

  const polite = toasts.filter((t) => t.kind !== "error");
  const assertive = toasts.filter((t) => t.kind === "error");
  return (
    <div ref={dock} data-testid="toast-dock"
      className="pointer-events-none fixed inset-x-3 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-50 mx-auto flex max-w-md flex-col gap-2
                 md:bottom-4 desk:inset-x-auto desk:right-3 desk:bottom-4 desk:mx-0 desk:w-[216px]">
      <div role="alert" aria-live="assertive" className="flex flex-col gap-2">
        {assertive.map((t) => <ToastItem key={t.id} t={t} onClose={dismissToast} />)}
      </div>
      <div role="status" aria-live="polite" className="flex flex-col gap-2">
        {polite.map((t) => <ToastItem key={t.id} t={t} onClose={dismissToast} />)}
      </div>
    </div>
  );
}
