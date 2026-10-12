import { Suspense } from "react";
import { LoadingSkeleton } from "@/components/ui";
import { openLeadValueFor } from "@/lib/server/dto";
import { currentRole } from "@/lib/server/session";
import DashboardView from "./view";

export const metadata = { title: "לוח מנהל · Yuval Control" };

export default async function Page() {
  // The financial KPI is computed on the server and omitted entirely for limited roles.
  const openLeadValue = openLeadValueFor(await currentRole());
  return <Suspense fallback={<LoadingSkeleton label="טוען…" />}><DashboardView openLeadValue={openLeadValue} /></Suspense>;
}
