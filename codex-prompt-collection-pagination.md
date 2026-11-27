# Codex prompt: page numbers on collection pages

Copy everything below the line into Codex.

---

You are working in the GEMOIRE storefront repo: Next.js 15.5 (App Router), React 19, SQLite through better-sqlite3. Storefront styling is hand-written CSS in `src/app/globals.css` and `src/app/storefront.css`; the admin under `/admin` is styled with Tailwind utilities. This document is the whole brief. Ignore the other `codex-prompt*.md` and `*-PROMPT*.md` files in the repo root.

## The request

The client's note:

> 06. Pagination. As we discuss and as per this reference, add pagination to the collection page, with page numbers and previous/next arrow buttons. (reference from ourosjewels.com)

The reference screenshot is not in the repo. It shows one row of small square buttons with rounded corners and a thin border: a previous arrow, the numbers 1 to 5, a next arrow. The current page is a filled dark box with light text, and the previous arrow is greyed out on page 1. ourosjewels.com is a Shopify store, so each of its page links is a plain `?page=N` URL.

Today a collection page (`/collections/<slug>`) has no pages. `src/app/collections/[slug]/collection-client.tsx` shows the first 8 products and adds 8 more each time a row of three grey skeleton boxes scrolls into view (an `IntersectionObserver` on `.skeletons`). At the end of the list it prints "You have seen the full collection". This task replaces all of that with numbered pages.

## What to build

These points are decided. I built this change in a copy of the repo at `ec1433d`, ran a production build and drove it in headless Chrome. Every number in this brief comes from that build.

1. **Twelve products a page.** The grid has 3 columns from 1181px, 2 columns from 360px to 1180px and 1 column below 360px, so a page size that is a multiple of 6 ends every full page on a full row. With today's catalogue four collections have more than one page: Sale (45 products, 4 pages), Engagement Rings (31, 3 pages), Ready-to-Ship (16, 2 pages) and the admin-managed Mira collection (13, 2 pages). Every other collection has 12 products or fewer and shows no pagination at all.
2. **The page number lives in the URL** as `?page=N`. Page 1 has no parameter. Other parameters (`shape`, `setting`) are kept.
3. **Page links are real links that the page handles itself.** Each one is an `<a href>`, so it can be crawled, copied and opened in a new tab. A plain click is intercepted and changes the URL with `window.history.pushState`, which asks the server for nothing. Clicks with Ctrl, Cmd, Shift or Alt are left to the browser.
4. **A page that does not exist.** `?page=99` shows the last page. A value that is not a plain positive integer (`abc`, `0`, `-2`, `2.5`, `02`) shows page 1. The URL is not rewritten in either case.
5. **Changing the result set returns to page 1.** That covers a sidebar filter, a filter pill, "Clear all", "Clear filters", the sort menu and the shape (the shape row, a subcategory tile, the shape pill). The reset adds no history entry of its own.
6. **After a click on a page link** the toolbar ("45 pieces" and the sort menu) sits directly under the sticky header and keyboard focus moves to the product grid, so the next Tab reaches the first product of the new page.
7. **Back and Forward** step through the pages, and the browser restores the scroll position of each one.
8. **The row** is a previous arrow, at most five numbered slots and a next arrow. Up to five pages are all listed. Past that the first and the last page always show and `…` stands for two or more hidden pages: `1 2 3 … 9` on pages 1 to 3, `1 … 5 … 9` in the middle, `1 … 7 8 9` on the last three. That is seven boxes at most, which is what fits a 320px phone. At either end the arrow that leads nowhere stays in place, greyed out, so the row does not shift.
9. **The infinite scroll goes**: the skeleton row, the observer, the "You have seen the full collection" line and their CSS.

Why the URL and not component state: in the prototype, opening a product from page 2 and pressing Back returned to `/collections/sale?page=2` with the same 12 cards at the same scroll position (1071px before and after). With today's infinite scroll, Back lands on a list that has shrunk to its first 8 products.

Why no server round trip: `page.tsx` already sends the whole collection to the client, and filtering and sorting happen there. A `next/link` or `router.push` would re-run the server page and download every product again on each click. `next/link` would also prefetch each page link as it scrolls into view.

### How it looks

The reference, in this site's own palette and shapes. The values below are what I built and looked at in screenshots.

- One centred row under the grid, 40px below the last row of cards.
- Boxes are 40×40px with a 6px gap from 768px up, and 44px tall with a 4px gap at 767px and narrower. On phones a box is 44px wide and shrinks only when the row does not fit (seven boxes are 36.6px wide each at 320px).
- A box has a `--cullen-white` background, a 1px `--cullen-border` border and a 4px radius, like `.shape-card` and the subcategory tiles. The number is 13px, weight 500, `--cullen-charcoal`, in the body font.
- The current page is filled `--cullen-forest` with white text. Hover (pointer devices only) is a `--cullen-gold-light` background with a `--cullen-forest` border. Focus is the site's existing ring for links.
- The arrows are single chevrons drawn as inline SVG. The reference uses double chevrons; those usually mean "first" and "last", and these buttons move one page.
- A greyed-out arrow is `--cullen-border-dark`. The `…` has no box and is `--cullen-muted`.

