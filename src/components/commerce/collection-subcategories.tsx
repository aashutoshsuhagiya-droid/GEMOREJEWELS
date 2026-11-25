import Image from "next/image";
import Link from "next/link";
import type { CollectionSubcategoryGroup } from "@/data/collection-subcategories";
import { parseShape } from "@/lib/product-options";

type Query = Record<string, string | string[] | undefined>;

// next/image throws for a remote host that is not in images.remotePatterns (next.config.ts), which
// would take the whole collection page down. Local files and Unsplash are resized; any other
// source is served as it is.
const needsUnoptimizedImage = (src: string) => !(src.startsWith("/") && !src.startsWith("//")) && !src.startsWith("https://images.unsplash.com/");

const base = "http://localhost";
const pathOf = (href: string) => { try { return new URL(href, base).pathname; } catch { return undefined; } };
const firstValue = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;
// `?shape=oval` and `?shape=Oval` are the same filter, so shapes are compared after parseShape.
const comparable = (key: string, value: string | undefined) => key === "shape" ? parseShape(value) ?? value : value;

// A tile is current when it has its own link, that link points at this page, and every query
// parameter in the link matches the request. Tiles without a link are never current.
function isCurrent(href: string | undefined, pathname: string, query: Query) {
  if (!href || pathOf(href) !== pathname) return false;
  const wanted = new URL(href, base).searchParams;
  return [...wanted.keys()].every(key => comparable(key, wanted.get(key) ?? undefined) === comparable(key, firstValue(query[key])));
}

export function CollectionSubcategories({ slug, group, query }: { slug: string; group: CollectionSubcategoryGroup; query: Query }) {
  const parent = `/collections/${slug}`;
  const pathname = pathOf(parent);
  const headingId = `subcat-heading-${slug}`;

  return <nav className="shell subcat" aria-labelledby={headingId}>
    <h2 className="subcat-heading" id={headingId}>{group.heading}</h2>
    <ul className="subcat-list" role="list">
      {group.items.map(item => {
        // No link from the client yet: the tile leads to its own collection page, so nothing 404s.
        const href = item.href ?? parent;
        // A tile that only changes this page's query must not jump the scroll position.
        // (No prefetch: collection pages render on demand, so ten tiles would be ten wasted requests.)
        const samePage = pathname !== undefined && pathOf(href) === pathname;
        const current = pathname !== undefined && isCurrent(item.href, pathname, query);
        return <li className="subcat-item" key={item.name}>
          <Link className="subcat-tile" href={href} scroll={!samePage} prefetch={false} aria-current={current ? "true" : undefined}>
            <span className={`subcat-frame subcat-frame--${item.image ? group.imageFit : "empty"}`}>
              {item.image
                ? <Image className="subcat-image" src={item.image} alt="" fill sizes="(max-width: 767px) 100px, (max-width: 1023px) 96px, 120px" loading="eager" unoptimized={needsUnoptimizedImage(item.image)}/>
                : <svg className="subcat-placeholder" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path d="M5 12 11 5h10l6 7-11 15Z M5 12h22 M11 5l5 7 5-7 M12 12l4 15 4-15"/></svg>}
            </span>
            <span className="subcat-name">{item.name}</span>
          </Link>
        </li>;
      })}
    </ul>
  </nav>;
}
