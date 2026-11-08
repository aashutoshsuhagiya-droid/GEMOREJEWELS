"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type Toast = { id: number; tone: "success" | "error"; message: string };
type AdminClientContext = { toasts: Toast[]; toast: (message: string, tone?: Toast["tone"]) => void; request: <T>(resource: string, init?: RequestInit) => Promise<T>; };
const AdminClientContext = createContext<AdminClientContext | null>(null);

export function AdminClientProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toast = useCallback((message: string, tone: Toast["tone"] = "success") => { const entry = { id: Date.now() + Math.round(Math.random() * 999), tone, message }; setToasts(current => [...current, entry]); window.setTimeout(() => setToasts(current => current.filter(item => item.id !== entry.id)), 4000); }, []);
  const request = useCallback(async <T,>(resource: string, init: RequestInit = {}) => { const response = await fetch(`/api/admin/${resource}`, { ...init, headers: { "Content-Type": "application/json", ...init.headers } }); const result = await response.json(); if (!response.ok) throw new Error(result.error || "Admin request failed"); return result as T; }, []);
  const value = useMemo(() => ({ toasts, toast, request }), [toasts, toast, request]);
  return <AdminClientContext.Provider value={value}>{children}<div className="admin-toasts" aria-live="polite">{toasts.map(item => <div className={`admin-toast ${item.tone}`} key={item.id}><span>{item.tone === "success" ? "✓" : "!"}</span>{item.message}</div>)}</div></AdminClientContext.Provider>;
}
export function useAdminClient() { const context = useContext(AdminClientContext); if (!context) throw new Error("useAdminClient must be used inside AdminClientProvider"); return context; }
export function useAdminShortcut(callback: () => void) { useEffect(() => { const handler = (event: KeyboardEvent) => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); callback(); } }; window.addEventListener("keydown", handler); return () => window.removeEventListener("keydown", handler); }, [callback]); }
