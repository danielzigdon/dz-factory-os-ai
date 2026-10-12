import "server-only";
import { cookies } from "next/headers";
import type { Role } from "../types";

// Mock session: the role comes from a demo cookie. Real auth (Better Auth, A-02) is Sprint 1, not DESIGN-01.
export async function currentRole(): Promise<Role> {
  const v = (await cookies()).get("yc_role")?.value;
  return v === "deputy" || v === "sales" ? v : "manager";
}
