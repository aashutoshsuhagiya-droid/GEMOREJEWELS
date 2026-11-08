"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { AdminProduct, CreditNote, Customer, Invoice, InvoiceStatus, Order, OrderStatus, PaymentStatus } from "@/shared/admin-types";
import type { AdminSession } from "@/lib/admin-auth";
import { AdminSidebar } from "./sidebar";
import { AdminTopbar } from "./topbar";
import { AdminToastProvider, useAdminToast } from "./toast";
import { useDialogFocus } from "./use-dialog-focus";

export const formatAdminAud = (value: number) => `AUD $${Math.round(value).toLocaleString("en-AU")}`;
export const formatAdminUsd = (value: number) => `USD $${Math.round(value).toLocaleString("en-US")}`;
export const formatAdminDate = (value: string, options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }) => new Intl.DateTimeFormat("en-AU", options).format(new Date(value));

const DEMO_CUSTOMERS: Customer[] = [
  { id: "cus-001", name: "Mia Thompson", email: "mia.thompson@example.com", tags: ["VIP", "Repeat"], totalSpent: 14320, orderCount: 4, notes: "Prefers a short delivery update by email.", address: "15 Darling Street, Balmain NSW 2041", createdAt: "2026-03-14", vasStatus: "Active" },
  { id: "cus-002", name: "Arjun Nair", email: "arjun.nair@example.com", tags: ["Proposal-Season"], totalSpent: 7990, orderCount: 2, notes: "Requested a discreet parcel note.", address: "24 Chapel Street, Melbourne VIC 3181", createdAt: "2026-06-18", vasStatus: "Active" },
  { id: "cus-003", name: "Elise Walker", email: "elise.walker@example.com", tags: ["Repeat"], totalSpent: 12110, orderCount: 3, notes: "", address: "8 Potts Point Road, Sydney NSW 2011", createdAt: "2026-02-05", vasStatus: "None" },
  { id: "cus-004", name: "Noah Bennett", email: "noah.bennett@example.com", tags: [], totalSpent: 4550, orderCount: 1, notes: "Call before dispatch.", address: "49 Albert Street, Brisbane QLD 4000", createdAt: "2026-10-08", vasStatus: "None" },
  { id: "cus-005", name: "Sofia Martin", email: "sofia.martin@example.com", tags: ["VIP"], totalSpent: 18750, orderCount: 4, notes: "Customer has a showroom appointment on file.", address: "72 King Street, Newtown NSW 2042", createdAt: "2026-01-22", vasStatus: "Active" },
  { id: "cus-006", name: "Luca Rossi", email: "luca.rossi@example.com", tags: [], totalSpent: 3490, orderCount: 1, notes: "", address: "11 High Street, Kew VIC 3101", createdAt: "2026-10-19", vasStatus: "None" },
  { id: "cus-007", name: "Charlotte Lee", email: "charlotte.lee@example.com", tags: ["Proposal-Season"], totalSpent: 9820, orderCount: 2, notes: "Awaiting a resize consultation.", address: "5 Wattle Grove, Perth WA 6000", createdAt: "2026-08-11", vasStatus: "Active" },
  { id: "cus-008", name: "James Patel", email: "james.patel@example.com", tags: ["Repeat"], totalSpent: 7180, orderCount: 2, notes: "", address: "38 George Street, Adelaide SA 5000", createdAt: "2026-05-03", vasStatus: "None" }
];

