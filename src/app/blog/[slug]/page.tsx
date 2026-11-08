import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import { adminRepository } from "@/lib/admin-repository";
import { metadataForPath } from "@/lib/seo";
import { StorefrontStructuredData } from "@/components/seo/storefront-structured-data";

export const dynamic = "force-dynamic";

type BlogRouteProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
};

const SIMPLE_MARKUP = new Set(["<strong>", "</strong>", "<em>", "</em>", "<h3>", "</h3>", "</a>"]);

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function sanitizeLimitedMarkup(value: string) {
  return value.split(/(<[^>]+>)/g).map(token => {
    const normalized = token.toLowerCase();
    if (SIMPLE_MARKUP.has(normalized)) return normalized;

    const anchor = token.match(/^<a\s+href\s*=\s*(["'])([\s\S]*?)\1\s*>$/i);
    if (anchor) {
      const href = anchor[2].trim().replace(/[\u0000-\u001f\u007f]/g, "");
      const isSafe = /^(?:https?:\/\/|mailto:|#)/i.test(href) || /^\/(?!\/)/.test(href);
      return `<a href="${escapeHtml(isSafe ? href : "#")}" rel="noreferrer">`;
    }

    return escapeHtml(token);
  }).join("");
}

async function getVisiblePost(slug: string, previewRequested: boolean) {
  const post = adminRepository.list("blog").find(item => item.slug === slug);
  if (!post) return null;
  if (post.status === "published") return { post, isPreview: false };
  if (!previewRequested || !(await getAdminSession())) return null;
  return { post, isPreview: true };
}

export async function generateMetadata({ params, searchParams }: BlogRouteProps): Promise<Metadata> {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const visible = await getVisiblePost(slug, query.preview === "1");
  const metadata = metadataForPath(
    `/blog/${slug}`,
    visible?.post.title ?? "The GEMOIRE journal",
    visible?.post.excerpt ?? "Notes from the GEMOIREJEWELSLLP atelier.",
  );
  return visible?.isPreview ? { ...metadata, robots: { index: false, follow: false } } : metadata;
}

export default async function BlogPostPage({ params, searchParams }: BlogRouteProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const visible = await getVisiblePost(slug, query.preview === "1");
  if (!visible) notFound();

  const { post, isPreview } = visible;
  const date = new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${post.publishDate.slice(0, 10)}T00:00:00`));

  return (
    <main>
      <article>
        <section className="page-top">
          <div className="shell max-w-4xl">
            <p className="breadcrumb"><Link href="/blog">Journal</Link> / {post.category}</p>
            <p className="eyebrow">{post.category} · {date}</p>
            {isPreview ? <p className="mb-3 inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">Draft preview</p> : null}
            <h1>{post.title}</h1>
            <p className="lede">{post.excerpt}</p>
          </div>
        </section>
        <section className="section pt-0">
          <div className="shell max-w-4xl">
            <img src={post.cover} alt="" className="aspect-video w-full rounded-md object-cover" />
            <div className="mx-auto mt-10 max-w-3xl space-y-5 text-[17px] leading-8 text-cullen-muted">
              {post.body.split(/\n{2,}/).filter(Boolean).map((block, index) => (
                <div key={index} dangerouslySetInnerHTML={{ __html: sanitizeLimitedMarkup(block) }} />
              ))}
            </div>
            <Link href="/blog" className="mt-10 inline-block text-sm text-cullen-forest underline">Back to the journal</Link>
          </div>
        </section>
      </article>
      <StorefrontStructuredData pathname={`/blog/${slug}`} />
    </main>
  );
}