## Four traps

I hit each of these in the prototype. The code below already handles them. They matter if you write it another way.

1. **`useSearchParams` lags one render behind `pushState`.** Next patches `history.pushState` and `replaceState` so the router follows them (see `node_modules/next/dist/client/components/app-router.js`, "Patch pushState…"), but it applies the new URL inside `startTransition`. A filter or sort change is ordinary state and renders first. I measured it: on page 3 of Sale, switching the sort to "Price: high to low" committed page 3 of the new order (first card `kavya-toi-et-moi`) and only then page 1 (`mira-brilliance-band`). The fix is `useOptimistic` around the page number, the same idiom this file already uses for `urlShape`. With it the grid changes once, straight to page 1.
2. **Don't reset the page from an effect.** Today `useEffect(() => { setShown(8); }, [active, sort, shape])` resets the list. An effect like that also runs on mount, so it would strip `?page=3` from every shared link. Reset the page in the event handlers instead.
3. **The sticky header is taller than the site's anchor offset.** `globals.css` has `[id] { scroll-margin-top: 100px; }`, but once the page has scrolled `.site-header` is 136px tall at 1024px and wider (73px at 901 and 768, 65px at 767 and 481, 61px at 480 and narrower). With a fixed 100px offset the toolbar landed 36px under the header on desktop. Measure the header when you scroll.
4. **The footer starts where the list ends.** Nothing but the "You have seen the full collection" block (55.6px tall) separated the grid from the footer. Without it the last row of cards touches the footer on every collection page. `.plp-layout` gets `padding-bottom: 56px` to keep that distance.

## The change

Five files: two new, three edited.

| File | Change |
| --- | --- |
| `src/lib/pagination.ts` | New. Page size and three pure helpers. |
| `src/components/commerce/pagination.tsx` | New. The row of links. |
| `src/app/collections/[slug]/collection-client.tsx` | Page state from the URL, the reset on filter changes, the row. Infinite scroll removed. |
| `src/app/storefront.css` | New `.pagination` block, bottom padding, dead skeleton rules removed. |
| `tests/domain.test.mjs` | One new test for the helpers. |

The same change may still be on this machine as a patch against `ec1433d`, with the five finished files next to it:

```
C:\Users\aashu\AppData\Local\Temp\gemoire-audit\pagination\reference\pagination.patch
C:\Users\aashu\AppData\Local\Temp\gemoire-audit\pagination\reference\files\
```

If the patch is there and `git apply --check <patch>` passes, apply it and read the diff against the sections below. I tested that it applies to a working tree with this repo's line endings. If it is gone or does not apply, make the edits by hand. The sections below are the same change.

If you find a cleaner way to get the same behaviour, use it and say so in your report. The nine points under "What to build" are decided, and the checks under "Verify" are the gate.

### 1. `src/lib/pagination.ts` (new)

Keep this file free of imports, so `tests/domain.test.mjs` can import it directly.

```ts
// Collection page pagination. Pure helpers with no imports, so tests/domain.test.mjs can
// import this file directly (Node strips the types but does not resolve the "@/" alias).

// A multiple of 6, so a full page ends on a full row in the 3-column and the 2-column grid.
export const PRODUCTS_PER_PAGE = 12;

export type PaginationItem = number | "gap";

// `?page=` as a page number. Anything but a plain positive integer ("0", "-1", "1.5", "2abc",
// "02", a missing value) is page 1.
export function parsePage(value: string | null | undefined): number {
  return value && /^[1-9][0-9]{0,8}$/.test(value) ? Number(value) : 1;
}

export function pageCount(total: number, perPage: number = PRODUCTS_PER_PAGE): number {
  return Math.max(1, Math.ceil(total / perPage));
}

// The page to show for a requested page: a page past the end shows the last page.
export function clampPage(page: number, count: number): number {
  return Math.min(Math.max(1, page), Math.max(1, count));
}

// The numbered slots between the two arrows: never more than five, so the row is at most seven
// boxes wide and fits a 320px phone. Up to five pages are all listed. Past that the first and
// the last page always show and a gap stands for at least two hidden pages.
export function paginationItems(current: number, count: number): PaginationItem[] {
  if (count <= 5) return Array.from({ length: Math.max(1, count) }, (_, index) => index + 1);
  if (current <= 3) return [1, 2, 3, "gap", count];
  if (current >= count - 2) return [1, "gap", count - 2, count - 1, count];
  return [1, "gap", current, "gap", count];
}
```