const DEMO_ORDERS: Order[] = [
  { id: "ord-0001", code: "GM-2026-0001", customerId: "cus-001", items: [{ productId: "aaria-classic-solitaire", variant: "1.20ct · 18ct Yellow Gold", qty: 1, lineTotal: 3490, hsnCode: "711319" }], subtotal: 3490, gstRate: 18, gstAmount: 628, shipping: 0, totalAud: 4118, totalUsd: 2677, status: "Processing", paymentStatus: "Paid", paymentMethod: "Visa · 4242", createdAt: "2026-11-05T09:20:00.000Z", timeline: [{ stage: "Order created", at: "2026-11-05T09:20:00.000Z" }, { stage: "Payment confirmed", at: "2026-11-05T09:22:00.000Z" }, { stage: "Crafting started", at: "2026-11-05T12:00:00.000Z" }], craftStage: 1, notes: "Gift note: Always, M." },
  { id: "ord-0002", code: "GM-2026-0002", customerId: "cus-002", items: [{ productId: "kavya-halo-bloom", variant: "1.30ct · 18ct White Gold", qty: 1, lineTotal: 4380, hsnCode: "711319" }], subtotal: 4380, gstRate: 18, gstAmount: 788, shipping: 0, totalAud: 5168, totalUsd: 3360, status: "Crafting", paymentStatus: "Paid", paymentMethod: "GPay", createdAt: "2026-11-03T14:40:00.000Z", timeline: [{ stage: "Order created", at: "2026-11-03T14:40:00.000Z" }, { stage: "Payment confirmed", at: "2026-11-03T14:42:00.000Z" }, { stage: "Crafting started", at: "2026-11-04T10:00:00.000Z" }], craftStage: 1 },
  { id: "ord-0003", code: "GM-2026-0003", customerId: "cus-003", items: [{ productId: "mira-three-stone", variant: "1.50ct · Platinum", qty: 1, lineTotal: 4820, hsnCode: "711319" }], subtotal: 4820, gstRate: 18, gstAmount: 868, shipping: 0, totalAud: 5688, totalUsd: 3697, status: "Shipped", paymentStatus: "Paid", paymentMethod: "Mastercard · 9044", createdAt: "2026-10-30T06:15:00.000Z", timeline: [{ stage: "Order created", at: "2026-10-30T06:15:00.000Z" }, { stage: "Payment confirmed", at: "2026-10-30T06:16:00.000Z" }, { stage: "Crafting started", at: "2026-10-31T09:00:00.000Z" }, { stage: "Shipped", at: "2026-11-04T15:10:00.000Z" }], craftStage: 3, trackingCode: "GEM-923841" },
  { id: "ord-0004", code: "GM-2026-0004", customerId: "cus-004", items: [{ productId: "kavya-cushion-glow", variant: "1.30ct · Platinum", qty: 1, lineTotal: 4550, hsnCode: "711319" }], subtotal: 4550, gstRate: 18, gstAmount: 819, shipping: 0, totalAud: 5369, totalUsd: 3490, status: "Pending", paymentStatus: "Pending", paymentMethod: "Bank transfer", createdAt: "2026-11-05T17:40:00.000Z", timeline: [{ stage: "Order created", at: "2026-11-05T17:40:00.000Z" }], craftStage: 0 },
  { id: "ord-0005", code: "GM-2026-0005", customerId: "cus-005", items: [{ productId: "aaria-east-west-oval", variant: "1.50ct · 18ct White Gold", qty: 1, lineTotal: 4180, hsnCode: "711319" }, { productId: "mira-diamond-band", variant: "0.80ct · 18ct White Gold", qty: 1, lineTotal: 2890, hsnCode: "711319" }], subtotal: 7070, gstRate: 18, gstAmount: 1273, shipping: 0, totalAud: 8343, totalUsd: 5423, status: "Delivered", paymentStatus: "Paid", paymentMethod: "Amex · 1008", createdAt: "2026-10-23T10:15:00.000Z", timeline: [{ stage: "Order created", at: "2026-10-23T10:15:00.000Z" }, { stage: "Payment confirmed", at: "2026-10-23T10:17:00.000Z" }, { stage: "Crafting started", at: "2026-10-24T09:00:00.000Z" }, { stage: "Shipped", at: "2026-10-28T12:10:00.000Z" }, { stage: "Delivered", at: "2026-10-30T10:30:00.000Z" }], craftStage: 3 },
  { id: "ord-0006", code: "GM-2026-0006", customerId: "cus-006", items: [{ productId: "aaria-classic-solitaire", variant: "1.20ct · 18ct Rose Gold", qty: 1, lineTotal: 3490, hsnCode: "711319" }], subtotal: 3490, gstRate: 18, gstAmount: 628, shipping: 0, totalAud: 4118, totalUsd: 2677, status: "Cancelled", paymentStatus: "Refunded", paymentMethod: "Visa · 1192", createdAt: "2026-10-18T11:40:00.000Z", timeline: [{ stage: "Order created", at: "2026-10-18T11:40:00.000Z" }, { stage: "Payment confirmed", at: "2026-10-18T11:42:00.000Z" }, { stage: "Cancelled", at: "2026-10-19T08:50:00.000Z" }], craftStage: 0, notes: "Duplicate order — refunded." },
  { id: "ord-0007", code: "GM-2026-0007", customerId: "cus-007", items: [{ productId: "mira-oval-trilogy", variant: "1.70ct · 18ct Yellow Gold", qty: 1, lineTotal: 4990, hsnCode: "711319" }], subtotal: 4990, gstRate: 18, gstAmount: 898, shipping: 0, totalAud: 5888, totalUsd: 3827, status: "Crafting", paymentStatus: "Paid", paymentMethod: "GPay", createdAt: "2026-10-16T08:45:00.000Z", timeline: [{ stage: "Order created", at: "2026-10-16T08:45:00.000Z" }, { stage: "Payment confirmed", at: "2026-10-16T08:47:00.000Z" }, { stage: "Crafting started", at: "2026-10-17T09:00:00.000Z" }], craftStage: 1 },
  { id: "ord-0008", code: "GM-2026-0008", customerId: "cus-008", items: [{ productId: "mira-diamond-hoops", variant: "0.75ct · 18ct Yellow Gold", qty: 1, lineTotal: 1980, hsnCode: "711319" }], subtotal: 1980, gstRate: 18, gstAmount: 356, shipping: 65, totalAud: 2401, totalUsd: 1561, status: "Delivered", paymentStatus: "Paid", paymentMethod: "Visa · 6007", createdAt: "2026-09-28T16:10:00.000Z", timeline: [{ stage: "Order created", at: "2026-09-28T16:10:00.000Z" }, { stage: "Payment confirmed", at: "2026-09-28T16:12:00.000Z" }, { stage: "Shipped", at: "2026-10-02T12:10:00.000Z" }, { stage: "Delivered", at: "2026-10-05T10:30:00.000Z" }], craftStage: 3 },
  { id: "ord-0009", code: "GM-2026-0009", customerId: "cus-001", items: [{ productId: "mira-soft-curve", variant: "0.60ct · 18ct Yellow Gold", qty: 1, lineTotal: 2430, hsnCode: "711319" }], subtotal: 2430, gstRate: 18, gstAmount: 437, shipping: 0, totalAud: 2867, totalUsd: 1864, status: "Delivered", paymentStatus: "Paid", paymentMethod: "Visa · 4242", createdAt: "2026-09-18T09:30:00.000Z", timeline: [{ stage: "Order created", at: "2026-09-18T09:30:00.000Z" }, { stage: "Payment confirmed", at: "2026-09-18T09:32:00.000Z" }, { stage: "Shipped", at: "2026-09-21T13:00:00.000Z" }, { stage: "Delivered", at: "2026-09-25T11:00:00.000Z" }], craftStage: 3 }
];

