import Image from "next/image";
import Link from "next/link";
import { adminRepository } from "@/lib/admin-repository";
import { StorefrontStructuredData } from "@/components/seo/storefront-structured-data";
import { Hero } from "@/components/marketing/hero";
import { StyleGrid } from "@/components/marketing/style-grid";
import { QuizBand } from "@/components/marketing/quiz-band";
import { GoldDivider } from "@/components/marketing/gold-divider";
import { ValueStrip } from "@/components/marketing/value-strip";
import { CraftsmanshipSection } from "@/components/marketing/craftsmanship-section";
import { BrandStorySection } from "@/components/marketing/brand-story-section";
import { GemoireSpecials } from "@/components/marketing/gemoire-specials";
import { CollectionTiles } from "@/components/marketing/collection-tiles";
import { GiftingSpecials } from "@/components/marketing/gifting-specials";
import { Testimonials } from "@/components/marketing/testimonials";
import { LetUsConnect } from "@/components/marketing/lets-connect";
import { FAQAccordion } from "@/components/marketing/faq-accordion";
import { VideoGallery } from "@/components/marketing/video-gallery";
import { SplitScreenShapeHero } from "@/components/marketing/split-screen-shape-hero";

export const dynamic = "force-dynamic";
export default function Home() { const reviews = adminRepository.list("reviews").filter(review => review.status === "published").map(review => ({ id: review.id, name: review.customerName, city: review.city, quote: review.quote, rating: review.rating, platform: review.platform, externalUrl: review.externalUrl, productImage: review.productImage })); return <main id="top"><Hero/><SplitScreenShapeHero/><StyleGrid/><QuizBand/><section className="section section-oatmeal"><div className="shell ready-grid"><div><p className="eyebrow">Ready when you are</p><h2>Shipped this week, not next year</h2><p className="lede" style={{ marginTop: 16 }}>A small edit of quietly exceptional pieces, already crafted and waiting for their next chapter.</p><Link href="/collections/ready-to-ship" className="button">View ready-to-ship</Link></div><div className="postcard-stack"><Image src="https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?auto=format&fit=crop&w=800&q=80" alt="Placeholder showroom photography" width={560} height={440}/><Image src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80" alt="Placeholder jewellery photography" width={560} height={440}/></div></div></section><GoldDivider/><ValueStrip/><CraftsmanshipSection/><BrandStorySection/><GemoireSpecials/><CollectionTiles/><GiftingSpecials/><Testimonials reviews={reviews}/><LetUsConnect/><FAQAccordion/><VideoGallery/><StorefrontStructuredData pathname="/"/></main>; }
