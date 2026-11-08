import Link from "next/link";
import type { Metadata } from "next";
import { adminRepository } from "@/lib/admin-repository";
import { metadataForPath } from "@/lib/seo";
import { StorefrontStructuredData } from "@/components/seo/storefront-structured-data";

export const dynamic = "force-dynamic";

export function generateMetadata(): Metadata {
  return metadataForPath("/blog", "The GEMOIRE journal", "Notes on lab-grown diamonds, considered design and meaningful beginnings.");
}

export default function BlogIndexPage() {
  const posts = adminRepository.list("blog").filter(post => post.status === "published").sort((a, b) => b.publishDate.localeCompare(a.publishDate));
  return <main><section className="page-top"><div className="shell"><p className="breadcrumb">Home / Journal</p><p className="eyebrow">The GEMOIRE journal</p><h1>Considered notes for meaningful beginnings</h1><p className="lede">Stories from the atelier, clear diamond guidance and the details that make a piece yours.</p></div></section><section className="section"><div className="shell">{posts.length ? <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">{posts.map(post => <article key={post.id} className="overflow-hidden rounded-md border border-cullen-border bg-white"><img src={post.cover} alt="" className="aspect-video w-full object-cover"/><div className="p-5"><p className="eyebrow">{post.category}</p><h2 className="mt-2 font-serif text-3xl text-cullen-charcoal">{post.title}</h2><p className="mt-3 text-sm leading-6 text-cullen-muted">{post.excerpt}</p><Link href={`/blog/${post.slug}`} className="mt-5 inline-block text-sm text-cullen-forest underline">Read the story</Link></div></article>)}</div> : <div className="empty-state"><h3>No stories yet</h3><p>New notes from the atelier will appear here soon.</p></div>}</div></section><StorefrontStructuredData pathname="/blog"/></main>;
}
