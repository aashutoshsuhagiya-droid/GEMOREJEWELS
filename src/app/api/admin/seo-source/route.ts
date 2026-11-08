import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/admin-auth";
import { adminRepository } from "@/lib/admin-repository";
import { richTextToPlainText } from "@/lib/safe-rich-text";
import { jsonLdForPath, metadataForPath, serializeJsonLd } from "@/lib/seo";

export async function GET(request: Request) {
  if (!(await getAdminSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const pathname = new URL(request.url).searchParams.get("path") || "/";
  if (!pathname.startsWith("/") || pathname.includes("..") || /[\\\u0000-\u001f\u007f]/.test(pathname)) {
    return NextResponse.json({ error: "Invalid storefront path" }, { status: 400 });
  }

  const page = adminRepository.findSeoPage(pathname);
  const product = pathname.startsWith("/products/")
    ? adminRepository.getProduct(pathname.replace(/^\/products\//, ""))
    : undefined;
  const productSchema = product ? {
    name: product.name,
    description: richTextToPlainText(product.description),
    image: product.images.find(image => image.isPrimary)?.src || product.images[0]?.src || "",
    audPrice: product.priceAud,
    rating: product.rating,
    reviewCount: product.reviewCount,
    stock: product.stock,
  } : undefined;
  const structuredData = jsonLdForPath(pathname, productSchema);
  const metadata = metadataForPath(pathname, page?.title || product?.name || "GEMOIREJEWELSLLP", page?.description || (product ? richTextToPlainText(product.description) : "Fine jewellery, considered for a lifetime."));

  return NextResponse.json({
    pathname,
    metadata,
    structuredData,
    script: structuredData ? `<script type="application/ld+json">${serializeJsonLd(structuredData)}</script>` : null,
  });
}
