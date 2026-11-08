"use client";

import { createContext, useContext, useMemo, useState } from "react";
import type { Product } from "@/data/products";

export type CartItem = Pick<Product, "slug" | "name" | "image" | "audPrice" | "metal" | "carat"> & { quantity: number };
export type CartPromotion = { code: string; type: "percentage" | "fixed" | "shipping"; value: number; amount: number; shippingFree: boolean };
type CartContextValue = { items: CartItem[]; promotion: CartPromotion | null; isOpen: boolean; addItem: (product: Product) => void; updateQuantity: (slug: string, quantity: number) => void; removeItem: (slug: string) => void; clear: () => void; setPromotion: (promotion: CartPromotion | null) => void; setOpen: (open: boolean) => void; count: number; subtotal: number };
const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [promotion, setPromotion] = useState<CartPromotion | null>(null);
  const [isOpen, setOpen] = useState(false);
  const value = useMemo<CartContextValue>(() => ({
    items, promotion, isOpen, setOpen, setPromotion,
    count: items.reduce((total, item) => total + item.quantity, 0),
    subtotal: items.reduce((total, item) => total + item.audPrice * item.quantity, 0),
    addItem: (product) => { setItems(current => { const found = current.find(item => item.slug === product.slug); return found ? current.map(item => item.slug === product.slug ? { ...item, quantity: item.quantity + 1 } : item) : [...current, { slug: product.slug, name: product.name, image: product.image, audPrice: product.audPrice, metal: product.metal, carat: product.carat, quantity: 1 }]; }); setPromotion(null); setOpen(true); },
    updateQuantity: (slug, quantity) => { setItems(current => quantity <= 0 ? current.filter(item => item.slug !== slug) : current.map(item => item.slug === slug ? { ...item, quantity } : item)); setPromotion(null); },
    removeItem: slug => { setItems(current => current.filter(item => item.slug !== slug)); setPromotion(null); },
    clear: () => { setItems([]); setPromotion(null); setOpen(false); }
  }), [items, promotion, isOpen]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
export function useCart() { const context = useContext(CartContext); if (!context) throw new Error("useCart must be within CartProvider"); return context; }
