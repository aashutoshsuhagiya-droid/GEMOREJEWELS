import Link from "next/link";
import { CurrencyRatesIndicator, CurrencyRegionLabel } from "@/components/commerce/currency-store";
import { FooterNewsletter } from "@/components/layout/footer-newsletter";

const groups = [
  { title: "Shop", links: ["Engagement rings", "Wedding rings", "Fine jewellery", "Ready-to-ship"] },
  { title: "About us", links: ["Our story", "Diamond origins", "Our ateliers", "Journal"] },
  { title: "Client care", links: ["Shipping & returns", "Lifetime warranty", "Ring sizing", "FAQs"] },
  { title: "Support", links: ["Contact us", "Book an appointment", "Privacy Policy", "Terms & Conditions"] },
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
              {["IG", "TT", "FB", "YT", "P", "in"].map((s) => (
                <a key={s} href="#top" aria-label={s} className="footer-social">{s}</a>
              ))}
            </div>
          </div>
          {groups.map((group) => (
            <div key={group.title}>
              <h4>{group.title}</h4>
              <div className="footer-links">
                {group.links.map((link) => (
                  <Link
                    key={link}
                    href={
                      link.includes("Our story")
                        ? "/about"
                        : link.includes("Journal")
                          ? "/blog"
                          : link.includes("FAQ")
                            ? "/faq"
                            : link.includes("appointment")
                              ? "/showroom"
                              : link.includes("Privacy")
                                ? "/privacy"
                                : link.includes("Terms")
                                  ? "/terms"
                                  : "/collections/engagement"
                    }
                  >
                    {link}
                  </Link>
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
            <span>Privacy · Terms</span>
            <span>© 2026 GEMOIREJEWELSLLP</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
