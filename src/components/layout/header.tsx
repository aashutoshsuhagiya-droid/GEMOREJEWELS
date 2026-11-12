"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { AnnouncementBar } from "./announcement-bar";
import { CartDrawer } from "@/components/commerce/cart-drawer";
import { useCart } from "@/components/commerce/cart-store";

const nav = ["Ready-to-Ship", "Engagement", "Wedding", "Fine Jewelry", "Education", "Contact"];
const navHref: Record<string, string> = { "Ready-to-Ship": "/collections/ready-to-ship", Engagement: "/collections/engagement", Wedding: "/collections/wedding", "Fine Jewelry": "/collections/fine-jewelry", Education: "/faq", Contact: "/showroom" };
export type HeaderCollection = { id: string; name: string; slug: string };
export type HeaderFeature = { slug: string; name: string; image: string; priceAud: number };

function Logo() { return <Link className="logo" href="/" aria-label="GEMOIREJEWELSLLP home"><span className="logo-main">GEMOIRE</span><span className="logo-sub">JEWELS LLP</span></Link>; }

export function MegaMenu({ open, collections, featured }: { open: boolean; collections: HeaderCollection[]; featured?: HeaderFeature }) {
  return <div className={`mega ${open ? "open" : ""}`}><div className="shell mega-grid"><div><h4>Shop by metal</h4><div className="mega-list"><Link href="/collections/engagement">Platinum</Link><Link href="/collections/engagement">Yellow Gold</Link><Link href="/collections/engagement">Rose Gold</Link><Link href="/collections/engagement">White Gold</Link></div></div><div><h4>Collections</h4><div className="mega-list">{collections.map(collection => <Link href={`/collections/${collection.slug}`} key={collection.id}>{collection.name}</Link>)}</div></div><div><h4>Guidance</h4><div className="mega-list"><Link href="/faq">Diamond education</Link><Link href="/faq">Our craft promise</Link><Link href="/showroom">Book an appointment</Link><Link href="/">Find your setting</Link></div></div>{featured ? <Link href={`/products/${featured.slug}`} className="featured-menu-card"><Image src={featured.image} alt={featured.name} width={600} height={500}/><div><span className="label">Featured</span><br/>{featured.name} · AUD ${featured.priceAud.toLocaleString("en-AU")}</div></Link> : null}</div></div>;
}

export function Header({ collections = [], featured }: { collections?: HeaderCollection[]; featured?: HeaderFeature }) {
  const [menu, setMenu] = useState(false); const [mega, setMega] = useState(false); const [scrolled, setScrolled] = useState(false); const { count, setOpen } = useCart();
  useEffect(() => { const listen = () => setScrolled(window.scrollY > 8); listen(); window.addEventListener("scroll", listen); return () => window.removeEventListener("scroll", listen); }, []);
  return <><AnnouncementBar/><header className={`site-header ${scrolled ? "scrolled" : ""}`} onMouseLeave={() => setMega(false)}><div className="shell header-inner"><div className="desktop-nav desktop-only">{nav.map(item => ["Engagement", "Wedding", "Fine Jewelry", "Education"].includes(item) ? <Link className="nav-button" href={navHref[item]} onMouseEnter={() => setMega(true)} onFocus={() => setMega(true)} key={item}>{item}</Link> : <Link key={item} href={navHref[item]}>{item}</Link>)}</div><div className="mobile-only"><button className="hamburger" aria-label="Open menu" onClick={() => setMenu(true)}><span/><span/></button></div><Logo/><div className="header-actions"><Link className="icon-link" href="/collections/engagement" aria-label="Search">⌕</Link><Link className="icon-link account-link" href="/account">Account</Link><button className="cart-trigger" aria-label="Open cart" onClick={() => setOpen(true)}>Bag <span className="cart-badge">{count}</span></button></div></div><MegaMenu open={mega} collections={collections} featured={featured}/></header><MobileMenu open={menu} collections={collections} onClose={() => setMenu(false)}/><CartDrawer /></>;
}

export function MobileMenu({ open, collections, onClose }: { open: boolean; collections: HeaderCollection[]; onClose: () => void }) {
  return <aside className={`mobile-menu ${open ? "open" : ""}`} aria-hidden={!open}><div className="mobile-menu-top"><Logo/><button className="mobile-menu-close" onClick={onClose} aria-label="Close menu">×</button></div><input className="mobile-search" aria-label="Search products" placeholder="Search diamonds and settings"/><nav>{["Ready-to-Ship", "Engagement", "Wedding", "Fine Jewelry", "Education"].map(item => <details key={item}><summary>{item}</summary><Link onClick={onClose} href={navHref[item]}>Shop {item}</Link><Link onClick={onClose} href="/faq">Explore the guide</Link></details>)}{collections.length ? <details><summary>Collections</summary>{collections.map(collection => <Link onClick={onClose} href={`/collections/${collection.slug}`} key={collection.id}>{collection.name}</Link>)}</details> : null}</nav><span className="region-select">Region: Australia (AUD) · Change</span></aside>;
}
