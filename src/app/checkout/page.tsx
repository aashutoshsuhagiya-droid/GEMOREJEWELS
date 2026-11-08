"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CraftTracker } from "@/components/commerce/craft-tracker";
import { useCart } from "@/components/commerce/cart-store";

type Receipt = { orderCode: string; paymentStatus: "Paid" | "Pending"; invoiceNumber?: string };
type FormValues = { email: string; firstName: string; lastName: string; address: string; city: string; postcode: string };
type CheckoutSettings = {
  paymentEnabled: boolean;
  bankDetails: { accountName: string; bankName: string; accountNumber: string; bic: string };
};

const defaultSettings: CheckoutSettings = {
  paymentEnabled: true,
  bankDetails: { accountName: "", bankName: "", accountNumber: "", bic: "" },
};

export default function CheckoutPage() {
  const { items, subtotal, promotion, clear } = useCart();
  const checkoutSubtotal = Math.max(0, subtotal - (promotion?.amount ?? 0));
  const [settings, setSettings] = useState(defaultSettings);
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<FormValues>({ email: "", firstName: "", lastName: "", address: "", city: "", postcode: "" });
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const titles = ["Shipping", "Delivery", settings.paymentEnabled ? "Payment" : "Review"];
  const update = (field: keyof FormValues, value: string) => setValues(current => ({ ...current, [field]: value }));

  useEffect(() => {
    let active = true;
    void fetch("/api/storefront/settings").then(response => response.ok ? response.json() : null).then(value => {
      if (!active || typeof value?.paymentEnabled !== "boolean") return;
      setSettings({ paymentEnabled: value.paymentEnabled, bankDetails: { ...defaultSettings.bankDetails, ...value.bankDetails } });
    }).catch(() => undefined);
    return () => { active = false; };
  }, []);

  async function placeOrder() {
    if (!items.length) { setNotice("Your bag is empty. Choose a piece before checking out."); return; }
    setSubmitting(true); setNotice("");
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: { name: `${values.firstName} ${values.lastName}`.trim(), email: values.email, address: [values.address, values.city, values.postcode].filter(Boolean).join(", ") },
          items,
          discountCode: promotion?.code,
        }),
      });
      const result = await response.json() as { error?: string; paymentRequired?: boolean; order?: { code: string; paymentStatus: "Paid" | "Pending" }; invoice?: { number: string } };
      if (!response.ok || !result.order) throw new Error(result.error || "We could not create this mock order.");
      if (result.order.paymentStatus === "Paid" && !result.invoice) throw new Error("The paid order was created without its invoice. Please contact client care.");
      clear();
      setReceipt({ orderCode: result.order.code, paymentStatus: result.order.paymentStatus, invoiceNumber: result.invoice?.number });
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "We could not create this mock order.");
    } finally {
      setSubmitting(false);
    }
  }

  if (receipt) {
    const paid = receipt.paymentStatus === "Paid";
    return (
      <main className="checkout">
        <section className="order-success">
          <p className="eyebrow">{paid ? "Order confirmed" : "Order received"}</p>
          <h1>{paid ? "Thank you for trusting us with the beginning." : "Your piece is reserved."}</h1>
          <p>{paid ? `${receipt.orderCode} is paid and safely in our craft queue. We’ll share every meaningful stage from here.` : `${receipt.orderCode} is awaiting manual payment confirmation. Your invoice will appear after an administrator marks the order paid.`}</p>
          <div className="hero-actions">
            <Link href="/account" className="button button-white">View your order</Link>
            {receipt.invoiceNumber ? <Link href={`/invoice/${encodeURIComponent(receipt.invoiceNumber)}`} className="button button-outline">Download your invoice</Link> : null}
          </div>
        </section>
        <CraftTracker current={0} />
      </main>
    );
  }

  return (
    <main className="checkout">
      <p className="eyebrow">A few final details</p>
      <h1>Checkout</h1>
      <div className="checkout-steps">{titles.map((title, index) => <span className={index === step ? "active" : ""} key={title}>{index + 1}. {title}</span>)}</div>
      <section className="checkout-panel">
        <h3>{titles[step]}</h3>
        {step === 0 ? <div className="form-grid"><input required type="email" value={values.email} onChange={event => update("email", event.target.value)} placeholder="Email address"/><input required value={values.firstName} onChange={event => update("firstName", event.target.value)} placeholder="First name"/><input required value={values.lastName} onChange={event => update("lastName", event.target.value)} placeholder="Last name"/><input required value={values.address} onChange={event => update("address", event.target.value)} placeholder="Address"/><input required value={values.city} onChange={event => update("city", event.target.value)} placeholder="City"/><input required value={values.postcode} onChange={event => update("postcode", event.target.value)} placeholder="Postcode"/></div> : null}
        {step === 1 ? <><p>Choose how your fully insured order arrives.</p><label className="filter-option"><input type="radio" defaultChecked name="delivery"/> Express delivery · complimentary</label><label className="filter-option"><input type="radio" name="delivery"/> Standard delivery · complimentary</label></> : null}
        {step === 2 ? (
          <div className="form-grid">
            {settings.paymentEnabled ? <><input placeholder="Cardholder name"/><input placeholder="Card number"/><input placeholder="MM / YY"/><input placeholder="CVC"/></> : (
              <div style={{ gridColumn: "1 / -1" }}>
                <p>Online payment is currently paused. Submit your order without card details; an administrator will confirm payment before an invoice is issued.</p>
                {settings.bankDetails.accountNumber ? <p className="promo-message">Manual payment: {settings.bankDetails.accountName} · {settings.bankDetails.bankName} · {settings.bankDetails.accountNumber} · {settings.bankDetails.bic}</p> : null}
              </div>
            )}
            {promotion ? <p className="promo-message">{promotion.code} applied · AUD ${promotion.amount.toLocaleString("en-AU")} off{promotion.shippingFree ? " · free shipping" : ""}</p> : null}
            <p className="checkout-total">Order subtotal: AUD ${checkoutSubtotal.toLocaleString("en-AU")}</p>
          </div>
        ) : null}
        {notice ? <p className="promo-message" role="alert">{notice}</p> : null}
        <button className="button" type="button" disabled={submitting} style={{ marginTop: 25 }} onClick={() => {
          if (step === 0 && (!values.email || !values.firstName || !values.lastName || !values.address || !values.city || !values.postcode)) { setNotice("Please complete your delivery details before continuing."); return; }
          if (step === 2) void placeOrder(); else { setNotice(""); setStep(current => current + 1); }
        }}>{submitting ? (settings.paymentEnabled ? "Placing mock order…" : "Submitting order…") : step === 2 ? (settings.paymentEnabled ? "Place mock order" : "Submit order for payment") : "Continue"}</button>
      </section>
    </main>
  );
}