const invoiceForOrder = (order: Order): Invoice => ({
  id: `inv-${order.id.slice(-4)}`,
  number: `INV-${order.code}`,
  orderId: order.id,
  customerId: order.customerId,
  issuedAt: order.timeline.find((entry) => entry.stage === "Payment confirmed")?.at ?? order.createdAt,
  dueAt: order.createdAt,
  lines: order.items.map((item) => ({ desc: productLabel(item.productId), hsn: item.hsnCode, qty: item.qty, rate: item.lineTotal / item.qty, amount: item.lineTotal })),
  subtotal: order.subtotal,
  cgst: Math.round(order.gstAmount / 2),
  sgst: Math.ceil(order.gstAmount / 2),
  shipping: order.shipping,
  totalAud: order.totalAud,
  totalUsd: order.totalUsd,
  status: order.paymentStatus === "Refunded" ? "refunded" : "paid",
  stampDate: order.paymentStatus === "Paid" || order.paymentStatus === "Refunded" ? order.createdAt : undefined,
  method: order.paymentMethod,
  creditNoteId: order.paymentStatus === "Refunded" ? "cn-0006" : undefined
});

const DEMO_INVOICES = DEMO_ORDERS.filter((order) => order.paymentStatus !== "Pending").map(invoiceForOrder);
const DEMO_CREDIT_NOTES: CreditNote[] = [{ id: "cn-0006", number: "CN-GM-2026-0006", invoiceId: "inv-0006", orderId: "ord-0006", amount: 4118, reason: "Duplicate order", createdAt: "2026-10-19T08:50:00.000Z" }];