### 2. `src/components/commerce/pagination.tsx` (new)

```tsx
"use client";

import type { MouseEvent } from "react";
import { paginationItems } from "@/lib/pagination";

type Direction = "previous" | "next";

const Chevron = ({ direction }: { direction: Direction }) => <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d={direction === "previous" ? "M10 3 5 8l5 5" : "m6 3 5 5-5 5"}/></svg>;

// Page links are real links (href, so they can be crawled and opened in a new tab). The owner
// decides in onNavigate whether a click is handled in the page.
export function Pagination({ page, pageCount, hrefFor, onNavigate }: { page: number; pageCount: number; hrefFor: (page: number) => string; onNavigate: (page: number, event: MouseEvent<HTMLAnchorElement>) => void }) {
  if (pageCount <= 1) return null;
  const arrow = (direction: Direction) => {
    const target = direction === "previous" ? page - 1 : page + 1;
    // At either end the arrow stays in place, greyed out, so the row does not shift.
    if (target < 1 || target > pageCount) return <span className="pagination-link pagination-arrow is-disabled" aria-hidden="true"><Chevron direction={direction}/></span>;
    return <a className="pagination-link pagination-arrow" href={hrefFor(target)} rel={direction === "previous" ? "prev" : "next"} aria-label={direction === "previous" ? "Previous page" : "Next page"} onClick={event => onNavigate(target, event)}><Chevron direction={direction}/></a>;
  };
  return <nav className="pagination" aria-label="Pagination">
    <ul className="pagination-list" role="list">
      <li>{arrow("previous")}</li>
      {paginationItems(page, pageCount).map((item, index) => item === "gap"
        ? <li className="pagination-gap" aria-hidden="true" key={`gap-${index}`}>…</li>
        : <li key={item}>{item === page
          ? <span className="pagination-link" aria-current="page"><span className="sr-only">Page </span>{item}</span>
          : <a className="pagination-link" href={hrefFor(item)} onClick={event => onNavigate(item, event)}><span className="sr-only">Page </span>{item}</a>}</li>)}
      <li>{arrow("next")}</li>
    </ul>
  </nav>;
}
```

The links are plain `<a>` elements on purpose, not `next/link`. The current page is a `<span>`, not a link to itself. `.sr-only` already exists in `globals.css`.

### 3. `src/app/collections/[slug]/collection-client.tsx`

This file is written as long single-line JSX. Make surgical edits and don't reformat lines you are not changing. `page.tsx` needs no change: the client reads `page` itself through `useSearchParams`, which needs no Suspense boundary here because the route is `force-dynamic`.

**Imports.** The whole import block becomes:

```tsx
import { startTransition, useEffect, useMemo, useOptimistic, useRef, useState, type MouseEvent } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Product } from "@/data/products";
import { ProductCard } from "@/components/commerce/product-card";
import { FilterSidebar } from "@/components/commerce/filter-sidebar";
import { Pagination } from "@/components/commerce/pagination";
import { ShapeSelector } from "@/components/commerce/shape-selector";
import { PRODUCTS_PER_PAGE, clampPage, pageCount as countPages, parsePage } from "@/lib/pagination";
import type { DiamondShape } from "@/lib/product-options";
```

**Router hooks.** Next to `useRouter`:

```tsx
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
```

**Page state, and `clearShape`.** The block below goes directly after `const shape = hasStrip ? urlShape : localShape;`. Its last nine lines replace the existing `clearShape`, which gains three things: a reset on pages with the shape row, a reset when there is no shape to clear, and `page` dropped together with `shape` on pages with the strip.

```tsx
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
```

**State and refs.** Delete the `shown` state and the `sentinel` ref. Add three refs, and make `toggle` reset the page:

```tsx
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const toolbar = useRef<HTMLDivElement>(null);
  const grid = useRef<HTMLDivElement>(null);
  const jumpToResults = useRef(false);
  const toggle = (filter: string) => { resetPage(); setActive(current => current.includes(filter) ? current.filter(item => item !== filter) : [...current, filter]); };
```

**After the `filtered` memo.** Delete the effect that calls `setShown(8)` and the `IntersectionObserver` effect. Keep the two effects that sync `initialShape` and `initialSort`. The result:

```tsx
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
```

`behavior: "instant"` is deliberate. `html` has `scroll-behavior: smooth`, and `"auto"` would follow it.

**The JSX.** Seven fragments change. Before, in file order:

