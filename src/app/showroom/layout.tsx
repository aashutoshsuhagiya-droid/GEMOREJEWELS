import type { Metadata } from "next";
import type { ReactNode } from "react";
import { StorefrontStructuredData } from "@/components/seo/storefront-structured-data";
import { metadataForPath } from "@/lib/seo";

export const dynamic = "force-dynamic";
export function generateMetadata(): Metadata { return metadataForPath("/showroom", "Visit a GEMOIREJEWELSLLP showroom", "Private appointments in five considered cities."); }
export default function ShowroomLayout({ children }: { children: ReactNode }) { return <>{children}<StorefrontStructuredData pathname="/showroom"/></>; }
