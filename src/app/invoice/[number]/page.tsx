import { notFound } from "next/navigation";
import { adminRepository } from "@/lib/admin-repository";
import { getAdminSession } from "@/lib/admin-auth";
import { getStorefrontOrderIds } from "@/lib/storefront-access";
import { PrintInvoiceButton } from "@/components/commerce/print-invoice-button";
import { CurrencyAmount } from "@/components/commerce/currency-store";

export const dynamic = "force-dynamic";

export default async function StorefrontInvoice({ params }: { params: Promise<{ number: string }> }) {
  const { number } = await params;
  const invoice = adminRepository.listInvoices().find(item => item.number === number);
  if (!invoice) notFound();

  const [allowedOrders, adminSession] = await Promise.all([getStorefrontOrderIds(), getAdminSession()]);
  if (!adminSession && !allowedOrders.includes(invoice.orderId)) notFound();

  const customer = adminRepository.get("customers", invoice.customerId);
  const order = adminRepository.get("orders", invoice.orderId);
  const currentSettings = adminRepository.getSettings();
  const snapshot = invoice.billingSnapshot;
  const storeName = snapshot?.storeName ?? currentSettings.storeName;
  const gstin = snapshot?.gstin ?? currentSettings.billing.gstin;
  const cin = snapshot?.cin ?? currentSettings.billing.cin;
  const gstRate = snapshot?.gstRate ?? currentSettings.billing.gstRate;
  const splitGst = snapshot?.splitGst ?? currentSettings.billing.splitGst;
  const footer = snapshot?.footer ?? currentSettings.billing.footer;

  return (
    <main className="storefront-invoice">
      <section className="invoice-print">
        <header>
          <div className="invoice-logo"><strong>{storeName}</strong><span>JEWELS LLP</span></div>
          <div><h1>Tax invoice</h1><p>{invoice.number}</p><small>GSTIN {gstin} · CIN {cin}</small></div>
        </header>
        <div className="invoice-meta">
          <div><strong>Bill to</strong><p>{customer?.name}<br/>{customer?.email}<br/>{customer?.address}</p></div>
          <div><strong>Order reference</strong><p>{order?.code}<br/>Issued {new Date(invoice.issuedAt).toLocaleDateString("en-AU")}</p></div>
        </div>
        <table>
          <thead><tr><th>Description</th><th>HSN</th><th>Qty</th><th>Rate</th><th>Amount</th></tr></thead>
          <tbody>{invoice.lines.map(line => <tr key={`${line.desc}-${line.hsn}`}><td>{line.desc}</td><td>{line.hsn}</td><td>{line.qty}</td><td><CurrencyAmount usd={line.rate}/></td><td><CurrencyAmount usd={line.amount}/></td></tr>)}</tbody>
        </table>
        <div className="invoice-totals">
          <span>Subtotal</span><b><CurrencyAmount usd={invoice.subtotal}/></b>
          {invoice.discountAmount ? <><span>Discount{invoice.discountCode ? ` · ${invoice.discountCode}` : ""}</span><b>−<CurrencyAmount usd={invoice.discountAmount}/></b></> : null}
          {splitGst ? <><span>CGST @{gstRate / 2}%</span><b><CurrencyAmount usd={invoice.cgst}/></b><span>SGST @{gstRate / 2}%</span><b><CurrencyAmount usd={invoice.sgst}/></b></> : <><span>GST @{gstRate}%</span><b><CurrencyAmount usd={invoice.cgst + invoice.sgst}/></b></>}
          <span>Shipping</span><b>{invoice.shipping ? <CurrencyAmount usd={invoice.shipping}/> : "Complimentary"}</b>
          <strong>Grand total</strong><strong><CurrencyAmount usd={invoice.totalUsd}/></strong>
        </div>
        <div className={`invoice-stamp ${invoice.status}`}>{invoice.status === "paid" ? "PAID" : invoice.status.toUpperCase()}</div>
        <footer>{footer} Questions? hello@gemoirejewels.com</footer>
      </section>
      <PrintInvoiceButton />
    </main>
  );
}
