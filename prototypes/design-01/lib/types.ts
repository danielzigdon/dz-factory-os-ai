// Mock-only domain types for the DESIGN-01 prototype. Mirrors docs/03-data-model.md naming where it applies.

export type Role = "manager" | "deputy" | "sales";
export type LeadStatus = "NEW" | "TRIAGE" | "ASSIGNED" | "CONTACTED" | "QUALIFIED" | "DISQUALIFIED";
export type Urgency = "urgent" | "normal" | "low";
export type Source = "website" | "email" | "whatsapp" | "phone";
export type DuplicateRule = "business_id" | "phone" | "email";

export interface User {
  id: string;
  name: string;
  role: Role;
  available: boolean;
}

export interface Duplicate {
  rule: DuplicateRule;
  withId: string;
  withName: string;
}

export interface Lead {
  id: string;
  company: string;
  contactName: string;
  phone: string; // E.164
  email: string;
  businessId: string | null;
  source: Source;
  receivedAt: string; // ISO
  urgency: Urgency;
  status: LeadStatus;
  ownerId: string | null;
  nextTask: { title: string; dueAt: string } | null;
  customerId: string | null;
  duplicate: Duplicate | null;
}

export interface Contact {
  name: string;
  role: string;
  phone: string;
  email: string;
}

export interface Activity {
  id: string;
  at: string;
  kind: "note" | "call" | "email" | "system";
  text: string;
  by: string;
}

export interface Task {
  id: string;
  title: string;
  dueAt: string;
  done: boolean;
  ownerId: string;
}

export interface QuoteSummary {
  id: string;
  title: string;
  status: "DRAFT" | "REVIEW" | "APPROVED_INTERNAL" | "SENT";
  version: number;
  total: number; // ILS, before VAT — visible to all roles with quote access
}

export interface FileRef {
  id: string;
  name: string;
  size: string;
}

/** Fields only the manager may receive (A-02, A-07). Never sent to deputy/sales. */
export interface Confidential {
  estimatedCost: number;
  marginPct: number;
  supplierPowderPricePerKg: number;
}

export interface Card {
  id: string;
  kind: "customer" | "lead";
  name: string;
  status: string;
  ownerId: string | null;
  lastContactAt: string;
  businessId: string | null;
  source: Source;
  contacts: Contact[];
  activities: Activity[];
  tasks: Task[];
  quotes: QuoteSummary[];
  files: FileRef[];
}

/** What the server hands to the client. `confidential` is absent — not null, absent — for limited roles. */
export type CardDTO = Card & { confidential?: Confidential };
