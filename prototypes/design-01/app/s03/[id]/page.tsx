import { notFound } from "next/navigation";
import { Suspense } from "react";
import { LoadingSkeleton } from "@/components/ui";
import { cardFor } from "@/lib/server/dto";
import { currentRole } from "@/lib/server/session";
import CardView from "./view";

export const metadata = { title: "כרטיס לקוח · Yuval Control" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // Server-side DTO: deputy/sales receive no `confidential` key at all (contract §6).
  const card = cardFor(id, await currentRole());
  if (!card) notFound();
  return <Suspense fallback={<LoadingSkeleton label="טוען…" />}><CardView key={card.id} card={card} /></Suspense>;
}
