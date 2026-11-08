import Link from "next/link";
import type { Metadata } from "next";
import { metadataForPath } from "@/lib/seo";

export function generateMetadata(): Metadata { return metadataForPath("/404", "Lost your way?", "Find a considered place to begin with GEMOIREJEWELSLLP."); }

export default function NotFound() { return <main className="not-found"><div className="shell"><p className="eyebrow">A small detour</p><h1>Lost your way?</h1><p className="lede" style={{ margin: "16px auto" }}>A considered place to begin is never far away.</p><form action="/collections/engagement"><input name="q" placeholder="Search diamonds and settings"/><button>Search</button></form><p><Link href="/collections/engagement">Engagement rings</Link> · <Link href="/collections/wedding">Wedding rings</Link> · <Link href="/collections/fine-jewelry">Fine jewellery</Link></p></div></main>; }
