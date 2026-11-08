import type { Metadata } from "next";
import type { ReactNode } from "react";
import { StorefrontStructuredData } from "@/components/seo/storefront-structured-data";
import { metadataForPath } from "@/lib/seo";

export const dynamic = "force-dynamic";
export function generateMetadata(): Metadata { return metadataForPath("/checkout", "Checkout", "Complete your GEMOIREJEWELSLLP order with confidence."); }
export default function CheckoutLayout({ children }: { children: ReactNode }) { return <>{children}<StorefrontStructuredData pathname="/checkout"/></>; }
