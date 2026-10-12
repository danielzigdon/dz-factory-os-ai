import "server-only";
import { CARDS } from "../fixtures";
import type { CardDTO, Role } from "../types";
import { can } from "../permissions";
import { CONFIDENTIAL, OPEN_LEAD_VALUE_ESTIMATE } from "./confidential";

/** Server-side DTO: limited roles get an object WITHOUT the confidential key (not hidden with CSS). */
export function cardFor(id: string, role: Role): CardDTO | null {
  const card = CARDS[id];
  if (!card) return null;
  if (!can(role, "financial:read") || !CONFIDENTIAL[id]) return { ...card };
  return { ...card, confidential: CONFIDENTIAL[id] };
}

export function openLeadValueFor(role: Role): number | undefined {
  return can(role, "financial:read") ? OPEN_LEAD_VALUE_ESTIMATE : undefined;
}
