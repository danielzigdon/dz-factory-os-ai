"use client";
import { UserPlus } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { FilterBar, LeadCards, LeadTable, NoResults, useAssign, useLeadFilters, type QuickFilter } from "@/components/leads";
import { NewLeadButton } from "@/components/new-lead";
import { Button, EmptyState, ErrorState, LoadingSkeleton } from "@/components/ui";
import { useStore } from "@/lib/store";

export default function InquiriesView() {
  const params = useSearchParams();
  const state = params.get("state");
  const { leads, role } = useStore();
  const f = useLeadFilters(state === "empty" ? [] : leads, { q: params.get("q") ?? "", quick: (params.get("filter") as QuickFilter) || null });
  const { start, dialog, allowed } = useAssign();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-bold desk:text-[26px]">מרכז פניות</h1>
          <p className="text-sm text-text-secondary">תיבה מרכזית לקליטה ושיוך של כל הפניות</p>
        </div>
        <NewLeadButton />
      </div>

      {state === "error" ? <ErrorState text="שירות הפניות אינו זמין כרגע (הדמיית שגיאה)." retryHref="/s02" /> : (
        <>
          <FilterBar f={f} count={f.rows.length} />
          <div className="flex flex-wrap items-center gap-2" aria-live="polite">
            {allowed ? (
              selected.size > 0 && (
                <>
                  <span className="text-sm">{selected.size} נבחרו</span>
                  <Button onClick={() => start([...selected])}><UserPlus aria-hidden size={16} /> שיוך מרוכז</Button>
                  <Button variant="ghost" onClick={() => setSelected(new Set())}>ביטול בחירה</Button>
                </>
              )
            ) : (
              <p className="text-sm text-text-secondary">שיוך פניות זמין למנהל/ת ולממלא/ת מקום בלבד (תפקיד נוכחי: {role === "sales" ? "מכירות" : role}).</p>
            )}
          </div>
          {state === "loading" ? <LoadingSkeleton rows={6} label="טוען פניות…" />
            : state === "empty" ? <EmptyState title="אין פניות בתיבה" text="כל הפניות טופלו. פניות חדשות יופיעו כאן אוטומטית." />
            : f.rows.length === 0 ? <NoResults onReset={f.reset} />
            : <>
                <LeadTable f={f} onAssign={(ids) => { start(ids); }} selected={selected} setSelected={setSelected} allowed={allowed} />
                <LeadCards rows={f.rows} onAssign={start} />
              </>}
        </>
      )}
      {dialog}
    </div>
  );
}
