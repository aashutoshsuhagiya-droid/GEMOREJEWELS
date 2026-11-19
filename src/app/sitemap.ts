import type { MetadataRoute } from "next";
import { adminRepository } from "@/lib/admin-repository";
import { SITE_ORIGIN } from "@/shared/site-config";

export const dynamic = "force-dynamic";

export default function sitemap(): MetadataRoute.Sitemap {
  const root = SITE_ORIGIN;
  const activeProducts = new Set(adminRepository.listProducts().filter(product => product.status === "active").map(product => product.slug));
  const seoPages = adminRepository.list("seoPages");
  const newCollectionPaths = ["/collections/sale", "/collections/loose-stones", "/collections/gifts", "/collections/earrings", "/collections/bracelets", "/collections/necklaces"]
    .filter(path => !seoPages.some(page => page.slug === path));
  const seoPaths = seoPages
    .filter(page => page.status === "published")
    .filter(page => page.pageType !== "product" || activeProducts.has(page.slug.replace(/^\/products\//, "")))
    .map(page => page.slug);
  const publishedPosts = adminRepository.list("blog").filter(post => post.status === "published");
  const paths = [...new Set([...seoPaths, ...newCollectionPaths, ...(publishedPosts.length ? ["/blog"] : []), ...publishedPosts.map(post => `/blog/${post.slug}`)])];

  return paths.map(path => ({ url: `${root}${path}`, lastModified: new Date() }));
}
