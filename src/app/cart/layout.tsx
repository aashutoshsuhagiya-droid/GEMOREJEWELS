import type { Metadata } from "next";
import type { ReactNode } from "react";
import { StorefrontStructuredData } from "@/components/seo/storefront-structured-data";
import { metadataForPath } from "@/lib/seo";

export const dynamic = "force-dynamic";
export function generateMetadata(): Metadata { return metadataForPath("/cart", "Your bag", "Review the considered pieces you have chosen."); }
export default function CartLayout({ children }: { children: ReactNode }) { return <>{children}<StorefrontStructuredData pathname="/cart"/></>; }
