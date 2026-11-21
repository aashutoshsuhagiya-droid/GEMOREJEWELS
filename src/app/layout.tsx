import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import "./storefront.css";
import { CartProvider } from "@/components/commerce/cart-store";
import { CurrencyProvider } from "@/components/commerce/currency-store";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { metadataForPath } from "@/lib/seo";
import { adminRepository } from "@/lib/admin-repository";

const editorial = localFont({
  src: "./fonts/cormorant-garamond-latin-variable.woff2",
  weight: "300 700",
  style: "normal",
  variable: "--font-editorial",
  display: "swap",
  preload: true,
  adjustFontFallback: "Times New Roman",
  fallback: ["Georgia", "serif"],
});
const ui = localFont({
  src: "./fonts/geist-latin-variable.woff2",
  weight: "100 900",
  style: "normal",
  variable: "--font-ui",
  display: "swap",
  preload: true,
  adjustFontFallback: "Arial",
  fallback: ["Arial", "sans-serif"],
});

export const dynamic = "force-dynamic";
export function generateMetadata(): Metadata { return metadataForPath("/", "Fine lab-grown diamond jewellery", "Fine lab-grown diamond jewellery, considered for a lifetime."); }

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const collectionRecords = adminRepository.list("collections").sort((a, b) => a.homepageOrder - b.homepageOrder);
  const collections = collectionRecords.map(({ id, name, slug }) => ({ id, name, slug }));
  const products = adminRepository.listProducts().filter(product => product.status === "active");
  const featureId = collectionRecords.find(collection => collection.megaProductId)?.megaProductId;
  const featureProduct = products.find(product => product.id === featureId) ?? products.find(product => product.featured);
  const featured = featureProduct ? { slug: featureProduct.slug, name: featureProduct.name, image: featureProduct.images.find(image => image.isPrimary)?.src ?? featureProduct.images[0]?.src ?? "", priceUsd: featureProduct.priceUsd } : undefined;
  return <html lang="en" className={`${editorial.variable} ${ui.variable}`}><body><a href="#top" className="skip-link">Skip to main content</a><CurrencyProvider><CartProvider><Header collections={collections} featured={featured}/>{children}<Footer /></CartProvider></CurrencyProvider></body></html>;
}
