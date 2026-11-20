import Image from "next/image";
import Link from "next/link";

type GiftingTile = {
  label: string;
  href: string;
  image: string;
  alt: string;
  position: "left" | "right";
};

// Two distinct, on-brand gift photos (verified working Unsplash IDs from the repo image pool).
const tiles: GiftingTile[] = [
  {
    label: "Gift for Her",
    href: "/collections/gift-for-her",
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1200&q=85",
    alt: "Delicate lab-grown diamond jewellery for her",
    position: "left"
  },
  {
    label: "Gift for Him",
    href: "/collections/gift-for-him",
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1200&q=85",
    alt: "A considered diamond ring for him",
    position: "right"
  }
];

const priceTiers = [
  { label: "Under $100", href: "/collections/under-100" },
  { label: "Under $200", href: "/collections/under-200" },
  { label: "Under $300", href: "/collections/under-300" }
];

export function GiftingSpecials() {
  return (
    <section className="section gifting-specials">
      <div className="shell">
        <div className="section-heading center">
          <p className="eyebrow">For the ones you keep</p>
          <h2>Gifting Special</h2>
        </div>
        <div className="gifting-grid">
          {tiles.map(tile => (
            <Link className={`gifting-tile gifting-tile--${tile.position}`} href={tile.href} key={tile.label} aria-label={`${tile.label} — shop the collection`}>
              <Image src={tile.image} alt={tile.alt} fill sizes="(max-width: 900px) 100vw, 50vw" />
              <span className="gifting-tile-scrim" aria-hidden="true" />
              <span className="gifting-tile-label">
                <span className="gifting-tile-title">{tile.label}</span>
                <span className="gifting-tile-cta">Shop now</span>
              </span>
            </Link>
          ))}
        </div>
        <div className="gifting-prices">
          {priceTiers.map(tier => (
            <Link className="gifting-price" href={tier.href} key={tier.href}>{tier.label}</Link>
          ))}
        </div>
      </div>
    </section>
  );
}
