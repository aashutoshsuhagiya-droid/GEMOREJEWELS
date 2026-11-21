import type { Metadata } from "next";
import { jsonLdForPath, metadataForPath, serializeJsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

const sections = [
  {
    title: "Acceptance of terms",
    body: 'By accessing or using any service, product, or content provided by GEMOIREJEWELSLLP ("Gemoire", "we", "our", "us"), you agree to be bound by these Terms of Service. If you do not agree, please do not use our website or purchase our products.',
  },
  {
    title: "Products & descriptions",
    body: "We make every effort to display our products and their characteristics — including colour, clarity, carat weight, metal type, and dimensions — as accurately as possible. However, slight variations may occur due to screen calibration, photography, and the natural uniqueness of gemstones and precious metals.",
  },
  {
    title: "Pricing & payment",
    body: "All prices displayed on our website are in Indian Rupees (INR) unless otherwise stated, and include applicable taxes. Prices are subject to change without prior notice. We reserve the right to refuse or cancel any order placed at an incorrectly displayed price.",
  },
  {
    title: "Account & eligibility",
    body: "You must be at least 18 years of age to make a purchase from our website. By placing an order, you confirm that the information you provide is accurate and complete. You are responsible for maintaining the confidentiality of your account credentials.",
  },
  {
    title: "Intellectual property",
    body: "All content on this website — including text, graphics, logos, images, video clips, and software — is the property of GEMOIREJEWELSLLP or its licensors and is protected by copyright, trademark, and other intellectual property laws. Unauthorized use is strictly prohibited.",
  },
  {
    title: "User conduct",
    body: "You agree not to use our website for any unlawful purpose, or in any way that could damage, disable, or impair the website or interfere with any other party's use and enjoyment of it. We reserve the right to terminate your access for any violation of these terms.",
  },
  {
    title: "Limitation of liability",
    body: "To the fullest extent permitted by law, Gemoire shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of, or inability to use, the website or its content. Our total liability shall not exceed the amount you paid for the product giving rise to the claim.",
  },
  {
    title: "Governing law",
    body: "These Terms of Service are governed by and construed in accordance with the laws of India. Any disputes arising from these terms or your use of our website shall be subject to the exclusive jurisdiction of the courts in Jaipur, Rajasthan.",
  },
  {
    title: "Changes to terms",
    body: "We may revise these Terms of Service at any time by updating this page. Continued use of our website following any changes constitutes acceptance of the revised terms. We encourage you to review this page periodically.",
  },
];

export function generateMetadata(): Metadata {
  return metadataForPath("/terms-of-service", "Terms of Service — GEMOIREJEWELSLLP", "Gemoire's terms of service governing use of our website and purchase of fine jewellery.");
}

export default function TermsOfServicePage() {
  const structuredData = jsonLdForPath("/terms-of-service");
  return (
    <main>
      <section className="section-oatmeal" style={{ paddingBlock: "48px 0" }}>
        <div className="shell">
          <p className="breadcrumb" style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--cullen-muted)", marginBottom: 12 }}>
            Home / Policies / Terms of Service
          </p>
          <h1 style={{ fontSize: "clamp(1.9rem, 3.2vw, 2.75rem)", fontFamily: "var(--display)", fontWeight: 350, letterSpacing: "-0.025em", lineHeight: 1.12, margin: "0 0 12px" }}>
            Terms of Service
          </h1>
          <p className="lede" style={{ maxWidth: 580 }}>
            By using our website and services, you agree to the following terms. Please read them carefully.
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
