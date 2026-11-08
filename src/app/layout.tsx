import type { Metadata } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import "./globals.css";
import "./storefront.css";
import { CartProvider } from "@/components/commerce/cart-store";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { metadataForPath } from "@/lib/seo";
import { adminRepository } from "@/lib/admin-repository";

const cormorant = Cormorant_Garamond({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-cormorant" });
const jost = Jost({ subsets: ["latin"], weight: ["300", "400", "500", "600"], variable: "--font-jost" });

export const dynamic = "force-dynamic";
export function generateMetadata(): Metadata { return metadataForPath("/", "Fine lab-grown diamond jewellery", "Fine lab-grown diamond jewellery, considered for a lifetime."); }

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const collectionRecords = adminRepository.list("collections").sort((a, b) => a.homepageOrder - b.homepageOrder);
  const collections = collectionRecords.map(({ id, name, slug }) => ({ id, name, slug }));
  const products = adminRepository.listProducts().filter(product => product.status === "active");
  const featureId = collectionRecords.find(collection => collection.megaProductId)?.megaProductId;
  const featureProduct = products.find(product => product.id === featureId) ?? products.find(product => product.featured);
  const featured = featureProduct ? { slug: featureProduct.slug, name: featureProduct.name, image: featureProduct.images.find(image => image.isPrimary)?.src ?? featureProduct.images[0]?.src ?? "", priceAud: featureProduct.priceAud } : undefined;
  return <html lang="en" className={`${cormorant.variable} ${jost.variable}`}><body><CartProvider><Header collections={collections} featured={featured}/>{children}<Footer /></CartProvider></body></html>;
}
