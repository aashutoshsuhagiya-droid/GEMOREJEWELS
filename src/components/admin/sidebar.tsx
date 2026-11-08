"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, type ReactNode } from "react";
import { useDialogFocus } from "./use-dialog-focus";

export type AdminNavItem = { label: string; href: string; icon: string };
export type AdminNavGroup = { label: string; items: AdminNavItem[] };

export const adminNavGroups: AdminNavGroup[] = [
  { label: "Overview", items: [{ label: "Dashboard", href: "/admin", icon: "grid" }, { label: "Orders", href: "/admin/orders", icon: "orders" }, { label: "Invoices", href: "/admin/invoices", icon: "invoice" }, { label: "Customers", href: "/admin/customers", icon: "users" }] },
  { label: "Catalog", items: [{ label: "Products", href: "/admin/products", icon: "gem" }, { label: "Collections", href: "/admin/collections", icon: "stack" }, { label: "Inventory", href: "/admin/inventory", icon: "box" }] },
  { label: "Marketing", items: [{ label: "Discounts", href: "/admin/discounts", icon: "tag" }, { label: "Newsletter", href: "/admin/newsletter", icon: "mail" }, { label: "Instagram feed", href: "/admin/instagram", icon: "image" }, { label: "SEO & Analytics", href: "/admin/seo", icon: "chart" }] },
  { label: "Content", items: [{ label: "FAQs", href: "/admin/faqs", icon: "help" }, { label: "Blog", href: "/admin/blog", icon: "pen" }, { label: "Review responses", href: "/admin/reviews", icon: "star" }] },
  { label: "Gemoire extras", items: [{ label: "Craft Tracker", href: "/admin/craft-tracker", icon: "spark" }, { label: "Quiz Builder", href: "/admin/quiz-builder", icon: "quiz" }, { label: "Showroom bookings", href: "/admin/bookings", icon: "calendar" }, { label: "AR try-on", href: "/admin/ar-try-on", icon: "eye" }] },
  { label: "System", items: [{ label: "Reports", href: "/admin/reports", icon: "report" }, { label: "Settings", href: "/admin/settings", icon: "settings" }] }
];

export function AdminSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const panelRef = useRef<HTMLElement>(null);
  useDialogFocus(panelRef, onClose, open);
  return <>
    {open ? <button type="button" aria-label="Close navigation" onClick={onClose} className="fixed inset-0 z-40 bg-black/20 lg:hidden" /> : null}
    <aside ref={panelRef} id="admin-navigation-panel" role={open ? "dialog" : undefined} aria-modal={open || undefined} aria-label={open ? "Admin navigation menu" : undefined} className={`fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r border-[#e3e0dc] bg-white transition-transform duration-300 lg:visible lg:pointer-events-auto lg:w-16 lg:translate-x-0 xl:w-60 ${open ? "visible translate-x-0" : "invisible -translate-x-full pointer-events-none"}`}>
      <div className="flex h-14 shrink-0 items-center border-b border-[#e3e0dc] px-4 lg:justify-center lg:px-0 xl:justify-start xl:px-4">
        <Link href="/admin" onClick={onClose} className="grid leading-none text-[#236339]" aria-label="Gemoire admin dashboard"><span className="font-[family-name:var(--font-cormorant)] text-[22px] font-semibold tracking-[0.02em] lg:text-xl xl:text-[22px]">GEMOIRE</span><span className="mt-0.5 text-[7px] font-medium tracking-[0.24em] lg:hidden xl:block">JEWELS LLP</span></Link>
        <button type="button" data-autofocus onClick={onClose} className="ml-auto rounded p-1 text-[#737373] hover:bg-[#faf6ef] lg:hidden" aria-label="Close menu">×</button>
      </div>
      <nav className="min-h-0 flex-1 overflow-y-auto px-2 py-3 xl:px-3" aria-label="Admin navigation">
        {adminNavGroups.map((group) => <div key={group.label} className="mb-4 last:mb-0"><p className="mb-1 px-2 text-[9px] font-semibold uppercase tracking-[0.13em] text-[#a09c97] lg:hidden xl:block">{group.label}</p><div className="grid gap-0.5">{group.items.map((item) => {
          const active = item.href === "/admin" ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return <Link key={item.href} href={item.href} title={item.label} onClick={onClose} className={`relative flex min-h-9 items-center gap-2 rounded-r px-2 text-xs transition before:absolute before:bottom-1 before:left-0 before:top-1 before:w-[3px] before:rounded-r ${active ? "bg-[#f3f8f4] font-medium text-[#236339] before:bg-[#236339]" : "text-[#5f5a55] hover:bg-[#faf6ef] hover:text-[#253e2b] before:bg-transparent"}`}><AdminIcon name={item.icon} /><span className="lg:hidden xl:inline">{item.label}</span></Link>;
        })}</div></div>)}
      </nav>
      <div className="border-t border-[#e3e0dc] p-3 lg:p-2 xl:p-3"><div className="rounded-md bg-[#faf6ef] px-2 py-2 text-[10px] leading-4 text-[#737373] lg:hidden xl:block"><strong className="block font-medium text-[#253e2b]">Shortcuts</strong><span>⌘K or / search · Esc close</span></div><span className="hidden text-center text-sm text-[#737373] lg:block xl:hidden" title="Shortcuts">⌘</span></div>
    </aside>
  </>;
}

