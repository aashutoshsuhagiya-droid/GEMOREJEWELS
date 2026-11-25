"use client";

import { startTransition, useEffect, useMemo, useOptimistic, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@/data/products";
import { ProductCard } from "@/components/commerce/product-card";
import { FilterSidebar } from "@/components/commerce/filter-sidebar";
import { ShapeSelector } from "@/components/commerce/shape-selector";
import type { DiamondShape } from "@/lib/product-options";

export function CollectionClient({ products, initialFilter, initialShape, initialSort = "featured", hasStrip = false }: { products: Product[]; initialFilter?: string; initialShape?: DiamondShape; initialSort?: "featured" | "low"; hasStrip?: boolean }) {
  const router = useRouter();
  const [localShape, setLocalShape] = useState(initialShape);
  // hasStrip: the page shows the subcategory strip instead of the shape row below. The URL then owns the shape:
  // tiles are links to ?shape=…, and clearing rewrites the URL. The optimistic value only bridges the server
  // round trip, so the pill disappears on click.
  const [urlShape, setUrlShape] = useOptimistic(initialShape);
  const shape = hasStrip ? urlShape : localShape;
  const clearShape = () => {
    if (!hasStrip) { setLocalShape(undefined); return; }
    const params = new URLSearchParams(window.location.search);
    if (!params.has("shape")) return;
    params.delete("shape");
    const query = params.toString();
    startTransition(() => { setUrlShape(undefined); router.replace(`${window.location.pathname}${query ? `?${query}` : ""}`, { scroll: false }); });
  };
  const [active, setActive] = useState<string[]>(initialFilter ? [initialFilter] : []);
  const [sort, setSort] = useState<string>(initialSort);
  const [shown, setShown] = useState(8);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const sentinel = useRef<HTMLDivElement>(null);
  const toggle = (filter: string) => setActive(current => current.includes(filter) ? current.filter(item => item !== filter) : [...current, filter]);
  const filtered = useMemo(() => {
    let result = products.filter(product => (!shape || product.shape === shape) && (active.length === 0 || active.some(filter => `${product.metal} ${product.carat} ${product.shape} ${product.setting} ${product.clarity}`.includes(filter.replace("Yellow Gold", "18ct Yellow Gold").replace("Rose Gold", "18ct Rose Gold").replace("White Gold", "18ct White Gold")))));
    if (sort === "low") result = [...result].sort((a, b) => a.usdPrice - b.usdPrice);
    if (sort === "high") result = [...result].sort((a, b) => b.usdPrice - a.usdPrice);
    if (sort === "rating") result = [...result].sort((a, b) => b.rating - a.rating);
    return result;
  }, [products, active, sort, shape]);
  useEffect(() => { setLocalShape(initialShape); }, [initialShape]);
  useEffect(() => { setSort(initialSort); }, [initialSort]);
  useEffect(() => { setShown(8); }, [active, sort, shape]);
  useEffect(() => { const node = sentinel.current; if (!node || shown >= filtered.length) return; const observer = new IntersectionObserver(entries => { if (entries[0].isIntersecting) setShown(current => Math.min(current + 8, filtered.length)); }, { rootMargin: "160px" }); observer.observe(node); return () => observer.disconnect(); }, [shown, filtered.length]);
  return <>
    {!hasStrip && <section className="shell collection-shapes" aria-label="Choose a diamond shape">
      <ShapeSelector selected={shape} onSelect={value => setLocalShape(current => current === value ? undefined : value)}/>
    </section>}
    <div className="shell collection-toolbar">
      {hasStrip && <h2 className="sr-only">Products</h2>}
      <p className="product-spec" role="status">{filtered.length} pieces{shape ? ` · ${shape}` : ""}</p>
      <select className="sort-select" value={sort} onChange={event => setSort(event.target.value)} aria-label="Sort collection">
        <option value="featured">Featured</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option><option value="rating">Highest rated</option>
      </select>
    </div>
    <div className="shell plp-layout">
      <FilterSidebar active={active} onToggle={toggle} onClear={() => setActive([])} resultCount={filtered.length} mobileOpen={mobileFiltersOpen} onClose={() => setMobileFiltersOpen(false)}/>
      <div>
        <button className="button button-outline button-small mobile-filters" onClick={() => setMobileFiltersOpen(true)}>Filters {active.length ? `(${active.length})` : ""}</button>
        {(active.length > 0 || shape) && <div className="active-filter-pills">
          {shape && <button className="filter-pill" onClick={clearShape} aria-label={`Clear ${shape} shape filter`}>{shape} ×</button>}
          {active.map(filter => <button className="filter-pill" onClick={() => toggle(filter)} key={filter}>{filter} ×</button>)}
        </div>}
        <div className="product-grid">{filtered.slice(0, shown).map(product => <ProductCard product={product} key={product.slug}/>)}</div>
        {filtered.length === 0 && <div className="empty-state"><h3>No pieces match those details</h3><button className="button button-outline" onClick={() => { setActive([]); clearShape(); }}>Clear filters</button></div>}
        {shown < filtered.length ? <div className="skeletons" ref={sentinel} aria-label="Loading more rings"><div className="skeleton"/><div className="skeleton"/><div className="skeleton"/></div> : <div className="load-more"><span className="label">You have seen the full collection</span></div>}
      </div>
    </div>
  </>;
}
