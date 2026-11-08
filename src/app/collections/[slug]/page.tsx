import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { adminRepository, toStorefrontProduct } from "@/lib/admin-repository";
import { metadataForPath } from "@/lib/seo";
import { StorefrontStructuredData } from "@/components/seo/storefront-structured-data";
import { parseShape } from "@/lib/product-options";
import { CollectionClient } from "./collection-client";

const copy: Record<string, { title: string; eyebrow: string; description: string; category?: string }> = {
  engagement: { title: "Engagement Rings", eyebrow: "A lifetime moment", description: "Lab-grown diamond rings that make the beginning feel entirely like you.", category: "engagement" },
  wedding: { title: "Wedding Rings", eyebrow: "Made to meet in the middle", description: "Considered bands and three-stone designs for the promise you make every day.", category: "wedding" },
  "fine-jewelry": { title: "Fine Jewellery", eyebrow: "Quietly unforgettable", description: "Diamond details designed to become part of your own signature.", category: "fine-jewelry" },
  "ready-to-ship": { title: "Ready-to-Ship", eyebrow: "Ready when you are", description: "Thoughtfully crafted pieces that can begin their next chapter this week." }
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
  const collection = slug === "ready-to-ship" ? products.filter(product => product.readyToShip) : memberIds ? activeProducts.filter(product => memberIds.has(product.id)).map(toStorefrontProduct) : details.category ? products.filter(product => product.category === details.category) : [];
  const initialFilter = Array.isArray(query.setting) ? query.setting[0] : query.setting;
  return <main><section className="page-top"><div className="shell"><p className="breadcrumb">Home / {details.title}</p><div className="plp-top"><div><p className="eyebrow">{details.eyebrow}</p><h1>{details.title}</h1><p className="lede">{details.description}</p></div></div></div></section><CollectionClient products={collection} initialFilter={initialFilter} initialShape={parseShape(query.shape)}/><StorefrontStructuredData pathname={`/collections/${slug}`}/></main>;
}
