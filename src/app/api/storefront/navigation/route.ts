import { NextResponse } from "next/server";
import { adminRepository, toStorefrontProduct } from "@/lib/admin-repository";

export const dynamic = "force-dynamic";

export async function GET() {
  const products = new Map(adminRepository.listProducts().filter(product => product.status === "active").map(product => [product.id, product]));
  const collection = adminRepository.list("collections").filter(item => Boolean(item.megaProductId)).sort((a, b) => a.homepageOrder - b.homepageOrder).find(item => item.megaProductId && products.has(item.megaProductId));
  const product = collection?.megaProductId ? products.get(collection.megaProductId) : undefined;
  return NextResponse.json({ featured: product ? { ...toStorefrontProduct(product), collectionName: collection?.name } : null });
}