```tsx
<ShapeSelector selected={shape} onSelect={value => setLocalShape(current => current === value ? undefined : value)}/>
<div className="shell collection-toolbar">
<p className="product-spec" role="status">{filtered.length} pieces{shape ? ` · ${shape}` : ""}</p>
<select className="sort-select" value={sort} onChange={event => setSort(event.target.value)} aria-label="Sort collection">
onClear={() => setActive([])}
<div className="product-grid">{filtered.slice(0, shown).map(product => <ProductCard product={product} key={product.slug}/>)}</div>
{shown < filtered.length ? <div className="skeletons" ref={sentinel} aria-label="Loading more rings"><div className="skeleton"/><div className="skeleton"/><div className="skeleton"/></div> : <div className="load-more"><span className="label">You have seen the full collection</span></div>}
```

After:

```tsx
<ShapeSelector selected={shape} onSelect={value => { resetPage(); setLocalShape(current => current === value ? undefined : value); }}/>
<div className="shell collection-toolbar" ref={toolbar}>
<p className="product-spec" role="status">{filtered.length} pieces{shape ? ` · ${shape}` : ""}{pageCount > 1 && <span className="sr-only">, page {page} of {pageCount}</span>}</p>
<select className="sort-select" value={sort} onChange={event => { resetPage(); setSort(event.target.value); }} aria-label="Sort collection">
onClear={() => { resetPage(); setActive([]); }}
<div className="product-grid" ref={grid} tabIndex={-1}>{filtered.slice((page - 1) * PRODUCTS_PER_PAGE, page * PRODUCTS_PER_PAGE).map(product => <ProductCard product={product} key={product.slug}/>)}</div>
<Pagination page={page} pageCount={pageCount} hrefFor={pageHref} onNavigate={onPageLink}/>
```

The visible count line is unchanged. The hidden ", page 2 of 4" makes the existing `role="status"` announce a page change to screen readers. The "Clear filters" button in the empty state keeps its code (`setActive([]); clearShape();`), because `clearShape` now ends on page 1 on every path.

### 4. `src/app/storefront.css`

The file has CRLF line endings. Keep them, and touch nothing outside these three places.

**Bottom padding** on the base `.plp-layout` rule (trap 4):

```css
.plp-layout {
  display: grid;
  gap: 34px;
  grid-template-columns: 220px minmax(0, 1fr);
  padding-bottom: 56px;
  padding-top: 40px;
}
```

**The grid rules.** `.skeletons` shares four selectors with `.product-grid`: the base rule and the 1180px, 480px and 359px blocks. Drop it from all four. The declarations stay as they are:

```css
.product-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

@media (max-width: 1180px) {
  .product-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 480px) {
  .product-grid {
    gap: 12px;
  }
}

@media (max-width: 359px) {
  .product-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
```

**The pagination block.** Between the `@media (max-width: 480px)` rule for `.price-pair, .card-rating` and the `/* ===== PRODUCT DETAIL PAGE ===== */` comment there are four rules that nothing uses after this change: `.load-more`, `.skeletons`, `.skeleton` and `@keyframes shimmer`. Replace those four with the block below. The `.shimmer` class further down belongs to the product page and uses a different animation (`price-flash`); leave it.

```css
/* ===== COLLECTION PAGINATION =====
   Page links under the product grid (src/components/commerce/pagination.tsx): two
   arrows and at most five numbered slots, so seven boxes at most. Base rules first,
   then the phone block after the rules it overrides. */
.pagination {
  margin-top: 40px;
}

.pagination-list {
  display: flex;
  gap: 6px;
  justify-content: center;
  list-style: none;
  margin: 0;
  padding: 0;
}

/* Each slot may shrink: seven 44px boxes do not fit a 320px phone. */
.pagination-list > li {
  flex: 0 1 40px;
  min-width: 0;
}

.pagination-link,
.pagination-gap {
  align-items: center;
  display: flex;
  font-size: 13px;
  font-variant-numeric: tabular-nums;
  height: 40px;
  justify-content: center;
  line-height: 1;
}

.pagination-link {
  background-color: var(--cullen-white);
  border: 1px solid var(--cullen-border);
  border-radius: 4px;
  color: var(--cullen-charcoal);
  font-weight: 500;
  transition: background-color .2s ease, border-color .2s ease, color .2s ease;
}

.pagination-link[aria-current="page"] {
  background-color: var(--cullen-forest);
  border-color: var(--cullen-forest);
  color: var(--cullen-white);
}

.pagination-link.is-disabled {
  color: var(--cullen-border-dark);
}

.pagination-gap {
  color: var(--cullen-muted);
}

.pagination-arrow svg {
  fill: none;
  height: 14px;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.5;
  width: 14px;
}

/* Pointer devices only, so a tapped link does not stay tinted. */
@media (hover: hover) {
  a.pagination-link:hover {
    background-color: var(--cullen-gold-light);
    border-color: var(--cullen-forest);
  }
}

@media (max-width: 767px) {
  .pagination-list {
    gap: 4px;
  }

  .pagination-list > li {
    flex-basis: 44px;
  }

  .pagination-link,
  .pagination-gap {
    height: 44px;
  }
}

/* The grid takes focus after a page change so that Tab continues from the first
   piece. It is not a control, so it shows no focus ring. */
.product-grid:focus-visible {
  outline: none;
}
```

