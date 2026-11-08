import type { Metadata } from "next";
import { FAQAccordion } from "@/components/marketing/faq-accordion";
import { jsonLdForPath, metadataForPath, serializeJsonLd } from "@/lib/seo";
export const dynamic = "force-dynamic";
export function generateMetadata(): Metadata { return metadataForPath("/faq", "Diamond FAQs", "Clear answers for every considered diamond decision."); }
export default function FAQPage() { const structuredData = jsonLdForPath("/faq"); return <main><section className="page-top"><div className="shell"><p className="breadcrumb">Home / Frequently asked questions</p><p className="eyebrow">A clear beginning</p><h1>Helpful answers, held simply</h1><p className="lede">Everything you need to know before you choose a diamond, visit a showroom or begin your own design.</p></div></section><FAQAccordion/>{structuredData && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(structuredData) }}/>}</main>; }
