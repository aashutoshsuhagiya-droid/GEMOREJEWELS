import Link from "next/link";
import { CurrencyRatesIndicator, CurrencyRegionLabel } from "@/components/commerce/currency-store";
import { FooterNewsletter } from "@/components/layout/footer-newsletter";

const groups = [
  { title: "Shop", links: [
      { label: "Engagement rings", href: "/collections/engagement" },
      { label: "Wedding rings", href: "/collections/wedding" },
      { label: "Fine jewellery", href: "/collections/fine-jewellery" },
      { label: "Ring styles", href: "/ring-styles" },
      { label: "Ready-to-ship", href: "/collections/ready-to-ship" },
    ]
  },
  { title: "About us", links: [
      { label: "Our story", href: "/about" },
      { label: "Diamond origins", href: "/about#origins" },
      { label: "Our ateliers", href: "/about#ateliers" },
      { label: "Journal", href: "/blog" },
    ]
  },
  { title: "Client care", links: [
      { label: "Shipping Policy", href: "/shipping-policy" },
      { label: "Returns & exchanges", href: "/return-exchange-policy" },
      { label: "Ring sizing", href: "/ring-sizing" },
      { label: "FAQs", href: "/faq" },
    ]
  },
  { title: "Policies", links: [
      { label: "Payment Policy", href: "/payment-policy" },
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms of Service", href: "/terms-of-service" },
      { label: "Contact us", href: "/contact" },
    ]
  },
];

export function Footer() {
  return (
    <footer className="footer">
      <div className="shell">
        <div className="footer-newsletter">
          <h3>Join the Club</h3>
          <FooterNewsletter />
        </div>
        <div className="footer-grid">
          <div>
            <div className="logo">
              <span className="logo-main">GEMOIRE</span>
              <span className="logo-sub">Jewels that hold time</span>
            </div>
            <p>Fine jewellery with a considered point of view, made for the moments you carry forward.</p>
            <div className="footer-socials">
              {["IG", "TT", "FB", "YT", "P", "in"].map((s, idx) => {
                const labels = ["Instagram", "TikTok", "Facebook", "YouTube", "Pinterest", "LinkedIn"];
                return <a key={s} href="#top" aria-label={labels[idx]} className="footer-social">{s}</a>;
              })}
            </div>
          </div>
          {groups.map((group) => (
            <div key={group.title}>
              <h4>{group.title}</h4>
              <div className="footer-links">
                {group.links.map((link) => (
                  <Link key={link.label} href={link.href}>{link.label}</Link>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="footer-bottom">
          <div className="footer-payments">
            <span className="payment-pill">Visa</span>
            <span className="payment-pill">Mastercard</span>
            <span className="payment-pill">Amex</span>
            <span className="payment-pill">PayPal</span>
          </div>
          <div className="footer-legal">
            <span>Secure checkout · SSL encrypted</span>
            <CurrencyRegionLabel />
            <CurrencyRatesIndicator />
            <span>Shipping · Returns · Payment · Privacy · Terms</span>
            <span>© 2026 GEMOIREJEWELSLLP</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
