import "server-only";
// Manager-only financial fixtures. This module can only be imported by server code,
// so these values never ship in the client bundle (contract §6, A-02).
import type { Confidential } from "../types";

export const CONFIDENTIAL: Record<string, Confidential> = {
  "C-101": { estimatedCost: 11240, marginPct: 31.4, supplierPowderPricePerKg: 38.5 },
  "C-102": { estimatedCost: 0, marginPct: 0, supplierPowderPricePerKg: 41.2 },
};

/** Estimated value of open leads (ILS). Manager-only KPI. */
export const OPEN_LEAD_VALUE_ESTIMATE = 126500;
