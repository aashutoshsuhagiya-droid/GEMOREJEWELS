"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { AnnouncementBar } from "./announcement-bar";
import { CartDrawer } from "@/components/commerce/cart-drawer";
import { useCart } from "@/components/commerce/cart-store";
import { useCurrency } from "@/components/commerce/currency-store";
import { CurrencySelector } from "./currency-selector";
import { MobileMenu } from "./mobile-menu";

const nav = ["Sale", "Ready-to-Ship", "Engagement Rings", "Wedding Rings", "Jewelry", "Ring Styles", "Loose Stones", "Gifts"];
const navHref: Record<string, string> = { Sale: "/collections/sale", "Ready-to-Ship": "/collections/ready-to-ship", "Engagement Rings": "/collections/engagement", "Wedding Rings": "/collections/wedding", Jewelry: "/collections/fine-jewelry", "Ring Styles": "/ring-styles", "Loose Stones": "/collections/loose-stones", Gifts: "/collections/gifts" };
export type HeaderCollection = { id: string; name: string; slug: string };
export type HeaderFeature = { slug: string; name: string; image: string; priceUsd: number };

function Logo() { return <Link className="logo" href="/" aria-label="GEMOIRE home"><span className="logo-main">GEMOIRE</span><span className="logo-sub">Jewels that hold time</span></Link>; }

function ConciergeBellIcon() {
  return <svg className="header-phone-icon" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 18h16M12 5v2"/><path d="M5 18a7 7 0 0 1 14 0"/><circle cx="12" cy="4" r="1"/></svg>;
}

function SearchIcon() {
  return <svg className="header-search-icon" width="19" height="19" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>;
}

function HeaderPhone({ compact = false }: { compact?: boolean }) {
  return <a className={`header-phone${compact ? " header-phone-compact" : ""}`} href="tel:+918849760876" aria-label="Contact us at +91 884 976 0876"><ConciergeBellIcon/><span className="header-phone-label">Contact Us</span><span className="header-phone-number">+91 884 976 0876</span></a>;
}

export function MegaMenu({ open, collections, featured }: { open: boolean; collections: HeaderCollection[]; featured?: HeaderFeature }) {
  const { formatMoney } = useCurrency();
  return <div className={`mega ${open ? "open" : ""}`}><div className="shell mega-grid"><div><h4>Shop by metal</h4><div className="mega-list"><Link href="/collections/engagement">Platinum</Link><Link href="/collections/engagement">Yellow Gold</Link><Link href="/collections/engagement">Rose Gold</Link><Link href="/collections/engagement">White Gold</Link></div></div><div><h4>Collections</h4><div className="mega-list">{collections.map(collection => <Link href={`/collections/${collection.slug}`} key={collection.id}>{collection.name}</Link>)}</div></div><div><h4>Guidance</h4><div className="mega-list"><Link href="/faq">Diamond education</Link><Link href="/faq">Our craft promise</Link><Link href="/showroom">Book an appointment</Link><Link href="/">Find your setting</Link></div></div>{featured ? <Link href={`/products/${featured.slug}`} className="featured-menu-card"><Image src={featured.image} alt={featured.name} width={600} height={500}/><div><span className="label">Featured</span><br/>{featured.name} · {formatMoney(featured.priceUsd)}</div></Link> : null}</div></div>;
}

export function Header({ collections = [], featured }: { collections?: HeaderCollection[]; featured?: HeaderFeature }) {
  const [menu, setMenu] = useState(false); const [mega, setMega] = useState(false); const [scrolled, setScrolled] = useState(false); const { count, setOpen } = useCart();
  useEffect(() => { const listen = () => setScrolled(window.scrollY > 8); listen(); window.addEventListener("scroll", listen); return () => window.removeEventListener("scroll", listen); }, []);
  return <><AnnouncementBar/><header className={`site-header ${scrolled ? "scrolled" : ""}`} onMouseLeave={() => setMega(false)}><div className="shell header-inner"><div className="header-contact desktop-only"><HeaderPhone/><CurrencySelector/></div><div className="desktop-nav desktop-only">{nav.map(item => ["Engagement Rings", "Wedding Rings", "Jewelry"].includes(item) ? <Link className="nav-button" href={navHref[item]} onMouseEnter={() => setMega(true)} onFocus={() => setMega(true)} key={item}>{item}</Link> : <Link key={item} href={navHref[item]} onMouseEnter={() => setMega(false)} onFocus={() => setMega(false)}>{item}</Link>)}</div><div className="mobile-only header-mobile-left"><button className="hamburger" aria-label="Open menu" onClick={() => setMenu(true)}><span/><span/></button><HeaderPhone compact/></div><Logo/><div className="header-actions"><Link className="icon-link" href="/collections/engagement" aria-label="Search"><SearchIcon/></Link><Link className="icon-link account-link" href="/account">Account</Link><button className="cart-trigger" aria-label="Open shopping bag" onClick={() => setOpen(true)}>Bag <span className="cart-badge">{count}</span></button></div></div><MegaMenu open={mega} collections={collections} featured={featured}/></header><MobileMenu open={menu} collections={collections} onClose={() => setMenu(false)}/><CartDrawer /></>;
}

