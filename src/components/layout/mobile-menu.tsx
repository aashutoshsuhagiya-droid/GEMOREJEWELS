"use client";

import type { HeaderCollection } from "@/components/layout/header";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  collections: HeaderCollection[];
}

const nav = ["Sale", "Ready-to-Ship", "Engagement Rings", "Wedding Rings", "Jewelry", "Ring Styles", "Loose Stones", "Gifts"];
const navHref: Record<string, string> = { Sale: "/collections/sale", "Ready-to-Ship": "/collections/ready-to-ship", "Engagement Rings": "/collections/engagement", "Wedding Rings": "/collections/wedding", Jewelry: "/collections/fine-jewelry", "Ring Styles": "/ring-styles", "Loose Stones": "/collections/loose-stones", Gifts: "/collections/gifts" };

export function MobileMenu({ open, onClose, collections }: MobileMenuProps) {
  return (
    <>
      {open ? <div className="mobile-menu-backdrop" onClick={onClose} aria-hidden="true" /> : null}
      <aside
        className={`mobile-menu ${open ? "open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation menu"
        aria-hidden={!open}
        onKeyDown={(event) => {
          if (event.key === "Escape") onClose();
        }}
      >
        <div className="mobile-menu-top">
          <div className="logo">
            <span className="logo-main">GEMOIRE</span>
            <span className="logo-sub">Jewels that hold time</span>
          </div>
          <button
            className="mobile-menu-close"
            onClick={onClose}
            aria-label="Close menu"
            style={{ minHeight: 44, minWidth: 44, display: "inline-flex", alignItems: "center", justifyContent: "center" }}
          >
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
        <div className="mobile-currency-row">
          {/* CurrencySelector will render here via the parent */}
        </div>
      </aside>
    </>
  );
}
