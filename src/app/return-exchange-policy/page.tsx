import type { Metadata } from "next";
import { jsonLdForPath, metadataForPath, serializeJsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

const sections = [
  {
    title: "Our commitment",
    body: "We stand behind every Gemoire creation. If your piece is not exactly as described or is faulty, we will make it right — promptly and without dispute. This policy covers all purchases made directly through gemoire.com and our authorised channels.",
  },
  {
    title: "Returns window",
    body: "You may return an unworn, undamaged item within 30 calendar days of delivery for a full refund or exchange. Items must be returned in their original packaging with all certificates, documentation, and accessories intact.",
  },
  {
    title: "Condition requirements",
    body: "Returned items must be in the same condition as received. This means no signs of wear, alteration, resizing, or damage. For engagement rings and custom pieces, any resizing or engraving voids the return window unless the work was performed by Gemoire and resulted in a defect.",
  },
  {
    title: "How to initiate a return",
    body: "To start a return, contact our client care team at care@gemoire.com with your order number and a brief description of the issue. We will respond within one business day with a prepaid return label and instructions.",
  },
  {
    title: "Refund timeline",
    body: "Once we receive and inspect your return, we process your refund within 3–5 business days. The refund is issued to the original payment method. Please allow an additional 5–10 business days for the funds to appear in your account, depending on your bank or card issuer.",
  },
  {
    title: "Exchanges",
    body: "If you would like to exchange your item for a different size, style, or metal, we will facilitate this at no additional shipping cost. Any price difference will be charged or refunded accordingly. Custom exchanges may take 2–4 weeks for production.",
  },
  {
    title: "Custom & personalised orders",
    body: "Made-to-order and personalised pieces — including engraved items, bespoke designs, and lab-grown diamond selections — are non-returnable unless there is a manufacturing defect or the item is materially different from your confirmed specification.",
  },
  {
    title: "Damaged or incorrect items",
    body: "If your order arrives damaged or you receive an incorrect item, please notify us within 48 hours of delivery with photographic evidence. We will arrange an immediate replacement at no charge and cover return shipping for the original item.",
  },
  {
    title: "Return shipping",
    body: "For standard returns within the return window, we cover return shipping costs. For returns outside the 30-day window, or for items that fail our condition inspection, return shipping costs may be deducted from your refund.",
  },
  {
    title: "Contact us",
    body: "Our client care team is available Monday–Saturday, 10:00 AM – 7:00 PM IST. Email: care@gemoire.com | Phone: +91-XXXXX-XXXXX. We are here to help with any questions about returns, exchanges, or your order.",
  },
];

export function generateMetadata(): Metadata {
  return metadataForPath("/return-exchange-policy", "Return & Exchange Policy — GEMOIREJEWELSLLP", "Gemoire's 30-day return and exchange policy for fine jewellery. Easy returns, lifetime warranty on craftsmanship.");
}

export default function ReturnExchangePolicyPage() {
  const structuredData = jsonLdForPath("/return-exchange-policy");
  return (
    <main>
      <section className="section-oatmeal" style={{ paddingBlock: "48px 0" }}>
        <div className="shell">
          <p className="breadcrumb" style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--cullen-muted)", marginBottom: 12 }}>
            Home / Policies / Returns & Exchanges
          </p>
          <h1 style={{ fontSize: "clamp(1.9rem, 3.2vw, 2.75rem)", fontFamily: "var(--display)", fontWeight: 350, letterSpacing: "-0.025em", lineHeight: 1.12, margin: "0 0 12px" }}>
            Returns & Exchange Policy
          </h1>
          <p className="lede" style={{ maxWidth: 580 }}>
            We want you to love your Gemoire piece. If it is not right, we will make it right. Our return and exchange process is simple, transparent, and designed with your peace of mind.
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