function productLabel(id: string) {
  const labels: Record<string, string> = { "aaria-classic-solitaire": "Aaria Classic Solitaire", "kavya-halo-bloom": "Kavya Halo Bloom", "mira-three-stone": "Mira Three-Stone", "kavya-cushion-glow": "Kavya Cushion Glow", "aaria-east-west-oval": "Aaria East-West Oval", "mira-diamond-band": "Mira Diamond Band", "mira-oval-trilogy": "Mira Oval Trilogy", "mira-diamond-hoops": "Mira Diamond Hoops", "mira-soft-curve": "Mira Soft Curve" };
  const seededNames = ["Aaria Classic Solitaire", "Aaria East-West Oval", "Aaria Bezel Light", "Aaria Pear Poise", "Aaria Emerald Line", "Aaria Marquise Arc", "Aaria Cushion Frame", "Aaria Radiant Still", "Kavya Halo Bloom", "Kavya Round Halo", "Kavya Pear Halo", "Kavya Cushion Glow", "Kavya Emerald Halo", "Kavya Radiant Bloom", "Kavya Secret Halo", "Kavya Toi Et Moi", "Mira Three-Stone", "Mira Oval Trilogy", "Mira Emerald Trio", "Mira Pear Trilogy", "Mira Diamond Band", "Mira Soft Curve", "Mira Diamond Hoops", "Mira Pendant Light", "Aaria Floating Marquise", "Aaria Oval Crest", "Kavya Starlight Halo", "Kavya Double Halo", "Mira Open Band", "Mira Pavé Curve", "Aaria Cathedral Oval", "Aaria North Star", "Kavya Petal Halo", "Kavya Elongated Cushion", "Mira Petite Trilogy", "Mira Golden Hoop", "Aaria Compass Set", "Kavya Heart Halo", "Mira Brilliance Band", "Mira Diamond Drop"];
  const seedIndex = /^prod-(\d+)$/.exec(id)?.[1];
  if (seedIndex) return seededNames[Number(seedIndex) - 1] ?? `GEMOIRE design ${seedIndex}`;
  return labels[id] ?? id.split("-").map((word) => word[0]?.toUpperCase() + word.slice(1)).join(" ");
}

type OperationsContextValue = {
  products: AdminProduct[];
  orders: Order[];
  customers: Customer[];
  invoices: Invoice[];
  creditNotes: CreditNote[];
  getCustomer: (id: string) => Customer | undefined;
  updateOrder: (id: string, update: Partial<Order>) => void;
  markOrderPaid: (id: string) => Invoice | undefined;
  markShipped: (id: string) => string | undefined;
  refundInvoice: (id: string) => CreditNote | undefined;
  updateCustomer: (id: string, update: Partial<Customer>) => void;
  mergeCustomers: (sourceId: string, targetId: string) => void;
};

const OperationsContext = createContext<OperationsContextValue | null>(null);