export function AdminIcon({ name, className = "" }: { name: string; className?: string }) {
  const common = `h-4 w-4 shrink-0 stroke-current ${className}`;
  const paths: Record<string, ReactNode> = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
    orders: <><path d="M5 4h14v16H5z"/><path d="M8 8h8M8 12h8M8 16h5"/></>,
    invoice: <><path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/></>,
    users: <><circle cx="9" cy="8" r="3"/><path d="M3 20c.7-3.1 2.7-5 6-5s5.3 1.9 6 5M17 10c2.2.1 3.6 1.4 4 3.5M17 15c2.1.5 3.4 2 4 4"/></>,
    gem: <path d="m12 3 8 7-8 11L4 10zM4 10h16M9 3l3 7 3-7"/>,
    stack: <><path d="m12 3 9 5-9 5-9-5z"/><path d="m3 12 9 5 9-5M3 16l9 5 9-5"/></>,
    box: <><path d="m3 7 9-4 9 4v10l-9 4-9-4z"/><path d="m3 7 9 4 9-4M12 11v10"/></>,
    tag: <><path d="M3 12V5h7l9 9-7 7z"/><circle cx="7.5" cy="8.5" r="1"/></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="1"/><path d="m3 7 9 6 9-6"/></>,
    image: <><rect x="3" y="4" width="18" height="16" rx="1"/><circle cx="8" cy="9" r="1.5"/><path d="m4 18 5-5 3 3 3-3 5 5"/></>,
    chart: <><path d="M4 20V4M4 20h17"/><path d="m7 16 4-5 3 2 5-7"/></>,
    help: <><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 4.1 1.9c-1.1.9-1.6 1.4-1.6 3.1M12 17h.01"/></>,
    pen: <><path d="m4 20 4-1 11-11-3-3L5 16z"/><path d="m14 6 3 3"/></>,
    star: <path d="m12 3 2.8 5.6 6.2.9-4.5 4.4 1.1 6.2-5.6-2.9-5.6 2.9 1.1-6.2L3 9.5l6.2-.9z"/>,
    spark: <path d="m12 2 1.6 6.4L20 10l-6.4 1.6L12 18l-1.6-6.4L4 10l6.4-1.6zM19 17l.6 2.4L22 20l-2.4.6L19 23l-.6-2.4L16 20l2.4-.6z"/>,
    quiz: <><rect x="4" y="3" width="16" height="18" rx="1"/><path d="M8 8h8M8 12h5M8 16h7"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="1"/><path d="M7 3v4M17 3v4M3 10h18"/></>,
    eye: <><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z"/><circle cx="12" cy="12" r="2.5"/></>,
    report: <><path d="M5 20V10M10 20V4M15 20v-7M20 20V7"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1-2.2 2.2-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5v.2h-3.1v-.2a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1-2.2-2.2.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H5.2v-3.1h.2a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1 2.2-2.2.1.1a1.6 1.6 0 0 0 1.8.3 1.6 1.6 0 0 0 1-1.5v-.2h3.1v.2a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1 2.2 2.2-.1.1a1.6 1.6 0 0 0-.3 1.8 1.6 1.6 0 0 0 1.5 1h.2v3.1h-.2a1.6 1.6 0 0 0-1.5 1Z"/></>
  };
  return <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" className={common} aria-hidden="true">{paths[name] ?? paths.grid}</svg>;
}
