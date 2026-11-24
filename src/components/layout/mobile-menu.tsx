"use client";

import { useRef } from "react";
import { useDialogFocus } from "@/components/admin/use-dialog-focus";
import type { HeaderCollection } from "@/components/layout/header";
import { CurrencySelector } from "./currency-selector";
import { useScrollLock } from "./use-scroll-lock";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  collections: HeaderCollection[];
}

const nav = ["Sale", "Ready-to-Ship", "Engagement Rings", "Wedding Rings", "Jewelry", "Ring Styles", "Loose Stones", "Gifts"];
const navHref: Record<string, string> = { Sale: "/collections/sale", "Ready-to-Ship": "/collections/ready-to-ship", "Engagement Rings": "/collections/engagement", "Wedding Rings": "/collections/wedding", Jewelry: "/collections/fine-jewelry", "Ring Styles": "/ring-styles", "Loose Stones": "/collections/loose-stones", Gifts: "/collections/gifts" };

export function MobileMenu({ open, onClose }: MobileMenuProps) {
  const menuRef = useRef<HTMLElement>(null);
  // Escape is handled at document level (focus starts on the hamburger, outside the
  // menu), focus moves into the menu and returns to the hamburger on close.
  useDialogFocus(menuRef, onClose, open);
  useScrollLock(open);

  return (
    <>
      {open ? <div className="mobile-menu-backdrop" onClick={onClose} aria-hidden="true" /> : null}
      <aside
        ref={menuRef}
        className={`mobile-menu ${open ? "open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation menu"
        aria-hidden={!open}
      >
        <div className="mobile-menu-top">
          <div className="logo">
            <span className="logo-main">GEMOIRE</span>
            <span className="logo-sub">Jewels that hold time</span>
          </div>
          <button className="mobile-menu-close" onClick={onClose} aria-label="Close menu">
            &times;
          </button>
        </div>
        <input className="mobile-search" aria-label="Search products" placeholder="Search diamonds and settings" />
        <nav>
          {nav.map((item) => (
            <details key={item}>
              <summary>{item}</summary>
              <a onClick={onClose} href={navHref[item]}>
                Shop {item}
              </a>
            </details>
          ))}
          <details>
            <summary>Client care</summary>
            <a onClick={onClose} href="/faq">FAQs</a>
            <a onClick={onClose} href="/showroom">Showroom appointments</a>
          </details>
        </nav>
        <div className="mobile-menu-contact">
          <a onClick={onClose} href="tel:+918849760876">Call +91 884 976 0876</a>
          <a onClick={onClose} href="/contact">Contact us</a>
          <a onClick={onClose} href="/account">Account</a>
        </div>
        <div className="mobile-currency-row">
          <CurrencySelector mobile />
        </div>
      </aside>
    </>
  );
}