Use literal pixels in `@media` conditions. `var()` inside a media query makes the whole block never match.

### 5. `tests/domain.test.mjs`

Add the import under the `collectionSubcategories` import:

```js
import { PRODUCTS_PER_PAGE, clampPage, pageCount, paginationItems, parsePage } from "../src/lib/pagination.ts";
```

Add this test at the end of the file:

```js
test("collection pagination reads the page parameter, counts pages and lists at most five slots", () => {
  assert.equal(PRODUCTS_PER_PAGE % 6, 0, "a full page must end on a full row in the 3-column and the 2-column grid");
  for (const [value, page] of [["1", 1], ["2", 2], ["37", 37], [undefined, 1], [null, 1], ["", 1], ["0", 1], ["-2", 1], ["2.5", 1], ["02", 1], ["2abc", 1], ["abc", 1], [" 2", 1], ["1e3", 1], ["9999999999", 1]]) {
    assert.equal(parsePage(value), page, `parsePage(${JSON.stringify(value)})`);
  }
  for (const [total, pages] of [[0, 1], [1, 1], [12, 1], [13, 2], [24, 2], [25, 3], [45, 4]]) assert.equal(pageCount(total, 12), pages, `pageCount(${total}, 12)`);
  for (const [requested, count, shown] of [[1, 4, 1], [3, 4, 3], [99, 4, 4], [0, 4, 1], [2, 1, 1], [2, 0, 1]]) assert.equal(clampPage(requested, count), shown, `clampPage(${requested}, ${count})`);

  const rows = {
    "1/1": [1], "1/4": [1, 2, 3, 4], "3/5": [1, 2, 3, 4, 5],
    "1/6": [1, 2, 3, "gap", 6], "3/6": [1, 2, 3, "gap", 6], "4/6": [1, "gap", 4, 5, 6],
    "4/7": [1, "gap", 4, "gap", 7], "5/7": [1, "gap", 5, 6, 7],
    "64/128": [1, "gap", 64, "gap", 128], "128/128": [1, "gap", 126, 127, 128],
  };
  for (const [key, expected] of Object.entries(rows)) {
    const [current, count] = key.split("/").map(Number);
    assert.deepEqual(paginationItems(current, count), expected, `paginationItems(${key})`);
  }
  for (let count = 1; count <= 40; count++) {
    for (let current = 1; current <= count; current++) {
      const label = `page ${current} of ${count}`;
      const items = paginationItems(current, count);
      const numbers = items.filter(item => item !== "gap");
      assert.equal(items.length, Math.min(count, 5), `${label}: the row keeps its width from page to page`);
      assert.ok(numbers.includes(current), `${label}: the current page is listed`);
      assert.equal(numbers[0], 1, `${label}: the first page is listed`);
      assert.equal(numbers.at(-1), count, `${label}: the last page is listed`);
      items.forEach((item, index) => {
        if (item !== "gap") return;
        assert.ok(items[index + 1] - items[index - 1] >= 3, `${label}: a gap stands for at least two pages`);
      });
      numbers.forEach((number, index) => { if (index > 0) assert.ok(number > numbers[index - 1], `${label}: pages ascend without repeats`); });
    }
  }
});
```

## Leave these as they are

They look related and are not part of this task.

- **`src/app/collections/[slug]/page.tsx`**, including `generateMetadata`. Every `?page=N` keeps the collection's own canonical URL and title. Whether paged URLs should carry their own canonical is an SEO decision for the client and a separate change.
- **Filters and sort stay out of the URL.** They are component state today and remain so. One consequence: Back from a product restores the page number but not the filters, which were already lost on Back before this change. Mention it in your report.
- **`src/components/commerce/collection-subcategories.tsx` and its data file.** The tile links have no `page` parameter, which is what returns a shape change to page 1.
- **`filter-sidebar.tsx`, `product-card.tsx`, `shape-selector.tsx`.** No change is needed in any of them.
- **`AdminPagination` in `src/components/admin/data-table.tsx`.** It is the admin's own Tailwind control. Don't reuse it and don't restyle it.
- **`[id] { scroll-margin-top: 100px; }` in `globals.css`.** It is too small for the desktop header (trap 3), and it affects every anchor on the site. Not this task. Mention it in your report.
- **No effect that writes the URL.** An out-of-range page is corrected for display only (`clampPage`). Don't add an effect that rewrites `?page=99` to the last page.
- **No extras:** no page-size menu, no "Showing 13–24 of 45" line, no "Load more" button, no first and last buttons, no new dependency.
- **`scripts/verify-storefront.mjs`** is stale and is not a gate. It needs a server on port 3000 and fails at its first navigation check. This change makes two more of its checks out of date: it expects the first 8 cards of a collection in the server HTML (`expected.slice(0, 8)`), and there are now 12. Don't repair it. Mention it in your report.