export function AdminDataProvider({ children }: { children: ReactNode }) {
  const { notify } = useAdminToast();
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [orders, setOrders] = useState<Order[]>(DEMO_ORDERS);
  const [customers, setCustomers] = useState<Customer[]>(DEMO_CUSTOMERS);
  const [invoices, setInvoices] = useState<Invoice[]>(DEMO_INVOICES);
  const [creditNotes, setCreditNotes] = useState<CreditNote[]>(DEMO_CREDIT_NOTES);

  // The shell remains useful without a session, but an authenticated admin is hydrated
  // from the shared repository through its server-only API boundary.
  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const [productData, orderData, customerData, invoiceData, creditData] = await Promise.all(["products", "orders", "customers", "invoices", "creditNotes"].map(async (resource) => {
          const response = await fetch(`/api/admin/${resource}`, { credentials: "same-origin" });
          if (!response.ok) throw new Error(`Unable to load ${resource}`);
          return response.json();
        }));
        if (!active || !Array.isArray(productData) || !Array.isArray(orderData) || !Array.isArray(customerData) || !Array.isArray(invoiceData) || !Array.isArray(creditData)) return;
        setProducts(productData as AdminProduct[]);
        setOrders(orderData as Order[]);
        setCustomers(customerData as Customer[]);
        setInvoices(invoiceData as Invoice[]);
        setCreditNotes(creditData as CreditNote[]);
      } catch {
        // The local demo seed is intentionally retained for pre-login previews.
      }
    };
    void load();
    return () => { active = false; };
  }, []);

  const save = (resource: string, value: object) => {
    void fetch(`/api/admin/${resource}`, { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ value }) }).then((response) => {
      if (!response.ok) notify(`Could not save ${resource}. Your change remains in this preview.`, "error");
    }).catch(() => notify(`Could not save ${resource}. Your change remains in this preview.`, "error"));
  };

  const getCustomer = (id: string) => customers.find((customer) => customer.id === id);
  const updateOrder = (id: string, update: Partial<Order>) => {
    const current = orders.find((order) => order.id === id);
    if (!current) return;
    const next = { ...current, ...update };
    setOrders((items) => items.map((order) => order.id === id ? next : order));
    save("orders", next);
  };

  const markOrderPaid = (id: string) => {
    const existing = orders.find((order) => order.id === id);
    if (!existing) return undefined;
    const paidAt = new Date().toISOString();
    const paidOrder: Order = { ...existing, paymentStatus: "Paid" as PaymentStatus, status: existing.status === "Pending" ? "Processing" as OrderStatus : existing.status, timeline: [...existing.timeline, { stage: "Payment confirmed", at: paidAt }] };
    setOrders((current) => current.map((order) => order.id === id ? paidOrder : order));
    const alreadyCreated = invoices.find((invoice) => invoice.orderId === id);
    const invoice = alreadyCreated ?? invoiceForOrder(paidOrder);
    if (!alreadyCreated) setInvoices((current) => [invoice, ...current]);
    void fetch("/api/admin/orders", { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "mark-paid", id }) }).then(async (response) => {
      if (!response.ok) { setOrders((current) => current.map((order) => order.id === id ? existing : order)); if (!alreadyCreated) setInvoices((current) => current.filter((item) => item.id !== invoice.id)); notify("Could not confirm payment with the shared data store.", "error"); return; }
      const saved = await response.json() as { order?: Order; invoice?: Invoice };
      if (saved.order) setOrders((current) => current.map((order) => order.id === id ? saved.order! : order));
      if (saved.order && existing.paymentStatus !== "Paid") setCustomers((current) => current.map((customer) => customer.id === saved.order!.customerId ? { ...customer, totalSpent: customer.totalSpent + saved.order!.totalAud } : customer));
      if (saved.invoice) setInvoices((current) => [saved.invoice!, ...current.filter((item) => item.orderId !== id)]);
    }).catch(() => { setOrders((current) => current.map((order) => order.id === id ? existing : order)); if (!alreadyCreated) setInvoices((current) => current.filter((item) => item.id !== invoice.id)); notify("Could not confirm payment with the shared data store.", "error"); });
    return invoice;
  };

  const markShipped = (id: string) => {
    const order = orders.find((item) => item.id === id);
    if (!order) return undefined;
    const trackingCode = `GEM-${Math.floor(100000 + Math.random() * 899999)}`;
    const shipped: Order = { ...order, status: "Shipped", craftStage: 3, trackingCode, timeline: [...order.timeline, { stage: "Shipped", at: new Date().toISOString() }] };
    setOrders((current) => current.map((item) => item.id === id ? shipped : item));
    void fetch("/api/admin/orders", { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "mark-shipped", id }) }).then(async (response) => {
      if (!response.ok) { setOrders((current) => current.map((item) => item.id === id ? order : item)); notify("Could not mark this order as shipped in the shared data store.", "error"); return; }
      const saved = await response.json() as Order;
      setOrders((current) => current.map((item) => item.id === id ? saved : item));
    }).catch(() => { setOrders((current) => current.map((item) => item.id === id ? order : item)); notify("Could not mark this order as shipped in the shared data store.", "error"); });
    return trackingCode;
  };

  const refundInvoice = (id: string) => {
    const invoice = invoices.find((item) => item.id === id);
    if (!invoice || invoice.status === "refunded") return undefined;
    const creditNote: CreditNote = { id: `cn-${Date.now()}`, number: `CN-${invoice.number.replace("INV-", "")}`, invoiceId: invoice.id, orderId: invoice.orderId, amount: invoice.totalAud, reason: "Cancelled or returned order", createdAt: new Date().toISOString() };
    const refundedInvoice: Invoice = { ...invoice, status: "refunded" as InvoiceStatus, stampDate: creditNote.createdAt, creditNoteId: creditNote.id };
    setInvoices((current) => current.map((item) => item.id === id ? refundedInvoice : item));
    setCreditNotes((current) => [creditNote, ...current]);
    const cancelledOrder = orders.find((order) => order.id === invoice.orderId);
    const refundedOrder: Order | undefined = cancelledOrder ? { ...cancelledOrder, status: "Cancelled" as OrderStatus, paymentStatus: "Refunded" as PaymentStatus, timeline: [...cancelledOrder.timeline, { stage: "Refunded", at: creditNote.createdAt }] } : undefined;
    if (refundedOrder) setOrders((current) => current.map((order) => order.id === invoice.orderId ? refundedOrder : order));
    void fetch("/api/admin/invoices", { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "refund", id }) }).then(async (response) => {
      if (!response.ok) { setInvoices((current) => current.map((item) => item.id === id ? invoice : item)); setCreditNotes((current) => current.filter((item) => item.id !== creditNote.id)); if (cancelledOrder) setOrders((current) => current.map((item) => item.id === cancelledOrder.id ? cancelledOrder : item)); notify("Could not record the refund in the shared data store.", "error"); return; }
      const saved = await response.json() as { invoice?: Invoice; credit?: CreditNote; order?: Order };
      if (saved.invoice) setInvoices((current) => current.map((item) => item.id === id ? saved.invoice! : item));
      if (saved.credit) setCreditNotes((current) => [saved.credit!, ...current.filter((item) => item.invoiceId !== id)]);
      if (saved.order) setOrders((current) => current.map((item) => item.id === saved.order!.id ? saved.order! : item));
    }).catch(() => { setInvoices((current) => current.map((item) => item.id === id ? invoice : item)); setCreditNotes((current) => current.filter((item) => item.id !== creditNote.id)); if (cancelledOrder) setOrders((current) => current.map((item) => item.id === cancelledOrder.id ? cancelledOrder : item)); notify("Could not record the refund in the shared data store.", "error"); });
    return creditNote;
  };

  const updateCustomer = (id: string, update: Partial<Customer>) => {
    const current = customers.find((customer) => customer.id === id);
    if (!current) return;
    const next = { ...current, ...update };
    setCustomers((items) => items.map((customer) => customer.id === id ? next : customer));
    save("customers", next);
  };
  const mergeCustomers = (sourceId: string, targetId: string) => {
    const source = customers.find((customer) => customer.id === sourceId);
    const target = customers.find((customer) => customer.id === targetId);
    if (!source || !target || sourceId === targetId) return;
    const merged: Customer = { ...target, tags: [...new Set([...target.tags, ...source.tags])], totalSpent: target.totalSpent + source.totalSpent, orderCount: target.orderCount + source.orderCount, notes: [target.notes, source.notes].filter(Boolean).join("\n") };
    setCustomers((current) => current.filter((customer) => customer.id !== sourceId).map((customer) => customer.id === targetId ? merged : customer));
    setOrders((current) => current.map((order) => order.customerId === sourceId ? { ...order, customerId: targetId } : order));
    setInvoices((current) => current.map((invoice) => invoice.customerId === sourceId ? { ...invoice, customerId: targetId } : invoice));
    save("customers", merged);
    orders.filter((order) => order.customerId === sourceId).forEach((order) => save("orders", { ...order, customerId: targetId }));
    invoices.filter((invoice) => invoice.customerId === sourceId).forEach((invoice) => save("invoices", { ...invoice, customerId: targetId }));
    void fetch("/api/admin/customers", { method: "DELETE", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: sourceId }) }).catch(() => undefined);
  };

  const value = useMemo<OperationsContextValue>(() => ({ products, orders, customers, invoices, creditNotes, getCustomer, updateOrder, markOrderPaid, markShipped, refundInvoice, updateCustomer, mergeCustomers }), [products, orders, customers, invoices, creditNotes]);
  return <OperationsContext.Provider value={value}>{children}</OperationsContext.Provider>;
}

