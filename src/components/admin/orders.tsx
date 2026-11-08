"use client";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { Order, OrderStatus } from "@/shared/admin-types";
import { AdminDataTable, AdminPagination, downloadAdminCsv, type AdminTableColumn } from "./data-table";
import { formatAdminAud, formatAdminDate, formatAdminUsd, productLabel, useAdminOperations } from "./shell";
import { useAdminToast } from "./toast";
const statusFilters: Array<"All" | OrderStatus> = ["All", "Pending", "Processing", "Crafting", "Shipped", "Delivered", "Cancelled"];
export function StatusBadge({ status }: {
    status: OrderStatus | "Paid" | "Refunded" | "Pending" | "due" | "paid" | "refunded" | "credit-note";
}) {
    const normalized = status.toLowerCase();
    const styles = normalized === "processing" || normalized === "paid" ? "bg-[#eaf5ee] text-[#236339]" : normalized === "shipped" || normalized === "delivered" || normalized === "crafting" ? "bg-[#f8f1df] text-[#80631c]" : normalized === "cancelled" || normalized === "refunded" ? "bg-red-50 text-[#b42318]" : normalized === "pending" || normalized === "due" ? "bg-[#eef2f6] text-[#526677]" : "bg-[#f3f1ee] text-[#5e5a56]";
    return <span className={`inline-flex whitespace-nowrap rounded-full px-2 py-1 text-[10px] font-medium ${styles}`}>{status}</span>;
}
export function AdminDrawer({ title, children, onClose, footer }: {
    title: string;
    children: ReactNode;
    onClose: () => void;
    footer?: ReactNode;
}) {
    const drawerRef = useRef<HTMLElement>(null);
    const onCloseRef = useRef(onClose);
    onCloseRef.current = onClose;
    useEffect(() => {
        const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        drawerRef.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus();
        const keyboard = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                event.preventDefault();
                onCloseRef.current();
                return;
            }
            if (event.key !== "Tab" || !drawerRef.current)
                return;
            const focusable = [...drawerRef.current.querySelectorAll<HTMLElement>('button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])')].filter(element => !element.hasAttribute("hidden"));
            if (!focusable.length)
                return;
            const first = focusable[0];
            const last = focusable.at(-1)!;
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            }
            else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        };
        window.addEventListener("keydown", keyboard);
        return () => { window.removeEventListener("keydown", keyboard); document.body.style.overflow = previousOverflow; previousFocus?.focus(); };
    }, []);
    return <div className="fixed inset-0 z-[70] bg-black/25" role="presentation" onMouseDown={onClose}><style>{`@keyframes admin-drawer-in{from{transform:translateX(100%)}to{transform:translateX(0)}}`}</style><aside ref={drawerRef} role="dialog" aria-modal="true" aria-label={title} onMouseDown={(event) => event.stopPropagation()} style={{ animation: "admin-drawer-in 300ms ease-out" }} className="absolute bottom-0 right-0 top-0 flex w-full max-w-[560px] flex-col border-l border-[#d4d0cc] bg-white shadow-2xl"><div className="flex min-h-14 items-center justify-between border-b border-[#e3e0dc] px-5"><h2 className="font-[family-name:var(--font-cormorant)] text-2xl text-[#253e2b]">{title}</h2><button data-autofocus type="button" onClick={onClose} className="rounded p-2 text-[#737373] hover:bg-[#faf6ef] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#236339]" aria-label="Close drawer">×</button></div><div className="min-h-0 flex-1 overflow-y-auto p-5">{children}</div>{footer ? <div className="border-t border-[#e3e0dc] p-4">{footer}</div> : null}</aside></div>;
}
export function EmptyAdminState({ title, body, action }: {
    title: string;
    body: string;
    action?: ReactNode;
}) {
    return <div className="px-6 py-16 text-center"><h3 className="font-[family-name:var(--font-cormorant)] text-3xl text-[#253e2b]">{title}</h3><p className="mx-auto mt-2 max-w-sm text-sm text-[#737373]">{body}</p>{action ? <div className="mt-5">{action}</div> : null}</div>;
}
export function OrdersPanel() {
    const { orders, getCustomer } = useAdminOperations();
    const { notify: toast } = useAdminToast();
    const notify = (message: string, tone?: "success" | "error" | "info") => {
        if (message.startsWith("New-order drafting")) {
            window.open("/checkout", "_blank", "noopener,noreferrer");
            toast("Storefront checkout opened for the new order.", "info");
            return;
        }
        if (message.startsWith("Selected orders archived"))
            setArchivedIds(current => [...new Set([...current, ...selectedIds])]);
        toast(message, tone);
    };
    const [query, setQuery] = useState("");
    const [status, setStatus] = useState<"All" | OrderStatus>("All");
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [archivedIds, setArchivedIds] = useState<string[]>([]);
    const [activeOrder, setActiveOrder] = useState<Order | null>(null);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const filtered = useMemo(() => orders.filter((order) => {
        const customer = getCustomer(order.customerId);
        const haystack = `${order.code} ${customer?.name ?? ""} ${customer?.email ?? ""}`.toLowerCase();
        return !archivedIds.includes(order.id) && (!query || haystack.includes(query.toLowerCase())) && (status === "All" || order.status === status);
    }).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)), [archivedIds, orders, query, status, getCustomer]);
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    useEffect(() => {
        if (page > totalPages)
            setPage(totalPages);
    }, [page, totalPages]);
    const rows = filtered.slice((page - 1) * pageSize, page * pageSize);
    const exportOrders = (records = filtered) => { downloadAdminCsv("gemoire-orders.csv", ["Order", "Customer", "Email", "Date", "Items", "Total AUD", "Total USD", "Status", "Payment"], records.map((order) => { const customer = getCustomer(order.customerId); return [order.code, customer?.name ?? "Unknown", customer?.email ?? "", formatAdminDate(order.createdAt), order.items.reduce((sum, item) => sum + item.qty, 0), order.totalAud, order.totalUsd, order.status, order.paymentStatus]; })); notify(`${records.length} order${records.length === 1 ? "" : "s"} exported as CSV.`); };
    const columns: AdminTableColumn<Order>[] = [
        { id: "order", label: "Order #", className: "min-w-[130px]", render: (order) => <span className="font-mono text-xs font-medium text-[#253e2b]">{order.code}</span> },
        { id: "customer", label: "Customer", className: "min-w-[190px]", render: (order) => { const customer = getCustomer(order.customerId); return <span className="grid"><strong className="text-xs font-medium text-[#253e2b]">{customer?.name ?? "Unknown customer"}</strong><span className="text-[11px] text-[#737373]">{customer?.email}</span></span>; } },
        { id: "date", label: "Date", className: "whitespace-nowrap", render: (order) => <span className="text-xs text-[#5f5a55]">{formatAdminDate(order.createdAt, { day: "numeric", month: "short" })}</span> },
        { id: "items", label: "Items", className: "text-center", render: (order) => <span className="text-xs text-[#5f5a55]">{order.items.reduce((sum, item) => sum + item.qty, 0)}</span> },
        { id: "total", label: "Total", className: "min-w-[120px]", render: (order) => <span className="grid"><strong className="text-xs font-medium text-[#253e2b]">{formatAdminAud(order.totalAud)}</strong><span className="text-[11px] text-[#737373]">{formatAdminUsd(order.totalUsd)}</span></span> },
        { id: "status", label: "Status", render: (order) => <StatusBadge status={order.status}/> },
        { id: "payment", label: "Payment", render: (order) => <StatusBadge status={order.paymentStatus}/> },
        { id: "actions", label: "", render: (order) => <div className="flex items-center gap-1" onClick={(event) => event.stopPropagation()}><button type="button" onClick={() => setActiveOrder(order)} className="rounded px-2 py-1 text-[11px] font-medium text-[#236339] hover:bg-[#edf7ef]">View</button><button type="button" onClick={() => { setActiveOrder(order); window.setTimeout(() => window.print(), 100); notify(`Print dialogue opened for ${order.code}.`, "info"); }} className="rounded px-2 py-1 text-[11px] text-[#5f5a55] hover:bg-[#faf6ef]">Print</button></div> }
    ];
    return <section className="mx-auto max-w-[1500px]"><PageHeading eyebrow="Sales" title="Orders" description="Track each piece from payment to dispatch." action={<button type="button" onClick={() => notify("New-order drafting is available from the storefront checkout.", "info")} className="rounded-full bg-[#236339] px-4 py-2 text-xs font-medium text-white hover:bg-[#1b4f2e]">New order</button>}/><div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-center"><label className="relative min-w-0 flex-1 xl:max-w-sm"><span className="sr-only">Search orders</span><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Search order, customer, email…" className="h-10 w-full rounded-md border border-[#d4d0cc] bg-white pl-9 pr-3 text-sm outline-none focus:border-[#236339] focus:ring-2 focus:ring-[#236339]/15"/><svg viewBox="0 0 24 24" fill="none" className="absolute left-3 top-3 h-4 w-4 stroke-[#737373]" strokeWidth="1.8"><circle cx="11" cy="11" r="6"/><path d="m16 16 4 4"/></svg></label><div className="flex max-w-full gap-1 overflow-x-auto pb-1">{statusFilters.map((item) => { const count = item === "All" ? orders.length : orders.filter((order) => order.status === item).length; return <button type="button" key={item} onClick={() => { setStatus(item); setPage(1); }} className={`whitespace-nowrap rounded-full px-3 py-2 text-xs ${status === item ? "bg-[#236339] text-white" : "border border-[#d4d0cc] bg-white text-[#5f5a55] hover:border-[#236339]"}`}>{item} <span className="ml-1 opacity-75">{count}</span></button>; })}</div></div>{selectedIds.length ? <div className="mb-3 flex flex-wrap items-center gap-2 rounded-md border border-[#cfe2d3] bg-[#edf7ef] px-3 py-2 text-xs text-[#253e2b]"><strong>{selectedIds.length} selected</strong><button type="button" onClick={() => exportOrders(filtered.filter((order) => selectedIds.includes(order.id)))} className="rounded-full bg-white px-3 py-1.5 text-[#236339] shadow-sm">Export CSV</button><button type="button" onClick={() => { setSelectedIds([]); notify("Selected orders archived from this demo view."); }} className="rounded-full bg-white px-3 py-1.5 text-[#253e2b] shadow-sm">Archive</button><span className="ml-auto text-[#737373]">Orders cannot be deleted.</span></div> : null}<AdminDataTable columns={columns} rows={rows} selectedIds={selectedIds} onSelectionChange={setSelectedIds} onRowClick={setActiveOrder} rowLabel="order" empty={<EmptyAdminState title="No orders yet" body="Try clearing a search or status filter to see your order history."/>}/><AdminPagination page={page} totalPages={totalPages} onPageChange={setPage} total={filtered.length} pageSize={pageSize} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}/>{activeOrder ? <OrderDrawer order={orders.find((order) => order.id === activeOrder.id) ?? activeOrder} onClose={() => setActiveOrder(null)}/> : null}</section>;
}
export function PageHeading({ eyebrow, title, description, action }: {
    eyebrow?: string;
    title: string;
    description?: string;
    action?: ReactNode;
}) {
    return <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div>{eyebrow ? <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.13em] text-[#c09e55]">{eyebrow}</p> : null}<h1 className="font-[family-name:var(--font-cormorant)] text-4xl leading-none text-[#253e2b]">{title}</h1>{description ? <p className="mt-2 text-sm text-[#737373]">{description}</p> : null}</div>{action ? <div className="shrink-0">{action}</div> : null}</div>;
}
export function OrderDrawer({ order, onClose }: {
    order: Order;
    onClose: () => void;
}) {
    const { getCustomer, invoices, markOrderPaid, markShipped } = useAdminOperations();
    const { notify } = useAdminToast();
    const router = useRouter();
    const customer = getCustomer(order.customerId);
    const invoice = invoices.find((item) => item.orderId === order.id);
    const onPaid = () => { const created = markOrderPaid(order.id); notify(created ? `${created.number} was created and payment is marked paid.` : "Order payment is already recorded."); };
    const onShipped = () => { const tracking = markShipped(order.id); if (tracking)
        notify(`${order.code} is now shipped. Tracking: ${tracking}`); };
    return <AdminDrawer title={order.code} onClose={onClose} footer={<div className="flex justify-end gap-2"><button type="button" onClick={onClose} className="rounded-full border border-[#d4d0cc] px-4 py-2 text-xs text-[#5f5a55]">Close</button>{order.paymentStatus !== "Paid" && order.paymentStatus !== "Refunded" ? <button type="button" onClick={onPaid} className="rounded-full bg-[#236339] px-4 py-2 text-xs font-medium text-white">Simulate payment</button> : order.status === "Processing" || order.status === "Crafting" ? <button type="button" onClick={onShipped} className="rounded-full bg-[#236339] px-4 py-2 text-xs font-medium text-white">Mark as shipped</button> : null}</div>}><div className="flex items-start justify-between gap-3"><div><p className="text-xs text-[#737373]">Placed {formatAdminDate(order.createdAt)}</p><div className="mt-2 flex flex-wrap gap-2"><StatusBadge status={order.status}/><StatusBadge status={order.paymentStatus}/></div></div><span className="text-right text-sm font-medium text-[#253e2b]">{formatAdminAud(order.totalAud)}<small className="mt-1 block text-[11px] font-normal text-[#737373]">{formatAdminUsd(order.totalUsd)}</small></span></div><DrawerSection title="Timeline"><ol className="ml-2 border-l border-[#d4d0cc] pl-5">{order.timeline.map((entry, index) => <li key={`${entry.stage}-${entry.at}`} className="relative pb-4 last:pb-0"><span className={`absolute -left-[22px] top-1 h-3 w-3 rounded-full border-2 border-white ${index === order.timeline.length - 1 ? "bg-[#236339]" : "bg-[#c9a962]"}`}/><strong className="block text-xs font-medium text-[#253e2b]">{entry.stage}</strong><span className="text-[11px] text-[#737373]">{formatAdminDate(entry.at, { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}</span></li>)}</ol></DrawerSection><DrawerSection title="Items"><div className="divide-y divide-[#eeeae5] rounded-md border border-[#e3e0dc]">{order.items.map((item) => <div key={`${item.productId}-${item.variant}`} className="grid grid-cols-[48px_1fr_auto] gap-3 p-3"><img src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=120&q=70" alt="Jewellery order item" className="h-12 w-12 rounded object-cover"/><span><strong className="block text-xs font-medium text-[#253e2b]">{productLabel(item.productId)}</strong><span className="block text-[11px] text-[#737373]">{item.variant} · Qty {item.qty}</span></span><strong className="text-xs text-[#253e2b]">{formatAdminAud(item.lineTotal)}</strong></div>)}</div></DrawerSection><DrawerSection title="Customer"><div className="rounded-md bg-[#faf6ef] p-3 text-xs"><strong className="block text-sm font-medium text-[#253e2b]">{customer?.name ?? "Unknown customer"}</strong><a href={`mailto:${customer?.email ?? ""}`} className="mt-1 block text-[#236339]">{customer?.email}</a><p className="mb-0 mt-2 leading-5 text-[#737373]">{customer?.address}</p></div></DrawerSection><DrawerSection title="Delivery address"><div className="rounded-md border border-[#e3e0dc] p-3 text-xs leading-5 text-[#5f5a55]">{customer?.address ?? "No delivery address saved."}{order.trackingCode ? <span className="mt-2 block font-mono text-[#236339]">Tracking: {order.trackingCode}</span> : null}</div></DrawerSection><DrawerSection title="Billing"><div className="rounded-md border border-[#e3e0dc] p-3 text-xs">{invoice ? <div className="flex flex-wrap items-center gap-2"><span className="font-mono font-medium text-[#253e2b]">Invoice {invoice.number}</span><button type="button" onClick={() => { router.push("/admin/invoices"); onClose(); }} className="text-[#236339] underline">View</button><button type="button" onClick={() => { window.open(`/invoice/${encodeURIComponent(invoice.number)}`, "_blank", "noopener,noreferrer"); notify("Printable invoice opened in a new tab.", "info"); }} className="text-[#236339] underline">Download PDF</button><button type="button" onClick={() => notify(`Invoice emailed to ${customer?.email ?? "the customer"}.`)} className="text-[#236339] underline">Email to customer</button></div> : order.status === "Cancelled" ? <button type="button" onClick={() => router.push("/admin/invoices")} className="text-[#236339] underline">Credit note instead</button> : <span className="text-[#a09c97]">Invoice will unlock after payment is confirmed.</span>}</div></DrawerSection>{order.notes ? <DrawerSection title="Internal notes"><p className="rounded-md bg-[#faf6ef] p-3 text-xs leading-5 text-[#5f5a55]">{order.notes}</p></DrawerSection> : null}</AdminDrawer>;
}
function DrawerSection({ title, children }: {
    title: string;
    children: ReactNode;
}) { return <section className="mt-6"><h3 className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#737373]">{title}</h3>{children}</section>; }