## Before you start

1. Run `git status` and `git log --oneline -3`. I expect branch `fix/product-card-price` at `ec1433d fix: make the product card price larger`, or a later commit, with a clean tree apart from untracked `codex-prompt*.md` files and possibly a modified `next-env.d.ts`. If any of the three files this task edits is already modified, stop and say so: that is another session's unfinished work and it would end up in your commit.
2. Confirm the starting point: `grep -c "skeletons" "src/app/collections/[slug]/collection-client.tsx" src/app/storefront.css` prints 1 for the component and 5 for the stylesheet, and `ls src/lib/pagination.ts src/components/commerce/pagination.tsx` finds neither file. If the infinite scroll is already gone, stop and say so.
3. Create `feat/collection-pagination` from the current HEAD. If other files under `src/`, `tests/` or `scripts/` are modified, stay on the branch that is checked out and leave that work exactly as it is: no stash, no revert, no reformatting.
4. Record a baseline with `npm run typecheck` and `npm run test:domain`. The typecheck can take several minutes here, because the repo is in a OneDrive folder. A failing domain test prints a whole stylesheet, so filter the output: `node --test tests/domain.test.mjs 2>&1 | grep -aE "^(ℹ|✖)"`. At `ec1433d` I get a clean typecheck and 31 tests, 28 passing and 3 failing ("currency choice is searchable…", "header exposes the requested click-to-call number", "storefront responsive rules cover tablet, mobile, and narrow phones"). Those three are old regex mismatches. The third one mentions `.skeletons`, but it fails at its first assertion, long before that line. Don't fix them. If your numbers differ, your own baseline is the one that counts.

## Verify

1. **Static.** `npm run typecheck` is clean. `npm run test:domain` gives your baseline plus one passing test: I get 32 tests, 29 passing, and the same 3 failing. `grep -rn "skeleton\|load-more\|IntersectionObserver\|keyframes shimmer" src` finds nothing.
2. **Server.** Look at what is listening before you build: `netstat -ano | grep -E ":(3000|3100) "`.
   - Port 3100 is free: run `npm run build` (about two minutes), then `npx next start -p 3100`, and stop that server by PID when you finish. The build must pass without a "useSearchParams() should be wrapped in a suspense boundary" error. If it fails in a file you did not touch, don't fix it. Report it.
   - Port 3100 is in use: another session is serving `.next` from there. Don't run `npm run build`, because it rewrites the files that server is reading, and don't stop that server. Use the dev server on port 3000 if it answers (`curl --max-time 60 http://localhost:3000/`).
   - Port 3000 belongs to the user. Never stop or restart it. It has been unresponsive for long stretches, so don't count on it.
   - Never start a second `next dev` in this folder, because both would write `.next-dev`. If no server is usable, report the static checks and say that the browser checks were not run.
3. **Server HTML** (the first page of each URL is server-rendered, so `curl` is enough). Count `<article class="product-card` and read `<nav class="pagination"`.

   | Path | Cards | Row, current page in brackets |
   | --- | --- | --- |
   | `/collections/sale` | 12 | arrow off, [1], 2, 3, 4, next |
   | `/collections/sale?page=2` | 12 | previous, 1, [2], 3, 4, next |
   | `/collections/sale?page=4`, `?page=5`, `?page=99` | 9 | previous, 1, 2, 3, [4], arrow off |
   | `/collections/sale?page=abc`, `0`, `-2`, `2.5`, `02` | 12 | same as page 1 |
   | `/collections/engagement?page=3` | 7 | previous, 1, 2, [3], arrow off |
   | `/collections/engagement?shape=Cushion&page=2` | 7 | none |
   | `/collections/ready-to-ship?page=2` | 4 | previous, 1, [2], arrow off |
   | `/collections/mira?page=2` | 1 | previous, 1, [2], arrow off |
   | `/collections/aaria` (exactly 12 products) | 12 | none |
   | `/collections/kavya`, `best-sellers`, `wedding` | 11, 8, 6 | none |

   Also: the link to page 1 is the path without `page` (`/collections/sale`) and the others end in `?page=N`. The count line reads "45 pieces" with ", page 2 of 4" inside an `sr-only` span, and on a single-page collection it has no span. With the default sort, Sale's pages start at `gold-initials-charm`, `aaria-radiant-still`, `mira-emerald-trio` and `aaria-cathedral-oval` (product slugs, from the local database as it is today).