// Kept as a compatibility alias for operational screens that were assembled
// before the shared naming convention was finalised.
export const AdminOperationsProvider = AdminDataProvider;

export function useAdminOperations() {
  const value = useContext(OperationsContext);
  if (!value) throw new Error("useAdminOperations must be used inside AdminOperationsProvider");
  return value;
}

export function AdminShell({ children, session }: { children: ReactNode; session: AdminSession }) {
  return <AdminToastProvider><AdminDataProvider><AdminShellFrame session={session}>{children}</AdminShellFrame></AdminDataProvider></AdminToastProvider>;
}

function AdminShellFrame({ children, session }: { children: ReactNode; session: AdminSession }) {
  const [navOpen, setNavOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  useEffect(() => {
    const shortcut = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const editing = target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.isContentEditable;
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); setPaletteOpen(true); }
      if (event.key === "/" && !editing) { event.preventDefault(); setPaletteOpen(true); }
      if (event.key === "Escape") { setPaletteOpen(false); setNavOpen(false); }
    };
    window.addEventListener("keydown", shortcut);
    return () => window.removeEventListener("keydown", shortcut);
  }, []);
  return <div className="admin-root min-h-screen bg-[#faf6ef] text-[#232323]"><style>{`body:has(.admin-root) .announcement,body:has(.admin-root) .site-header,body:has(.admin-root) .footer{display:none}body:has(.admin-root){background:#faf6ef}`}</style><AdminSidebar open={navOpen} onClose={() => setNavOpen(false)} /><AdminTopbar session={session} menuOpen={navOpen} onOpenMenu={() => setNavOpen(true)} onOpenPalette={() => setPaletteOpen(true)} /><main className="min-h-screen px-4 pb-10 pt-[72px] lg:ml-16 lg:px-6 xl:ml-60 xl:px-8">{children}</main>{paletteOpen ? <CommandPalette onClose={() => setPaletteOpen(false)} /> : null}</div>;
}

