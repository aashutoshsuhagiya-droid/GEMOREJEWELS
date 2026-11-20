import Link from "next/link";
import { adminRepository } from "@/lib/admin-repository";
import type { Discount } from "@/shared/admin-types";

type OfferIcon = "percent" | "delivery" | "warranty";

function OfferIcon({ type }: { type: OfferIcon }) {
  return (
    <span className="value-icon-shell" aria-hidden="true">
      <svg className="line-icon" fill="none" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
        {type === "percent" ? (
          <>
            <circle cx="8" cy="16" r="2.6" />
            <circle cx="16" cy="8" r="2.6" />
            <path d="m19.2 4.8-14.4 14.4" />
          </>
        ) : type === "delivery" ? (
          <>
            <path d="M3 7h11v9H3z" />
            <path d="M14 10h4l3 3v3h-7z" />
            <path d="M6.5 18.5a1.8 1.8 0 1 0 3.6 0M16 18.5a1.8 1.8 0 1 0 3.6 0" />
          </>
        ) : (
          <>
            <path d="M12 3 20 6v5c0 4.6-3.3 8-8 9.8C7.3 19 4 15.6 4 11V6l8-3Z" />
            <path d="m8.6 11.4 2.1 2.1 4.5-4.6" />
          </>
        )}
      </svg>
    </span>
  );
}

export function GemoireSpecials() {
  const activeDiscounts = adminRepository.list("discounts").filter(discount => discount.status === "active");
  const firstOrder = activeDiscounts.find(discount => discount.code.toUpperCase() === "GEMOIRE-10");
  const shipping = activeDiscounts.find(discount => discount.code.toUpperCase() === "SHIPWITHCARE");
  const validUntil = (discount?: Discount) =>
    discount ? new Date(`${discount.expiresAt}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : undefined;

  const offers: Array<{
    icon: OfferIcon;
    title: string;
    description: string;
    code?: string;
    validUntil?: string;
    note?: string;
    cta: string;
    href: string;
  }> = [
    {
      icon: "percent" as const,
      title: "10% off your first order",
      description: "A considered start — a little more room to say yes.",
      code: firstOrder?.code ?? "GEMOIRE-10",
      validUntil: validUntil(firstOrder),
      cta: "Shop the offer",
      href: "/collections/engagement",
    },
    {
      icon: "delivery" as const,
      title: "Complimentary express shipping",
      description: "Carefully packed, fully insured, and on us to your door.",
      code: shipping?.code ?? "SHIPWITHCARE",
      validUntil: validUntil(shipping),
      cta: "Shop free shipping",
      href: "/collections/ready-to-ship",
    },
    {
      icon: "warranty" as const,
      title: "Certificate + lifetime warranty",
      description: "Included with every Gemoire piece — no code needed.",
      code: undefined,
      validUntil: undefined,
      note: "Always included",
      cta: "See our promise",
      href: "/about",
    },
  ];

  return (
    <section className="section specials">
      <div className="shell">
        <div className="section-heading center">
          <p className="eyebrow">This season</p>
          <h2>GEMOIRE SPECIALS</h2>
          <p className="lede">A few considered ways to make the piece you love a little easier to say yes to.</p>
        </div>
        <div className="specials-cards">
          {offers.map(offer => (
            <article className="specials-card" key={offer.title}>
              <OfferIcon type={offer.icon} />
              <h3>{offer.title}</h3>
              <p>{offer.description}</p>
              {offer.code || offer.validUntil || offer.note ? <div className="specials-meta">
                {offer.code ? <span className="specials-code">{offer.code}</span> : null}
                {offer.validUntil ? <span className="specials-valid">Valid until {offer.validUntil}</span> : null}
                {offer.note ? <span className="specials-note">{offer.note}</span> : null}
              </div> : null}
              <Link href={offer.href} className="button">{offer.cta}</Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