4. **Browser checks** in headless Chrome (`C:/Program Files/Google/Chrome/Application/chrome.exe`; Node 24 has a built-in `WebSocket`, so the DevTools Protocol needs no dependencies). Use real mouse and key events. Wait for network idle before navigating away or closing Chrome: on `next start`, a `/_next/image` request that is aborted in its first few milliseconds can leave that image hanging for every later request until the server restarts. Scroll with `behavior: "instant"` before you measure or click, because `html` has `scroll-behavior: smooth`. `element.focus()` fires no focus events in headless Chrome unless you send `Emulation.setFocusEmulationEnabled` first.

   **Clicks**, on `/collections/sale` at 1536×864:
   - Click "2": the URL is `/collections/sale?page=2`, the grid shows 12 cards starting at `aaria-radiant-still`, "2" is the current page, `history.length` grew by one, the top of `.collection-toolbar` equals the bottom of `.site-header` (136), and `document.activeElement` is `.product-grid`. No request went to a path that starts with `/collections/`. Requests to `/products/…?_rsc=…` are Next prefetching the product links that came into view, as it did before.
   - The next arrow goes to page 3. "4" goes to page 4, which has 9 cards and a greyed-out next arrow.
   - Back three times shows pages 3, 2 and 1, the last at `/collections/sale`. Forward shows page 2. `history.length` does not change. The browser restores each page's scroll position, so Back lands near the row at the bottom, where the click was made.
   - Ctrl+click and Shift+click on a page link: the page does not call `preventDefault`, and this tab's URL and grid do not change.
   - Loading `/collections/sale?page=3` directly shows 12 cards starting at `mira-emerald-trio` with no console error. Loading `?page=99` shows page 4 and leaves the URL alone, and a click on "2" from there gives `?page=2`.

   **One commit per change.** Record every change to the children of `.product-grid` with a `MutationObserver` and check that each of these changes the grid exactly once:
   - On `/collections/sale?page=3`, set the sort to "Price: high to low": the grid goes from `mira-emerald-trio` straight to `mira-brilliance-band`, the URL becomes `/collections/sale`, "1" is current and `history.length` is unchanged. A commit that starts at `kavya-toi-et-moi` in between is trap 1.
   - From page 2 of that order, tick "Yellow Gold": 11 cards starting at `kavya-heart-halo`, no row, no `page` in the URL.
   - On `/collections/sale`, go to page 3 and click "Cushion" in the shape row: "8 pieces · Cushion", no row, no `page` in the URL.

   **Keyboard.** Focus the "2" link and press Enter: page 2 shows, the grid has focus and no outline, and the next Tab lands on the first card's link (`/products/aaria-radiant-still…`), which is inside the viewport.

   **Product and back.** On page 2, scroll to the fifth card, click it, wait for the product page, press Back: the URL is `/collections/sale?page=2`, the same 12 cards show and `scrollY` is what it was.

   **A page with the subcategory strip**, `/collections/engagement`:
   - Go to page 3 (7 cards), then click the "Cushion" tile: the URL is `/collections/engagement?shape=Cushion`, the line reads "7 pieces · Cushion", there is no row and the grid changed once. Back returns to `?page=3`.
   - Load `/collections/engagement?shape=Cushion&page=2`: 7 cards and no row. Remove the "Cushion ×" pill: 12 cards starting at `aaria-east-west-oval`, "31 pieces", then the URL becomes `/collections/engagement`. The grid changes once.

   **"Clear filters" ends on page 1** in each of these:
   - `/collections/engagement?shape=Heart&page=2` shows "0 pieces · Heart". Clear filters gives `/collections/engagement`, 31 pieces, page 1.
   - On `/collections/sale?page=3`, click "Heart" in the shape row: "0 pieces · Heart" and the URL is already `/collections/sale`. Clear filters gives 45 pieces, page 1.
   - On `/collections/engagement`, click 2, click 3, press Back, tick "IGI Certified" (no product matches it; its filter group is collapsed, so open it first or call `.click()` on the input), press Forward: the URL is `?page=3` with "0 pieces". Clear filters gives `/collections/engagement`, 31 pieces, page 1.

   **Layout**, on `/collections/sale?page=2`. Load the page once at 1536 and resize the viewport, because a fresh load at a phone width can take two minutes to go idle.

   | Viewport | Box | Gap | Row width (six boxes) | Header bottom after a click |
   | --- | --- | --- | --- | --- |
   | 1536, 1280, 1181, 1180, 1024 | 40×40 | 6 | 270 | 136 |
   | 901, 900, 768 | 40×40 | 6 | 270 | 73 |
   | 767, 600, 481 | 44×44 | 4 | 284 | 65 |
   | 480, 414, 390, 375, 360, 359 | 44×44 | 4 | 284 | 61 |
   | 320 | 43.33×44 | 4 | 280 | 61 |

   At every one of those widths:
   - The row is centred on the product grid (the space left and right of it is equal) and no box extends past the grid.
   - The row starts 40px below the grid and the footer starts 56px below the row.
   - After a click on a page link the top of `.collection-toolbar` equals the bottom of `.site-header`.
   - A link's text is 13px, weight 500, `rgb(28, 25, 23)`, on white with a `rgb(231, 227, 218)` border. The current page is `rgb(27, 56, 43)` with white text.

   On `/collections/kavya`, `/collections/aaria` and `/collections/wedding` there is no row and the footer starts 56px below the grid at 1536, 768 and 375.

   **Seven boxes.** No collection has more than four pages today, so replace the contents of `.pagination-list` in the page with a seven-slot row built from the same classes, for example previous, 1, …, 64, …, 128, next. The boxes are 40×40 (row 316) at 1536 and 768, 44×44 (row 332) from 480 down to 375, 42.3×44 at 360, 42.15×44 at 359 and 36.57×44 at 320, where the row is exactly the grid's 280px. Nothing wraps or overflows, and "128" fits its box.
