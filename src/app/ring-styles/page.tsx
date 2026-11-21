import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { metadataForPath } from "@/lib/seo";

export const dynamic = "force-dynamic";
export function generateMetadata(): Metadata {
  return metadataForPath("/ring-styles", "Engagement ring styles", "Explore our curated collection of engagement ring styles — from timeless solitaires to vintage halos, three-stone elegance and more.");
}

type RingStyle = {
  id: string;
  name: string;
  description: string;
  image: string;
  alt: string;
  category: "classic" | "modern" | "vintage" | "statement";
};

const ringStyles: RingStyle[] = [
  {
    id: "solitaire",
    name: "Solitaire",
    description: "Timeless elegance. A single diamond on a plain band — the purest expression of love.",
    image: "/images/ring-styles/style-solitaire.jpg",
    alt: "Classic solitaire engagement ring",
    category: "classic",
  },
  {
    id: "halo",
    name: "Halo",
    description: "A central diamond surrounded by a circle of smaller stones — extra brilliance from every angle.",
    image: "/images/ring-styles/style-halo.jpg",
    alt: "Halo engagement ring with center diamond",
    category: "classic",
  },
  {
    id: "three-stone",
    name: "Three Stone",
    description: "Past, present, and future. Three diamonds symbolising the journey you share.",
    image: "/images/ring-styles/style-three-stone.jpg",
    alt: "Three stone engagement ring",
    category: "classic",
  },
  {
    id: "vintage",
    name: "Vintage",
    description: "Art deco details and intricate filigree work — a ring with heritage and character.",
    image: "/images/ring-styles/style-vintage.jpg",
    alt: "Vintage style engagement ring",
    category: "vintage",
  },
  {
    id: "pave",
    name: "Pavé Band",
    description: "A band lined with tiny diamonds — understated sparkle that catches every eye.",
    image: "/images/ring-styles/style-pavé.jpg",
    alt: "Pavé band engagement ring",
    category: "modern",
  },
  {
    id: "cluster",
    name: "Cluster",
    description: "Multiple stones arranged in a floral or geometric pattern — bold and beautiful.",
    image: "/images/ring-styles/style-cluster.jpg",
    alt: "Cluster diamond engagement ring",
    category: "statement",
  },
  {
    id: "rose-gold",
    name: "Rose Gold",
    description: "Warm, romantic, and effortlessly elegant. A modern classic in blush-toned metal.",
    image: "/images/ring-styles/style-rose.jpg",
    alt: "Rose gold engagement ring",
    category: "modern",
  },
  {
    id: "oval",
    name: "Oval Cut",
    description: "Elongated brilliance with elegant curves. An oval diamond creates the illusion of greater size.",
    image: "/images/ring-styles/style-oval.jpg",
    alt: "Oval cut diamond engagement ring",
    category: "modern",
  },
  {
    id: "heart",
    name: "Heart Shape",
    description: "The ultimate symbol of love. A heart-shaped diamond that speaks volumes.",
    image: "/images/ring-styles/style-heart.jpg",
    alt: "Heart shape diamond engagement ring",
    category: "statement",
  },
];

const categories = [
  { id: "all", label: "All Styles" },
  { id: "classic", label: "Classic" },
  { id: "modern", label: "Modern" },
  { id: "vintage", label: "Vintage" },
  { id: "statement", label: "Statement" },
];

export default function RingStylesPage() {
  return (
    <main>
      {/* ===== HERO ===== */}
      <section className="rs-styles-hero">
        <div className="rs-styles-hero-image">
          <Image
            src="/images/ring-styles/style-solitaire.jpg"
            alt="Engagement ring styles"
            fill
            priority
            sizes="100vw"
          />
        </div>
        <div className="rs-styles-hero-shade" />
        <div className="shell rs-styles-hero-inner">
          <div className="rs-styles-hero-copy">
            <p className="eyebrow eyebrow-light">Our Collection</p>
            <h1>Engagement ring styles</h1>
            <p className="rs-styles-hero-lede">
              From timeless solitaires to statement-making designs, discover the ring that
              tells your unique love story.
            </p>
          </div>
        </div>
      </section>

      {/* ===== STYLES GRID ===== */}
      <section className="section rs-styles-section">
        <div className="shell">
          <div className="section-heading center">
            <p className="eyebrow">Find your style</p>
            <h2>Explore our ring styles</h2>
            <p className="lede">Each style has its own personality. Find the one that speaks to yours.</p>
          </div>

          <div className="rs-styles-grid">
            {ringStyles.map((style) => (
              <Link href={`/collections/engagement`} className="rs-style-card" key={style.id}>
                <div className="rs-style-card-image">
                  <Image
                    src={style.image}
                    alt={style.alt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1400px) 33vw, 25vw"
                  />
                  <span className="rs-style-card-overlay">
                    <span className="rs-style-card-cta">Explore</span>
                  </span>
                </div>
                <div className="rs-style-card-content">
                  <h3>{style.name}</h3>
                  <p>{style.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA BAND ===== */}
      <section className="rs-styles-cta">
        <div className="shell">
          <div className="rs-styles-cta-inner">
            <p className="eyebrow eyebrow-light">Need help?</p>
            <h2>Not sure which style is right for you?</h2>
            <p className="rs-styles-cta-text">
              Book a virtual appointment with our jewellery consultants. We will guide you through
              every style, stone shape, and metal option to find your perfect ring.
            </p>
            <div className="rs-styles-cta-actions">
              <Link href="/virtual-appointment" className="button button-white">Book appointment</Link>
              <Link href="/contact" className="button button-ghost">Contact us</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
