"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type AdminToastTone = "success" | "error" | "info";

export type AdminToast = {
  id: number;
  message: string;
  tone: AdminToastTone;
};

type ToastContextValue = {
  notify: (message: string, tone?: AdminToastTone) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function AdminToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<AdminToast[]>([]);

  const notify = (message: string, tone: AdminToastTone = "success") => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((current) => [...current, { id, message, tone }]);
  };

  const dismiss = (id: number) => setToasts((current) => current.filter((toast) => toast.id !== id));
  const value = useMemo(() => ({ notify }), []);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div aria-live="polite" aria-relevant="additions" className="pointer-events-none fixed right-4 top-4 z-[90] grid w-[min(360px,calc(100vw-2rem))] gap-2">
        {toasts.map((toast) => <ToastCard key={toast.id} toast={toast} onDismiss={dismiss} />)}
      </div>
    </ToastContext.Provider>
  );
}

function ToastCard({ toast, onDismiss }: { toast: AdminToast; onDismiss: (id: number) => void }) {
  useEffect(() => {
    const timeout = window.setTimeout(() => onDismiss(toast.id), 4000);
    return () => window.clearTimeout(timeout);
  }, [onDismiss, toast.id]);

  const visual = toast.tone === "error"
    ? { icon: "!", classes: "border-red-200 bg-red-50 text-red-800" }
    : toast.tone === "info"
      ? { icon: "i", classes: "border-[#d4d0cc] bg-white text-[#253e2b]" }
      : { icon: "✓", classes: "border-[#bad9c3] bg-[#edf7ef] text-[#1b5730]" };

  return (
    <div role="status" className={`pointer-events-auto flex items-start gap-3 rounded-md border px-3 py-3 text-sm shadow-lg ${visual.classes}`}>
      <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-current/10 text-xs font-bold">{visual.icon}</span>
      <p className="flex-1 leading-5">{toast.message}</p>
      <button type="button" onClick={() => onDismiss(toast.id)} className="-mr-1 -mt-1 rounded p-1 text-current/65 hover:bg-black/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#236339]" aria-label="Dismiss notification">×</button>
    </div>
  );
}

export function useAdminToast() {
  const value = useContext(ToastContext);
  if (!value) throw new Error("useAdminToast must be used inside AdminToastProvider");
  return value;
}
