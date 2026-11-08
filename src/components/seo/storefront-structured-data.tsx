import { jsonLdForPath, serializeJsonLd } from "@/lib/seo";

type ProductSchemaInput = {
  name: string;
  description: string;
  image: string;
  audPrice: number;
  rating: number;
  reviewCount: number;
  stock?: number;
};

export function StorefrontStructuredData({ pathname, product }: { pathname: string; product?: ProductSchemaInput }) {
  const value = jsonLdForPath(pathname, product);
  return value
    ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(value) }}/>
    : null;
}
