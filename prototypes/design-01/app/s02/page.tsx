import { Suspense } from "react";
import { LoadingSkeleton } from "@/components/ui";
import InquiriesView from "./view";

export const metadata = { title: "מרכז פניות · Yuval Control" };

export default function Page() {
  return <Suspense fallback={<LoadingSkeleton label="טוען…" />}><InquiriesView /></Suspense>;
}