5. **Screenshots to take and look at:** the row on `/collections/sale?page=2` at 1536, 768, 375 and 320; the same row with a link hovered and with a link focused at 1536; the seven-box row at 1536 and 320; the viewport straight after a click on a page link at 1536 and 375; the bottom of `/collections/kavya` at 1536. The row should read as part of this site, the current page should be obvious at a glance, and the header should not cover the count line after a click.

The two scripts I used may still be on this machine, in `C:\Users\aashu\AppData\Local\Temp\gemoire-audit\pagination\scripts\`. `probe.mjs` imports the driver `..\..\sub\cdp3.mjs`. Both assume the class names in this brief. Run them on your build as:

```
ORIGIN=http://localhost:3100 node html-checks.mjs
ORIGIN=http://localhost:3100 OUT=<an absolute folder for screenshots> node probe.mjs behave flicker keys product strip empty layout stress shots bottom
```

The second takes about ten minutes. It prints one JSON line per step. My output from the build described here is in `..\reference\` (`html.log`, `behaviour.log`, `layout.log`, and the screenshots as PNG files); yours should match it apart from the `_rsc` tokens and a few pixels of `scrollY` after Back. The lines to look for:

- after a click, `"toolbarTop"` equals `"headerBottom"` and `"active":"DIV.product-grid"`;
- every `renders:` line holds exactly one `commit` entry (each entry is the card count, the first card and the query string at that moment);
- every `requests:` line holds only `/products/…` paths and footer links, never `/collections/…`;
- every layout line ends `"overflow":false`, and every scroll line reads `gap 0 active DIV.product-grid`;
- the last line of each run is `page errors: []`.

The `bottom-*.png` shots are stitched from beyond the viewport, so the sticky header is drawn across the middle of them. That is the capture, not the layout. `reference\control-without-optimistic.log` is the same sort test on a build without the optimistic value. It shows the extra commit of trap 1. Recreate the scripts if the folder is gone.

Four things I did not check, so say so if you cannot either: browsers other than Chrome, a real phone, a screen reader (whether the hidden ", page 2 of 4" is announced as intended) and the dev server (every number here is from `next build` and `next start`).

## Commit

One commit with the five files. Add the two new files, then commit by path, which leaves out whatever else is staged:

```
git add src/lib/pagination.ts src/components/commerce/pagination.tsx
git commit -m "feat: paginate collection pages" -- src/lib/pagination.ts src/components/commerce/pagination.tsx "src/app/collections/[slug]/collection-client.tsx" src/app/storefront.css tests/domain.test.mjs
```

For the change exactly as written here, `git show --stat` reports 5 files changed, 247 insertions and 37 deletions (`storefront.css` 90 and 20, `collection-client.tsx` 57 and 17, the test file 37, the two new files 32 and 31). If the stat shows thousands of lines for `storefront.css`, your editor rewrote its CRLF line endings: undo that and make the edit without touching the rest of the file. Don't push.

## Report

In your final message give the diff, the baseline and final test numbers, which server you used for the browser checks, the measured result of each check, and which screenshots you looked at. List anything you assumed, anything you changed that this brief did not ask for, and anything you could not verify.

Repeat these so they reach the client:

- Pages hold 12 products, so today only Sale, Engagement Rings, Ready-to-Ship and the Mira collection show page numbers. The other collections fit on one page.
- The scroll-to-load list and the "You have seen the full collection" line are gone.
- The arrows are single chevrons and the colours are the site's own; the reference has double chevrons and a navy current page.
- Filters and sort are not in the URL, so Back from a product keeps the page number but not the filters, as before.
- Paged URLs keep the collection's canonical URL. Changing that is an open SEO decision.
- The site-wide anchor offset (`scroll-margin-top: 100px`) is smaller than the 136px desktop header. This change does not touch it.
- `scripts/verify-storefront.mjs` has two more out-of-date checks (first 8 cards).
