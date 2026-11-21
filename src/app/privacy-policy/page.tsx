import type { Metadata } from "next";
import { jsonLdForPath, metadataForPath, serializeJsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

const sections = [
  {
    title: "Information we collect",
    body: "We collect personal information that you voluntarily provide when placing an order, creating an account, subscribing to our newsletter, or contacting our support team. This includes your name, email address, phone number, shipping address, and payment information.",
  },
  {
    title: "How we use your information",
    body: "We use your personal data to process orders, communicate order status, provide customer support, send updates about your purchases, and — with your consent — share news and offers from Gemoire. We do not sell your personal data to third parties.",
  },
  {
    title: "Payment information",
    body: "All payment transactions are processed through secure, PCI-DSS compliant payment gateways. We do not store your full credit or debit card details on our servers. Payment information is encrypted and handled exclusively by our trusted payment partners.",
  },
  {
    title: "Cookies & tracking",
    body: "We use cookies and similar technologies to enhance your browsing experience, personalise content and ads, provide social media features, and analyse our traffic. You can manage or disable cookies through your browser settings at any time.",
  },
  {
    title: "Data sharing & third parties",
    body: "We share your information only with trusted service providers who assist us in operating our website, processing payments, delivering orders, and providing customer support. All third parties are bound by strict data protection obligations.",
  },
  {
    title: "Data security",
    body: "We implement industry-standard security measures — including encryption, secure servers, and regular security audits — to protect your personal data. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.",
  },
  {
    title: "Your rights",
    body: "You have the right to access, correct, update, or request deletion of your personal data. To exercise any of these rights, contact us at privacy@gemoire.com. We will respond to all requests within 30 days.",
  },
  {
    title: "Data retention",
    body: "We retain your personal data only as long as necessary to fulfil the purposes for which it was collected, including to satisfy legal, accounting, or reporting requirements. When your data is no longer needed, it will be securely deleted or anonymised.",
  },
  {
    title: "Changes to this policy",
    body: "We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. Any updates will be posted on this page with an updated effective date. Your continued use of our services after any changes constitutes acceptance of the revised policy.",
  },
  {
    title: "Contact us",
    body: "For questions, concerns, or requests regarding this Privacy Policy, please contact our privacy team at privacy@gemoire.com or write to us at: GEMOIREJEWELSLLP, [Registered Office Address], Jaipur, Rajasthan, India.",
  },
];

export function generateMetadata(): Metadata {
  return metadataForPath("/privacy-policy", "Privacy Policy — GEMOIREJEWELSLLP", "How Gemoire collects, uses, and protects your personal information. Your privacy matters to us.");
}

export default function PrivacyPolicyPage() {
  const structuredData = jsonLdForPath("/privacy-policy");
  return (
    <main>
      <section className="section-oatmeal" style={{ paddingBlock: "48px 0" }}>
        <div className="shell">
          <p className="breadcrumb" style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--cullen-muted)", marginBottom: 12 }}>
            Home / Policies / Privacy Policy
          </p>
          <h1 style={{ fontSize: "clamp(1.9rem, 3.2vw, 2.75rem)", fontFamily: "var(--display)", fontWeight: 350, letterSpacing: "-0.025em", lineHeight: 1.12, margin: "0 0 12px" }}>
            Privacy Policy
          </h1>
          <p className="lede" style={{ maxWidth: 580 }}>
            At Gemoire, your privacy is as precious as the jewellery we create. This policy outlines how we collect, use, and protect your personal information.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="shell" style={{ maxWidth: 760 }}>
          {sections.map((s, i) => (
            <details key={s.title} style={{ borderBottom: "1px solid var(--cullen-border)", paddingBlock: 20 }} open={i === 0}>
              <summary style={{ fontSize: 15, fontWeight: 500, color: "var(--cullen-charcoal)", cursor: "pointer", listStyle: "none", display: "flex", justifyContent: "space-between", alignItems: "center", padding: 0, margin: 0 }}>
                <span>{s.title}</span>
                <span style={{ color: "var(--cullen-forest)", fontSize: 22, fontWeight: 300, marginLeft: 16, flexShrink: 0 }}>+</span>
              </summary>
              <p style={{ color: "var(--cullen-muted)", fontSize: 14, lineHeight: 1.7, margin: "14px 0 0" }}>{s.body}</p>
            </details>
          ))}
        </div>
      </section>

      {structuredData && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(structuredData) }} />
      )}
    </main>
  );
}
