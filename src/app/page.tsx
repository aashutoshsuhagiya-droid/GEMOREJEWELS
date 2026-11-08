import Image from "next/image";
import Link from "next/link";
import { adminRepository, toStorefrontProduct } from "@/lib/admin-repository";
import { StorefrontStructuredData } from "@/components/seo/storefront-structured-data";
import { Hero } from "@/components/marketing/hero";
import { StyleGrid } from "@/components/marketing/style-grid";
import { QuizBand } from "@/components/marketing/quiz-band";
import { GoldDivider } from "@/components/marketing/gold-divider";
import { ValueStrip } from "@/components/marketing/value-strip";
import { ShowroomSection } from "@/components/marketing/showroom-section";
import { OriginsJourney } from "@/components/marketing/origins-journey";
import { Testimonials } from "@/components/marketing/testimonials";
import { FAQAccordion } from "@/components/marketing/faq-accordion";
import { InstagramFeed } from "@/components/marketing/instagram-feed";
import { NewsletterBand } from "@/components/marketing/newsletter-band";
import { ProductCard } from "@/components/commerce/product-card";
import { ShapeSelector } from "@/components/commerce/shape-selector";

export const dynamic = "force-dynamic";
export default function Home() { const products = adminRepository.listProducts().filter(product => product.status === "active").map(toStorefrontProduct); const reviews = adminRepository.list("reviews").filter(review => review.status === "published").map(review => ({ id: review.id, name: review.customerName, city: review.city, quote: review.quote, rating: review.rating })); return <main id="top"><Hero/><section className="section section-oatmeal"><div className="shell"><div className="section-heading center"><p className="eyebrow">Find your silhouette</p><h2>Shop by diamond shape</h2><p className="lede">Discover the shape that feels like you.</p></div><ShapeSelector/></div></section><StyleGrid/><QuizBand/><section className="section section-oatmeal"><div className="shell ready-grid"><div><p className="eyebrow">Ready when you are</p><h2>Shipped this week, not next year</h2><p className="lede" style={{ marginTop: 16 }}>A small edit of quietly exceptional pieces, already crafted and waiting for their next chapter.</p><Link href="/collections/ready-to-ship" className="button">View ready-to-ship</Link></div><div className="postcard-stack"><Image src="https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?auto=format&fit=crop&w=800&q=80" alt="Placeholder showroom photography" width={560} height={440}/><Image src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80" alt="Placeholder jewellery photography" width={560} height={440}/></div></div></section><GoldDivider/><ValueStrip/><ShowroomSection/><OriginsJourney/><section className="section"><div className="shell"><div className="section-heading center"><p className="eyebrow">New in the atelier</p><h2>Made to become yours</h2></div><div className="product-grid">{products.slice(0, 4).map(product => <ProductCard key={product.slug} product={product}/>)}</div></div></section><Testimonials reviews={reviews}/><FAQAccordion/><InstagramFeed/><NewsletterBand/><StorefrontStructuredData pathname="/"/></main>; }