function CommandPalette({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);
  const { products, orders, customers } = useAdminOperations();
  const router = useRouter();
  const pathname = usePathname();
  useDialogFocus(panelRef, onClose);
  const needle = query.trim().toLowerCase();
  const results = [
    ...products.filter((product) => !needle || `${product.name} ${product.sku} ${product.id}`.toLowerCase().includes(needle)).slice(0, 4).map((product) => ({ key: product.id, title: product.name, subtitle: product.sku, href: `/admin/products/${product.slug}` })),
    ...orders.filter((order) => !needle || order.code.toLowerCase().includes(needle)).slice(0, 4).map((order) => ({ key: order.id, title: order.code, subtitle: "Order", href: "/admin/orders" })),
    ...customers.filter((customer) => !needle || `${customer.name} ${customer.email}`.toLowerCase().includes(needle)).slice(0, 4).map((customer) => ({ key: customer.id, title: customer.name, subtitle: customer.email, href: "/admin/customers" })),
    ...(["Products", "Reports", "Invoices"].filter((item) => !needle || item.toLowerCase().includes(needle)).map((item) => ({ key: item, title: item, subtitle: "Navigate", href: `/admin/${item.toLowerCase() === "products" ? "products" : item.toLowerCase()}` })))
  ];
  const go = (href: string) => { if (href !== pathname) router.push(href); onClose(); };
  return <div className="fixed inset-0 z-[80] grid place-items-start bg-black/25 px-4 pt-[12vh]" role="presentation" onMouseDown={onClose}><div ref={panelRef} role="dialog" aria-modal="true" aria-label="Command palette" onMouseDown={(event) => event.stopPropagation()} className="w-full max-w-xl overflow-hidden rounded-md border border-[#d4d0cc] bg-white shadow-2xl"><div className="flex items-center border-b border-[#e3e0dc] px-4"><svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0 stroke-[#737373]" strokeWidth="1.8"><circle cx="11" cy="11" r="6"/><path d="m16 16 4 4"/></svg><input data-autofocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products, orders, customers…" className="h-14 min-w-0 flex-1 border-0 px-3 text-sm outline-none"/><kbd className="rounded border border-[#d4d0cc] px-1.5 py-0.5 text-[10px] text-[#737373]">ESC</kbd></div><div className="max-h-[50vh] overflow-y-auto p-2">{results.length ? results.map((result) => <button type="button" key={result.key} onClick={() => go(result.href)} className="flex w-full items-center justify-between rounded px-3 py-3 text-left hover:bg-[#faf6ef]"><span><strong className="block text-sm font-medium text-[#253e2b]">{result.title}</strong><span className="text-xs text-[#737373]">{result.subtitle}</span></span><span className="text-xs text-[#737373]">↵</span></button>) : <p className="px-3 py-8 text-center text-sm text-[#737373]">No matching records.</p>}</div><div className="flex gap-3 border-t border-[#e3e0dc] px-4 py-2 text-[10px] text-[#737373]"><span>⌘K or / to search</span><span>Esc to close</span><Link href="/" target="_blank" className="ml-auto text-[#236339]">View storefront ↗</Link></div></div></div>;
}

export { productLabel };
