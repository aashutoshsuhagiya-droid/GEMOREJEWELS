"use client";

import type { ReactNode } from "react";

export type NoticeKind = "success" | "error";

export function AdminButton({
  children,
  onClick,
  type = "button",
  tone = "primary",
  disabled = false,
  className = ""
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  tone?: "primary" | "secondary" | "danger" | "quiet";
  disabled?: boolean;
  className?: string;
}) {
  const tones = {
    primary: "bg-forest text-white hover:bg-[#1b4f2e]",
    secondary: "border border-[#d4d0cc] bg-white text-[#253e2b] hover:border-forest",
    danger: "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100",
    quiet: "text-[#236339] hover:bg-[#eef5ef]"
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex min-h-9 items-center justify-center rounded-full px-4 text-xs font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest disabled:cursor-not-allowed disabled:opacity-15 ${tones[tone]} ${className}`}
    >
      {children}
    </button>
  );
}

export function AdminField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  hint,
  required = false,
  textarea = false,
  maxLength
}: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  hint?: string;
  required?: boolean;
  textarea?: boolean;
  maxLength?: number;
}) {
  const classes = "mt-1 w-full rounded-md border border-[#d4d0cc] bg-white px-3 py-2 text-sm text-[#232323] outline-none placeholder:text-[#a09c97] focus:border-forest focus:ring-2 focus:ring-forest/20";
  return (
    <label className="block text-xs font-medium text-[#253e2b]">
      {label}{required ? <span className="ml-1 text-red-600">*</span> : null}
      {textarea ? (
        <textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} maxLength={maxLength} className={`${classes} min-h-24 resize-y`} />
      ) : (
        <input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} maxLength={maxLength} className={classes} />
      )}
      {hint ? <span className="mt-1 block text-[11px] font-normal text-[#737373]">{hint}</span> : null}
    </label>
  );
}

export function AdminSelect({
  label,
  value,
  onChange,
  options
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="block text-xs font-medium text-[#253e2b]">
      {label}
      <select value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 w-full rounded-md border border-[#d4d0cc] bg-white px-3 py-2 text-sm outline-none focus:border-forest focus:ring-2 focus:ring-forest/20">
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
  );
}

export function AdminCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-md border border-[#e3e0dc] bg-white ${className}`}>{children}</section>;
}

export function StatusPill({ children, tone = "neutral" }: { children: ReactNode; tone?: "green" | "gold" | "red" | "neutral" | "blue" }) {
  const tones = {
    green: "bg-[#eaf5ee] text-[#236339]",
    gold: "bg-[#f8f1df] text-[#80631c]",
    red: "bg-red-50 text-red-700",
    blue: "bg-blue-50 text-blue-700",
    neutral: "bg-[#f3f1ee] text-[#5e5a56]"
  };
  return <span className={`inline-flex rounded-full px-2 py-1 text-[10px] font-medium ${tones[tone]}`}>{children}</span>;
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return <div className="px-6 py-16 text-center"><h3 className="font-serif text-2xl text-[#253e2b]">{title}</h3><p className="mx-auto mt-2 max-w-sm text-sm text-[#737373]">{body}</p>{action ? <div className="mt-5">{action}</div> : null}</div>;
}

export function Drawer({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  return <div className="fixed inset-0 z-50 bg-black/20" role="presentation" onMouseDown={onClose}>
    <aside role="dialog" aria-modal="true" aria-label={title} onMouseDown={(event) => event.stopPropagation()} className="absolute bottom-0 right-0 top-0 flex w-full max-w-[560px] flex-col border-l border-[#d4d0cc] bg-white shadow-2xl animate-[slide-in_.3s_ease-out]">
      <div className="flex items-center justify-between border-b border-[#e3e0dc] px-6 py-4"><h2 className="font-serif text-2xl text-[#253e2b]">{title}</h2><AdminButton tone="quiet" onClick={onClose} className="!min-h-8 !px-2">Close</AdminButton></div>
      <div className="min-h-0 flex-1 overflow-y-auto p-6">{children}</div>
    </aside>
  </div>;
}

export function Toast({ notice }: { notice: { message: string; kind: NoticeKind } | null }) {
  if (!notice) return null;
  return <div role="status" className={`fixed right-5 top-5 z-[60] rounded-md px-4 py-3 text-sm shadow-lg ${notice.kind === "error" ? "bg-red-600 text-white" : "bg-[#236339] text-white"}`}>{notice.kind === "success" ? "✓ " : "! "}{notice.message}</div>;
}

export function downloadCsv(filename: string, headers: string[], rows: Array<Array<string | number>>) {
  const escape = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`;
  const data = [headers, ...rows].map((row) => row.map(escape).join(",")).join("\n");
  const blob = new Blob([data], { type: "text/csv;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}
