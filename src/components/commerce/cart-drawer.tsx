"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { formatAud } from "@/data/products";
import { useCart } from "./cart-store";

export function CartDrawer() {
  const { items, isOpen, setOpen, updateQuantity, removeItem, subtotal } = useCart();
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(40);
  useEffect(() => { if (!isOpen) return; fetch("/api/storefront/settings").then(response => response.ok ? response.json() : null).then(data => { if (typeof data?.freeShippingThreshold === "number") setFreeShippingThreshold(data.freeShippingThreshold); }).catch(() => undefined); }, [isOpen]);
  const remaining = Math.max(0, freeShippingThreshold - subtotal);
  const progress = Math.min(100, Math.round((subtotal / Math.max(1, freeShippingThreshold)) * 100));
  return <aside className={`cart-drawer ${isOpen ? "open" : ""}`} aria-label="Shopping cart"><div className="drawer-head"><h2>Your bag</h2><button className="close-drawer" onClick={() => setOpen(false)} aria-label="Close cart">×</button></div><div className="cart-lines">{items.length === 0 ? <p className="empty-state">Your bag is ready for a lifetime moment.</p> : items.map(item => <div className="cart-line" key={item.slug}><Image src={item.image} alt="Placeholder product thumbnail" width={170} height={170}/><div><h3>{item.name}</h3><p>{item.carat} · {item.metal}</p><strong>{formatAud(item.audPrice)}</strong><div className="qty-row"><button onClick={() => updateQuantity(item.slug, item.quantity - 1)} aria-label="Decrease quantity">−</button><span>{item.quantity}</span><button onClick={() => updateQuantity(item.slug, item.quantity + 1)} aria-label="Increase quantity">+</button><button className="remove-button" onClick={() => removeItem(item.slug)}>Remove</button></div></div></div>)}</div><div className="drawer-bottom"><div className="subtotal"><span>Subtotal</span><strong>{formatAud(subtotal)}</strong></div><div className="shipping-progress">{remaining > 0 ? `You're ${formatAud(remaining)} from free express delivery` : "Your order includes free express delivery"}<div className="progress-bar"><span style={{ width: `${progress}%` }}/></div></div><div className="drawer-actions"><Link href="/cart" onClick={() => setOpen(false)} className="button button-outline button-small">View cart</Link><Link href="/checkout" onClick={() => setOpen(false)} className="button button-small">Checkout</Link></div></div></aside>;
}
