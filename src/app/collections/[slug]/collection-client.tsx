"use client";

import { startTransition, useEffect, useMemo, useOptimistic, useRef, useState, type MouseEvent } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Product } from "@/data/products";
import { ProductCard } from "@/components/commerce/product-card";
import { FilterSidebar } from "@/components/commerce/filter-sidebar";
import { Pagination } from "@/components/commerce/pagination";
import { ShapeSelector } from "@/components/commerce/shape-selector";
import { PRODUCTS_PER_PAGE, clampPage, pageCount as countPages, parsePage } from "@/lib/pagination";
import type { DiamondShape } from "@/lib/product-options";

export function CollectionClient({ products, initialFilter, initialShape, initialSort = "featured", hasStrip = false }: { products: Product[]; initialFilter?: string; initialShape?: DiamondShape; initialSort?: "featured" | "low"; hasStrip?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [localShape, setLocalShape] = useState(initialShape);
  // hasStrip: the page shows the subcategory strip instead of the shape row below. The URL then owns the shape:
  // tiles are links to ?shape=…, and clearing rewrites the URL. The optimistic value only bridges the server
  // round trip, so the pill disappears on click.
  const [urlShape, setUrlShape] = useOptimistic(initialShape);
  const shape = hasStrip ? urlShape : localShape;
  // The URL owns the page number: ?page=N, with no parameter on page 1. history.pushState and replaceState change it
  // without a server request, and Next mirrors them into useSearchParams, but only in a transition. The optimistic
  // value covers the render before that transition lands: without it, a sort change on page 3 first renders page 3
  // of the new order.
  const [requestedPage, setRequestedPage] = useOptimistic(parsePage(searchParams.get("page")));
  const pageHref = (target: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (target > 1) params.set("page", String(target)); else params.delete("page");
    const query = params.toString();
    return `${pathname}${query ? `?${query}` : ""}`;
  };
  const showPage = (target: number, entry: "push" | "replace") => startTransition(() => {
    setRequestedPage(target);
    if (entry === "push") window.history.pushState(null, "", pageHref(target)); else window.history.replaceState(null, "", pageHref(target));
  });
  // Any change to the result set (filters, sort, shape) returns to page 1 and adds no history entry.
  const resetPage = () => { if (requestedPage !== 1) showPage(1, "replace"); };
  const clearShape = () => {
    if (!hasStrip) { resetPage(); setLocalShape(undefined); return; }
    const params = new URLSearchParams(window.location.search);
    if (!params.has("shape")) { resetPage(); return; }
    params.delete("shape");
    params.delete("page");
    const query = params.toString();
    startTransition(() => { setUrlShape(undefined); setRequestedPage(1); router.replace(`${window.location.pathname}${query ? `?${query}` : ""}`, { scroll: false }); });
  };
  const [active, setActive] = useState<string[]>(initialFilter ? [initialFilter] : []);
  const [sort, setSort] = useState<string>(initialSort);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const toolbar = useRef<HTMLDivElement>(null);
  const grid = useRef<HTMLDivElement>(null);
  const jumpToResults = useRef(false);
  const toggle = (filter: string) => { resetPage(); setActive(current => current.includes(filter) ? current.filter(item => item !== filter) : [...current, filter]); };
  const filtered = useMemo(() => {
    let result = products.filter(product => (!shape || product.shape === shape) && (active.length === 0 || active.some(filter => `${product.metal} ${product.carat} ${product.shape} ${product.setting} ${product.clarity}`.includes(filter.replace("Yellow Gold", "18ct Yellow Gold").replace("Rose Gold", "18ct Rose Gold").replace("White Gold", "18ct White Gold")))));
    if (sort === "low") result = [...result].sort((a, b) => a.usdPrice - b.usdPrice);
    if (sort === "high") result = [...result].sort((a, b) => b.usdPrice - a.usdPrice);
    if (sort === "rating") result = [...result].sort((a, b) => b.rating - a.rating);
    return result;
  }, [products, active, sort, shape]);
  const pageCount = countPages(filtered.length);
  // A page past the end (an old link, or Back to a page the current filters no longer have) shows the last page.
  const page = clampPage(requestedPage, pageCount);
  const onPageLink = (target: number, event: MouseEvent<HTMLAnchorElement>) => {
    // A modified click opens the link's own href in a new tab or window, like any link.
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    jumpToResults.current = true;
    showPage(target, "push");
  };
  useEffect(() => { setLocalShape(initialShape); }, [initialShape]);
  useEffect(() => { setSort(initialSort); }, [initialSort]);
  // After a click on a page link: put the toolbar directly under the sticky header and move focus to the grid, so
  // the next Tab reaches the first piece of the new page. Back and Forward keep the browser's own scroll position.
  useEffect(() => {
    if (!jumpToResults.current) return;
    jumpToResults.current = false;
    const bar = toolbar.current;
    if (bar) window.scrollTo({ top: window.scrollY + bar.getBoundingClientRect().top - (document.querySelector<HTMLElement>(".site-header")?.offsetHeight ?? 0), behavior: "instant" });
    grid.current?.focus({ preventScroll: true });
  }, [page]);
  return <>
    {!hasStrip && <section className="shell collection-shapes" aria-label="Choose a diamond shape">
      <ShapeSelector selected={shape} onSelect={value => { resetPage(); setLocalShape(current => current === value ? undefined : value); }}/>
    </section>}
    <div className="shell collection-toolbar" ref={toolbar}>
      {hasStrip && <h2 className="sr-only">Products</h2>}
      <p className="product-spec" role="status">{filtered.length} pieces{shape ? ` · ${shape}` : ""}{pageCount > 1 && <span className="sr-only">, page {page} of {pageCount}</span>}</p>
      <select className="sort-select" value={sort} onChange={event => { resetPage(); setSort(event.target.value); }} aria-label="Sort collection">
        <option value="featured">Featured</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option><option value="rating">Highest rated</option>
      </select>
    </div>
    <div className="shell plp-layout">
      <FilterSidebar active={active} onToggle={toggle} onClear={() => { resetPage(); setActive([]); }} resultCount={filtered.length} mobileOpen={mobileFiltersOpen} onClose={() => setMobileFiltersOpen(false)}/>
      <div>
        <button className="button button-outline button-small mobile-filters" onClick={() => setMobileFiltersOpen(true)}>Filters {active.length ? `(${active.length})` : ""}</button>
        {(active.length > 0 || shape) && <div className="active-filter-pills">
          {shape && <button className="filter-pill" onClick={clearShape} aria-label={`Clear ${shape} shape filter`}>{shape} ×</button>}
          {active.map(filter => <button className="filter-pill" onClick={() => toggle(filter)} key={filter}>{filter} ×</button>)}
        </div>}
        <div className="product-grid" ref={grid} tabIndex={-1}>{filtered.slice((page - 1) * PRODUCTS_PER_PAGE, page * PRODUCTS_PER_PAGE).map(product => <ProductCard product={product} key={product.slug}/>)}</div>
        {filtered.length === 0 && <div className="empty-state"><h3>No pieces match those details</h3><button className="button button-outline" onClick={() => { setActive([]); clearShape(); }}>Clear filters</button></div>}
        <Pagination page={page} pageCount={pageCount} hrefFor={pageHref} onNavigate={onPageLink}/>
      </div>
    </div>
  </>;
}
