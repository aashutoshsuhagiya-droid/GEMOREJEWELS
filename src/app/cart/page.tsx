"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/components/commerce/cart-store";
import { formatAud } from "@/data/products";

type AppliedPromo = { code: string; type: "percentage" | "fixed" | "shipping"; value: number; amount: number; shippingFree: boolean };

export default function CartPage() {
  const { items, subtotal, promotion: appliedPromo, setPromotion: setAppliedPromo, updateQuantity, removeItem } = useCart();
  const [code, setCode] = useState(""); const [promoMessage, setPromoMessage] = useState(""); const [saving, setSaving] = useState(false);
  const [paymentEnabled, setPaymentEnabled] = useState(true);
  useEffect(() => {
    let active = true;
    void fetch("/api/storefront/settings").then(response => response.ok ? response.json() : null).then(value => {
      if (active && typeof value?.paymentEnabled === "boolean") setPaymentEnabled(value.paymentEnabled);
    }).catch(() => undefined);
    return () => { active = false; };
  }, []);
  const discountAmount = Math.min(subtotal, Math.max(0, appliedPromo?.amount ?? 0));
  const total = Math.max(0, subtotal - discountAmount);
  async function applyPromo() { if (!items.length) { setPromoMessage("Add a piece before applying a code."); return; } setSaving(true); const response = await fetch("/api/discounts/validate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code, items: items.map(item => ({ slug: item.slug, quantity: item.quantity, audPrice: item.audPrice, metal: item.metal, carat: item.carat })) }) }); const result = await response.json(); setSaving(false); if (!response.ok) { setAppliedPromo(null); setPromoMessage(result.error); return; } const next: AppliedPromo = { code: result.discount.code, type: result.discount.type, value: result.discount.value, amount: Math.max(0, Number(result.amount) || 0), shippingFree: Boolean(result.shippingFree) }; setAppliedPromo(next); setPromoMessage(next.shippingFree ? `${next.code} applied — free shipping is included.` : `${next.code} applied — ${formatAud(next.amount)} off.`); }
  return <main className="shell cart-page"><section><p className="eyebrow">Your considered edit</p><h1>Your bag</h1>{items.length ? <div className="cart-lines">{items.map(item => <div className="cart-line" key={item.slug}><Image src={item.image} alt="Placeholder product thumbnail" width={160} height={160}/><div><h3>{item.name}</h3><p>{item.carat} · {item.metal}</p><strong>{formatAud(item.audPrice)}</strong><div className="qty-row"><button onClick={() => updateQuantity(item.slug, item.quantity - 1)}>−</button><span>{item.quantity}</span><button onClick={() => updateQuantity(item.slug, item.quantity + 1)}>+</button><button className="remove-button" onClick={() => removeItem(item.slug)}>Remove</button></div></div></div>)}</div> : <div className="empty-state"><p>Your bag is waiting for its first piece.</p><Link className="button" href="/collections/engagement">Explore engagement rings</Link></div>}</section><aside className="cart-summary"><h3>Order summary</h3><div className="subtotal"><span>Subtotal</span><strong>{formatAud(subtotal)}</strong></div>{appliedPromo && discountAmount > 0 ? <div className="subtotal"><span>Discount · {appliedPromo.code}</span><strong>−{formatAud(discountAmount)}</strong></div> : null}{appliedPromo ? <div className="subtotal"><span>Total</span><strong>{formatAud(total)}</strong></div> : null}<div className="promo"><input value={code} onChange={event => { setCode(event.target.value.toUpperCase()); setAppliedPromo(null); }} placeholder="Promo code"/><button onClick={applyPromo} disabled={saving}>{saving ? "…" : "Apply"}</button></div>{promoMessage && <p className="promo-message">{promoMessage}</p>}{!paymentEnabled ? <p className="promo-message">Online payment is currently paused. You can submit the order now and payment will be confirmed manually.</p> : null}<div className="trust-row"><span>◈ Insured delivery</span><span>◈ Lifetime warranty</span><span>◈ {paymentEnabled ? "Secure checkout" : "Manual payment confirmation"}</span></div><Link className="button" style={{ marginTop: 22, width: "100%" }} href="/checkout">{paymentEnabled ? "Continue to checkout" : "Continue to order request"}</Link></aside></main>;
}
