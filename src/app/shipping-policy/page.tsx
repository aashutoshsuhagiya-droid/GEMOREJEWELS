import type { Metadata } from "next";
import { jsonLdForPath, metadataForPath, serializeJsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

const sections = [
  {
    title: "Order processing",
    body: "Every Gemoire piece is made to order. Once your order is placed, our ateliers begin crafting your jewellery within 1–2 business days. Custom or engraved items may take 3–5 business days before dispatch.",
  },
  {
    title: "Dispatch & delivery",
    body: "Orders are shipped via fully insured, trackable courier. Domestic deliveries typically arrive within 3–7 business days. International orders are delivered within 7–14 business days, depending on customs clearance in your country.",
  },
  {
    title: "Shipping charges",
    body: "Complimentary insured shipping is included on all orders within India. For international orders, shipping charges are calculated at checkout based on destination and declared value. All applicable duties, taxes, or customs fees are the responsibility of the recipient.",
  },
  {
    title: "Tracking your order",
    body: "You will receive a dispatch confirmation email with a tracking number once your order ships. You can use this to monitor its journey in real time. If you have not received tracking information within 3 business days of dispatch, please contact us.",
  },
  {
    title: "Delivery instructions",
    body: "For high-value items, a signature is required upon delivery. Please ensure someone is available to receive the package. If delivery fails after two attempts, the item will be held at the nearest courier depot for 7 days before being returned to us.",
  },
  {
    title: "Delivery issues",
    body: "In the unlikely event that your item arrives damaged or incorrect, please photograph the packaging and contents and contact us within 48 hours. We will arrange a replacement or full refund at no additional cost to you.",
  },
  {
    title: "Address changes",
    body: "Address changes can only be made before an order is dispatched. Once shipped, we are unable to redirect packages. Please double-check your delivery address at checkout.",
  },
];

export function generateMetadata(): Metadata {
  return metadataForPath("/shipping-policy", "Shipping Policy — GEMOIREJEWELSLLP", "Learn about Gemoire's shipping, dispatch, and delivery timelines for fine jewellery orders.");
}

export default function ShippingPolicyPage() {
  const structuredData = jsonLdForPath("/shipping-policy");
  return (
    <main>
      <section className="section-oatmeal" style={{ paddingBlock: "48px 0" }}>
        <div className="shell">
          <p className="breadcrumb" style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--cullen-muted)", marginBottom: 12 }}>
            Home / Policies / Shipping
          </p>
          <h1 style={{ fontSize: "clamp(1.9rem, 3.2vw, 2.75rem)", fontFamily: "var(--display)", fontWeight: 350, letterSpacing: "-0.025em", lineHeight: 1.12, margin: "0 0 12px" }}>
            Shipping Policy
          </h1>
          <p className="lede" style={{ maxWidth: 580 }}>
            Every Gemoire piece is dispatched with care, fully insured and trackable. Here is everything you need to know about how your jewellery reaches you.
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
