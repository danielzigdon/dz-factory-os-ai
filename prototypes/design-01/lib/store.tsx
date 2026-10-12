"use client";
// Mock client state for the prototype (local only — nothing is persisted or sent anywhere).
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { LEADS, USERS } from "./fixtures";
import type { Lead, Role, User } from "./types";

export interface ToastMsg { id: number; kind: "success" | "error" | "info"; text: string }

interface Store {
  role: Role;
  setRole: (r: Role) => void;
  leads: Lead[];
  users: User[];
  assign: (leadIds: string[], ownerId: string) => void;
  addLead: (lead: Lead) => void;
  toggleAvailability: (userId: string) => void;
  toasts: ToastMsg[];
  toast: (kind: ToastMsg["kind"], text: string) => void;
  dismissToast: (id: number) => void;
}

const Ctx = createContext<Store | null>(null);
let toastSeq = 0;

export function StoreProvider({ initialRole, children }: { initialRole: Role; children: ReactNode }) {
  const [role, setRoleState] = useState<Role>(initialRole);
  const [leads, setLeads] = useState<Lead[]>(LEADS);
  const [users, setUsers] = useState<User[]>(USERS);
  const [toasts, setToasts] = useState<ToastMsg[]>([]);

  const dismissToast = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const toast = useCallback((kind: ToastMsg["kind"], text: string) => {
    const id = ++toastSeq;
    setToasts((t) => [...t.slice(-2), { id, kind, text }]);
    setTimeout(() => dismissToast(id), 5000);
  }, [dismissToast]);

  const setRole = useCallback((r: Role) => {
    // Demo cookie read by the server to build role-specific DTOs.
    document.cookie = `yc_role=${r}; path=/; samesite=lax`;
    setRoleState(r);
  }, []);

  const assign = useCallback((ids: string[], ownerId: string) => {
    setLeads((ls) => ls.map((l) => (ids.includes(l.id) ? { ...l, ownerId, status: l.status === "NEW" || l.status === "TRIAGE" ? "ASSIGNED" : l.status } : l)));
  }, []);
  const addLead = useCallback((lead: Lead) => setLeads((ls) => [lead, ...ls]), []);
  const toggleAvailability = useCallback((id: string) => setUsers((us) => us.map((u) => (u.id === id ? { ...u, available: !u.available } : u))), []);

  const value = useMemo(
    () => ({ role, setRole, leads, users, assign, addLead, toggleAvailability, toasts, toast, dismissToast }),
    [role, setRole, leads, users, assign, addLead, toggleAvailability, toasts, toast, dismissToast],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore outside StoreProvider");
  return s;
}
