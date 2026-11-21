import type { Metadata } from "next";
import { jsonLdForPath, metadataForPath, serializeJsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

const sections = [
  {
    title: "Accepted payment methods",
    body: "We accept all major credit and debit cards — including Visa, Mastercard, American Express, and RuPay — as well as UPI, net banking, PayPal, and EMI options through select banking partners. All transactions are processed in Indian Rupees (INR).",
  },
  {
    title: "Payment security",
    body: "Every transaction on gemoire.com is secured with 256-bit SSL encryption. We use PCI-DSS compliant payment gateways to ensure your financial data is protected at every step of the checkout process. We never store your complete card details on our servers.",
  },
  {
    title: "Order confirmation",
    body: "Once your payment is successfully processed, you will receive an order confirmation email containing your order number, item details, and estimated delivery timeline. Please save this email for future reference and any support requests.",
  },
  {
    title: "Payment authorisation & holds",
    body: "A payment authorisation hold may be placed on your card at the time of order. This is not a charge — it is a temporary hold to verify funds availability. The hold is released or converted to a charge once the order is processed. In case of cancellation, any hold is released within 5–10 business days.",
  },
  {
    title: "EMI & financing options",
    body: "We partner with leading banks and NBFCs to offer No Cost EMI and low-interest EMI plans on select purchases. EMI availability and tenure options are displayed at checkout. Approval is subject to the lending partner's eligibility criteria.",
  },
  {
    title: "Failed payments",
    body: "If your payment fails, please verify your card details, available balance, and network connectivity. You may retry with an alternative payment method. For persistent issues, contact our support team or your bank for clarification.",
  },
  {
    title: "Refunds",
    body: "Approved refunds are issued back to the original payment method within 3–5 business days of processing. The time taken for the refund to reflect in your account depends on your bank or card issuer, typically 5–10 additional business days.",
  },
  {
    title: "International payments",
    body: "International customers may incur additional charges from their bank or card issuer for currency conversion or cross-border transaction fees. These charges are beyond our control and are the responsibility of the cardholder.",
  },
];

export function generateMetadata(): Metadata {
  return metadataForPath("/payment-policy", "Payment Policy — GEMOIREJEWELSLLP", "Secure payment options, EMI plans, and payment processing details for Gemoire fine jewellery orders.");
}

export default function PaymentPolicyPage() {
  const structuredData = jsonLdForPath("/payment-policy");
  return (
    <main>
      <section className="section-oatmeal" style={{ paddingBlock: "48px 0" }}>
        <div className="shell">
          <p className="breadcrumb" style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--cullen-muted)", marginBottom: 12 }}>
            Home / Policies / Payment Policy
          </p>
          <h1 style={{ fontSize: "clamp(1.9rem, 3.2vw, 2.75rem)", fontFamily: "var(--display)", fontWeight: 350, letterSpacing: "-0.025em", lineHeight: 1.12, margin: "0 0 12px" }}>
            Payment Policy
          </h1>
          <p className="lede" style={{ maxWidth: 580 }}>
            Every Gemoire transaction is secure, transparent, and protected. Learn about our accepted payment methods, security measures, and what happens if your payment fails.
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
