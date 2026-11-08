import "server-only";

import type { Metadata } from "next";
import { adminRepository } from "./admin-repository";
import { normalizeSiteCanonical, siteUrl } from "@/shared/site-config";
type JsonLdNode = Record<string, unknown>;

export function metadataForPath(pathname: string, fallbackTitle: string, fallbackDescription: string): Metadata {
  const page = adminRepository.findSeoPage(pathname);
  const site = adminRepository.getSeoSite();
  const pageTitle = page?.title || fallbackTitle;
  const title = site.titleTemplate.includes("{page}") ? site.titleTemplate.replaceAll("{page}", pageTitle) : site.titleTemplate || pageTitle;
  const description = page?.description || fallbackDescription || site.defaultOg.description;
  const socialDescription = page?.description || site.defaultOg.description || description;
  const image = page?.ogImage || site.defaultOg.image;

  return {
    title,
    description,
    alternates: { canonical: normalizeSiteCanonical(page?.canonical, pathname) },
    openGraph: {
      title: String(title),
      description: socialDescription,
      images: [{ url: image }],
      siteName: site.defaultOg.siteName,
    },
    robots: page?.status === "draft" ? { index: false, follow: false } : undefined,
  };
}

export function serializeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function breadcrumbNode(pathname: string, finalLabel?: string): JsonLdNode | null {
  const segments = pathname.split("/").filter(Boolean);
  if (!segments.length) return null;

  return {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl("/") },
      ...segments.map((segment, index) => ({
        "@type": "ListItem",
        position: index + 2,
        name: index === segments.length - 1 && finalLabel
          ? finalLabel
          : segment.replaceAll("-", " ").replace(/\b\w/g, letter => letter.toUpperCase()),
        item: siteUrl(`/${segments.slice(0, index + 1).join("/")}`),
      })),
    ],
  };
}

export function jsonLdForPath(
  pathname: string,
  product?: { name: string; description: string; image: string; audPrice: number; rating: number; reviewCount: number; stock?: number },
) {
  const site = adminRepository.getSeoSite();
  const page = adminRepository.findSeoPage(pathname);
  const nodes: JsonLdNode[] = [];

  if (!product && page?.jsonLdType === "WebSite" && pathname === "/") {
    nodes.push({ "@type": "WebSite", name: site.defaultOg.siteName, url: siteUrl("/"), description: page.description || site.defaultOg.description });
  }

  if (!product && page?.jsonLdType === "Event") {
    nodes.push({ "@type": "Event", name: page.title, description: page.description, url: normalizeSiteCanonical(page.canonical, pathname), eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode", eventStatus: "https://schema.org/EventScheduled" });
  }

  if (!product && page?.jsonLdType === "Article") {
    nodes.push({ "@type": "Article", headline: page.title, description: page.description, url: normalizeSiteCanonical(page.canonical, pathname), image: page.ogImage || site.defaultOg.image });
  }

  if (product && site.structuredData.product && page?.jsonLdType === "Product") {
    nodes.push({
      "@type": "Product",
      name: product.name,
      description: product.description,
      image: product.image,
      offers: {
        "@type": "Offer",
        priceCurrency: "AUD",
        price: product.audPrice,
        availability: product.stock === 0 ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
      },
      ...(product.reviewCount > 0 ? { aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: product.rating,
        reviewCount: product.reviewCount,
      } } : {}),
    });
  }

  if (pathname === "/faq" && site.structuredData.faq && page?.jsonLdType === "FAQPage") {
    nodes.push({
      "@type": "FAQPage",
      mainEntity: adminRepository.list("faqs").filter(faq => faq.published).map(faq => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: { "@type": "Answer", text: faq.answer },
      })),
    });
  }

  if (site.structuredData.breadcrumbs) {
    const breadcrumbs = breadcrumbNode(pathname, product?.name ?? page?.title);
    if (breadcrumbs) nodes.push(breadcrumbs);
  }

  if (!nodes.length) return null;
  if (nodes.length === 1) return { "@context": "https://schema.org", ...nodes[0] };
  return { "@context": "https://schema.org", "@graph": nodes };
}
