import type { Role } from "./types";

// Mirrors A-07: the deputy can assign leads but never sees cost, margin or supplier prices.
const MATRIX: Record<Role, ReadonlySet<string>> = {
  manager: new Set(["leads:assign", "leads:bulk_assign", "financial:read", "availability:write"]),
  deputy: new Set(["leads:assign", "leads:bulk_assign"]),
  sales: new Set([]),
};

export type Permission = "leads:assign" | "leads:bulk_assign" | "financial:read" | "availability:write";
export const can = (role: Role, p: Permission) => MATRIX[role].has(p);

export const ROLE_LABEL: Record<Role, string> = { manager: "מנהל/ת", deputy: "ממלא/ת מקום", sales: "מכירות" };
