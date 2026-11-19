import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { adminRepository, toStorefrontProduct } from "@/lib/admin-repository";
import { metadataForPath } from "@/lib/seo";
import { StorefrontStructuredData } from "@/components/seo/storefront-structured-data";
import { parseShape } from "@/lib/product-options";
import { CollectionClient } from "./collection-client";
import type { AdminProduct } from "@/shared/admin-types";

const copy: Record<string, { title: string; eyebrow: string; description: string; category?: string; jewelryType?: AdminProduct["jewelryType"] }> = {
  engagement: { title: "Engagement Rings", eyebrow: "A lifetime moment", description: "Lab-grown diamond rings that make the beginning feel entirely like you.", category: "engagement" },
  wedding: { title: "Wedding Rings", eyebrow: "Made to meet in the middle", description: "Considered bands and three-stone designs for the promise you make every day.", category: "wedding" },
  "fine-jewelry": { title: "Fine Jewellery", eyebrow: "Quietly unforgettable", description: "Diamond details designed to become part of your own signature.", category: "fine-jewelry" },
  "ready-to-ship": { title: "Ready-to-Ship", eyebrow: "Ready when you are", description: "Thoughtfully crafted pieces that can begin their next chapter this week." },
  sale: { title: "Sale", eyebrow: "Limited-time pricing", description: "Considered pieces, priced to be collected." },
  "loose-stones": { title: "Loose Stones", eyebrow: "Certified & ready to set", description: "Loose lab-grown diamonds for bespoke settings." },
  gifts: { title: "Gifts", eyebrow: "Meaning, not occasion", description: "Pieces chosen for the people you keep.", category: "fine-jewelry" },
  earrings: { title: "Earrings", eyebrow: "Made to be noticed", description: "Considered earrings from quiet studs to statement drops.", jewelryType: "earring" },
  bracelets: { title: "Bracelets", eyebrow: "Everyday, elevated", description: "Delicate bracelets designed to layer with everything.", jewelryType: "bracelet" },
  necklaces: { title: "Necklaces", eyebrow: "The finishing note", description: "Pendants and chains that finish the way you start.", jewelryType: "necklace" }
};

export const dynamic = "force-dynamic";

function collectionDetails(slug: string) {
  const record = adminRepository.list("collections").find(collection => collection.slug === slug);
  return { record, details: record ? { title: record.name, eyebrow: "A GEMOIRE collection", description: record.description } : copy[slug] };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params; const { details } = collectionDetails(slug);
  return metadataForPath(`/collections/${slug}`, details?.title ?? "Collection", details?.description ?? "A considered GEMOIREJEWELSLLP collection.");
}

export default async function CollectionPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ setting?: string | string[]; shape?: string | string[] }> }) {
  const { slug } = await params; const query = await searchParams; const { record, details } = collectionDetails(slug);
  if (!details) notFound();
  const activeProducts = adminRepository.listProducts().filter(product => product.status === "active");
  const memberIds = record ? new Set(record.productIds) : null;
  const products = activeProducts.map(toStorefrontProduct);
  const jewelryType = copy[slug]?.jewelryType;
  const collection = slug === "sale" ? [...products].sort((a, b) => a.usdPrice - b.usdPrice) : slug === "ready-to-ship" ? products.filter(product => product.readyToShip) : jewelryType ? products.filter(product => product.jewelryType === jewelryType) : memberIds ? activeProducts.filter(product => memberIds.has(product.id)).map(toStorefrontProduct) : details.category ? products.filter(product => product.category === details.category) : [];
  const initialFilter = Array.isArray(query.setting) ? query.setting[0] : query.setting;
  return <main><section className="page-top"><div className="shell"><p className="breadcrumb">Home / {details.title}</p><div className="plp-top"><div><p className="eyebrow">{details.eyebrow}</p><h1>{details.title}</h1><p className="lede">{details.description}</p></div></div></div></section>{(slug === "loose-stones" || jewelryType) && collection.length === 0 ? <section className="shell empty-state collection-empty" aria-label={`${details.title} coming soon`}><p className="eyebrow">Nothing here yet</p><p className="lede">{slug === "loose-stones" ? "Our loose stones atelier is opening soon. Book a consultation and we'll source your stone." : "Book a consultation and we'll help you find your piece."}</p><Link className="button button-outline" href="/showroom">Book a consultation</Link></section> : <CollectionClient products={collection} initialFilter={initialFilter} initialShape={parseShape(query.shape)} initialSort={slug === "sale" ? "low" : "featured"}/>}<StorefrontStructuredData pathname={`/collections/${slug}`}/></main>;
}
