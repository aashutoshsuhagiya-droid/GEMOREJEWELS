# Codex prompt: collection subcategory strip

Copy everything below the line into Codex.

---

You are working in the GEMOIRE storefront repo: Next.js 15 (App Router), React 19, SQLite through better-sqlite3. Storefront styling is hand-written CSS in `src/app/globals.css` and `src/app/storefront.css`. Tailwind is used only by the admin UI under `/admin`. This document is the whole brief. Ignore the older prompt files in the repo root (`MOBILE-RESPONSIVENESS-PROMPT.md`, `CODEX-PROMPT-UIUX.md` and the other `codex-prompt*.md` files).

## The request

The client asked for this:

> Display the relevant subcategories at the top of each collection page. Each subcategory should be displayed with an image and name, and link to its collection page. We will provide the collection links and images later.

| Collection page | Route | Strip heading | Tiles, in this order |
|---|---|---|---|
| Engagement Rings | `/collections/engagement` | Shop by Diamond Shape | Round, Oval, Pear, Marquise, Heart, Cushion, Radiant, Asscher, Princess, Emerald |
| Wedding Rings (the client calls it "Wedding Bands") | `/collections/wedding` | Shop by Style | Eternity Rings, Half Eternity Rings, Open Cuff Bands, Curved Bands |
| Earrings | `/collections/earrings` | Shop by Style | Stud, Dangle, Hoop, Bridal |
| Necklaces | `/collections/necklaces` | Shop by Style | Tennis Necklace |
| Bracelets | `/collections/bracelets` | Shop by Style | Tennis Bracelet, Solitaire Chain Bracelet |
| Pendants | no such route | none | none ("no subcategories for now") |

The deliverable is a strip of image-and-name tiles at the top of those five pages, driven by one data file. The final links and most of the final images do not exist yet. Build it so that adding the client's links and images later is an edit to that one data file, with no component or CSS change. Until then, every tile must still lead somewhere that works and the strip must look finished.

The pattern follows Baymard's category-page research: subcategory tiles come first on the page, above filters and products, each with a thumbnail that shows what is inside plus a text label, and on phones they become one swipe row instead of a grid. Keep the strip visually distinct from product cards (smaller, no price, no swatches).

## Before you start

1. Run `git status`. If anything under `src/`, `scripts/` or `tests/` is modified or untracked, stop and say so. Another session has been finishing responsive fixes on `fix/responsive-media-queries`, and both tasks edit `collection-client.tsx` and `storefront.css`. A modified `next-env.d.ts` (Next regenerates it) and untracked `codex-prompt*.md` files are fine; leave them out of your commits.
2. Create `feat/collection-subcategories` from the tip of `fix/responsive-media-queries`, or from `main` if that branch has already been merged.
3. Record a baseline before changing anything: `npm run typecheck`, `npm run test:domain`, `npm run build`. When I ran `test:domain` part-way through the responsive work, 25 of 28 passed. Tests 5, 10 and 11 failed, and all three are regex matches against the source text of `header.tsx` or `storefront.css`, unrelated to this task. Whatever your baseline shows, the rule is no new failures. Don't fix failures that were already there.
4. `scripts/verify-storefront.mjs` needs a server on `localhost:3000` and stops at its first failed assertion. From reading it against the current code, it fails at the first navigation check (it expects seven nav items and the header has eight since "Ring Styles" was added), and later parts are stale as well. Don't use it as a gate and don't repair it in this task. One later check expects `class="shape-card active" aria-pressed="true"` on `/collections/engagement?shape=…`. This task removes that markup on purpose, so mention it in your report.

## How the collection page works today

I read these at commit `ff55a96`. The files have been edited since, so re-read them and rely on the names below, not on line numbers.

- `src/app/collections/[slug]/page.tsx` is a server component (`force-dynamic`). Its `copy` map defines the static collections. It renders the `.page-top` band (breadcrumb, eyebrow, `<h1>`, lede), then either a "Nothing here yet" empty state or `<CollectionClient>`. It reads `?shape=` through `parseShape` and passes it down as `initialShape`.
- `src/app/collections/[slug]/collection-client.tsx` is a client component. In order it renders: a shape filter row (`<section class="shell collection-shapes">` wrapping `ShapeSelector`, nine SVG-icon buttons that toggle local `shape` state), the toolbar (piece count and sort), then the filter sidebar and product grid. That shape row currently shows on every collection page, including Earrings and Bracelets.
- `src/lib/product-options.ts` holds `diamondShapes` (nine shapes, no Heart), `parseShape`, and two image maps.
- The homepage shape picker (`src/components/marketing/split-screen-shape-hero.tsx`) already links to `/collections/engagement?shape=<Shape>`, and that URL filters the grid on first render. The shape tiles should use the same URLs.
- The live catalogue has 45 active products: 31 engagement (Cushion 7, Round 5, Pear 5, Oval 4, Emerald 4, Marquise 3, Radiant 3, and none in Heart, Asscher or Princess), 6 wedding, 2 earrings, 2 necklaces, 1 bracelet. No product carries any of the style names in the table, and there is no field for them. `setting` is free text, and the `wedding` category is derived in `toStorefrontProduct` from `setting` being "Three-Stone" or "Eternity". That is why the style tiles cannot be real filters yet, and why this task does not try to make them filters.

## What to build

### 1. One data file

Create `src/data/collection-subcategories.ts` as the single source of truth, keyed by collection slug. Something like:

```ts
export type CollectionSubcategory = {
  name: string;    // label under the image
  href?: string;   // site path, may include a query. Omit until the client supplies the link.
  image?: string;  // /public path or an allowed remote URL. Omit until the client supplies the image.
};
export type CollectionSubcategoryGroup = {
  heading: string;                 // "Shop by Diamond Shape"
  imageFit: "contain" | "cover";   // contain for white-background cut-outs, cover for photography
  items: CollectionSubcategory[];
};
```

- A missing `href` means "link not supplied yet": the tile links to its own parent collection (`/collections/<slug>`), so nothing 404s. A missing `image` means the tile shows a placeholder frame (section 6). Both rules live in the component, so the data file stays a plain list.
- Keep the module free of runtime imports through the `@/` alias, so `tests/domain.test.mjs` can import it directly. Node strips types but does not resolve the alias. `src/lib/product-options.ts` is the model: it has type-only imports.
- Put a short header comment in the file for whoever adds the client's assets: links are stored as site paths (`/collections/…`), local images go under `public/images/subcategories/<collection>/`, and a remote image host has to be listed in `images.remotePatterns` in `next.config.ts` (today only `images.unsplash.com` and `cdn.builder.io`).
- There is no `pendants` entry.

Initial content:

**engagement**: heading "Shop by Diamond Shape", `imageFit: "contain"`. Each tile gets `href: "/collections/engagement?shape=<Shape>"`. Images are `/images/shapes/<shape>.png` for the nine shapes that have one. Heart has no image. I opened every file in `public/images/shapes/`: they are 600×450 ring cut-outs on white and each shows the correct shape. Do not use `public/images/diamonds/` or `public/images/ring-styles/` (the second duplicates the first). In those folders `heart.webp` is a pear, `pear.webp` is a princess cut, `round.png` is a screenshot of the old shape selector, and most files are under 150px. There is no heart artwork in the repo, so don't point Heart at a substitute.

**wedding, earrings, necklaces, bracelets**: heading "Shop by Style", `imageFit: "cover"`, no `href` yet. For images use the placeholder photography the rest of the site already uses, in the form `https://images.unsplash.com/<id>?auto=format&fit=crop&w=400&h=400&q=80`. These are the only IDs known to resolve; guessed IDs return 404:

- `photo-1605100804763-247f67b3557e` (ring)
- `photo-1515562141207-7a88fb7ce338` (jewellery macro)
- `photo-1617038220319-276d3cfab638` (loose diamond)
- `photo-1599643478518-a784e5dc4c8f` (jewellery)

Vary them so neighbouring tiles differ, and mark them in the file as placeholders so they are easy to find and replace.

### 2. Heart becomes a real shape

`/collections/engagement?shape=Heart` only works if `parseShape` accepts Heart, so append `"Heart"` to `diamondShapes`. That has knock-on effects:

- `diamondImages` and `ringImages` are typed `satisfies Record<DiamondShape, string>` and have no heart art. Narrow their key type to exclude Heart, or remove what is unused: `ShapeShowcase` in `shape-selector.tsx`, `diamondImages` and `showcaseShapes` are not rendered or imported anywhere live (confirm with a search). Your call, as long as no Heart key points at a non-heart image.
- `split-screen-shape-hero.tsx` keeps its own nine-shape `SHAPES` list. Leave the homepage showing nine.
- `ShapeSelector` maps over `diamondShapes`, and it stays in use on collection pages that get no strip (section 4), so it gains a tenth button. Add a Heart outline to `ShapeIcon` in the same stroke style as the others, and change the desktop grid in `globals.css` (`.shape-grid` at `min-width: 1024px`, currently `repeat(9, 1fr)`) so ten fit on one row. Look at that row at 1024px, where ten cards are tight; trim the card padding or letter-spacing if a label overflows.
- In `tests/domain.test.mjs`, the test "shape links accept all nine silhouettes…" asserts a count of 9. Update it to ten.

No product has the Heart shape, so that URL shows the existing "No pieces match those details" state. That is expected.

### 3. The strip component

Add a server component (no `"use client"`), for example `src/components/commerce/collection-subcategories.tsx`. It should arrive in the initial HTML as real links and add no client JavaScript.

- Markup: a `<nav>` labelled by its heading, an `<h2>` with the group heading, then a `<ul>` of tiles. Each tile is one `<a>` (`next/link`) containing the image frame and the name.
- The visible name is the link's accessible name, so the image is decorative: `alt=""`.
- Current tile: a tile is current when it has its own `href`, that href's pathname is the current pathname, and every query parameter in the href matches the request (normalise `shape` with `parseShape`, so `?shape=oval` still marks Oval). Mark it with `aria-current="true"` and style from that attribute. Tiles without an `href` are never current.
- Images go through `next/image` with a `sizes` value that matches the rendered tile (at most about 130px). The nine local PNGs are 93–183 KB each, about 1.1 MB together, so they must not be served unoptimised. Reserve the frame with `aspect-ratio` so nothing shifts while images load.
- A remote image on a host that is not in `remotePatterns` makes `next/image` throw and takes the whole page down. Guard against that for future edits to the data file: fall back to `unoptimized` for unlisted hosts, the way `product-card.tsx` does with `needsUnoptimizedImage`, but keep local paths and Unsplash optimised.

### 4. Page wiring

- Render the strip from `page.tsx`, directly after the `.page-top` band and before everything else, in both branches (product grid and the "Nothing here yet" empty state).
- On the five pages that have a group, the strip replaces the old shape filter row: `CollectionClient` should not render `.collection-shapes` there. Pass that down as a prop.
- Every other collection page (`sale`, `ready-to-ship`, `fine-jewelry`, `loose-stones`, `gifts`, `best-sellers`, the gift tiers, and the admin-managed `aaria`, `kavya`, `mira`) keeps the old shape row exactly as it is, apart from the tenth button from section 2.
- `page.tsx` and `collection-client.tsx` are written as long single-line JSX. Make surgical edits and don't reformat them.

### 5. Keep the URL and the grid in agreement

This is the part most likely to go wrong. Today the shape filter has two owners. The server reads `?shape=` and passes `initialShape`. `CollectionClient` copies it into local state, and an effect re-syncs when the prop changes. The "Oval ×" pill and the "Clear filters" button reset only the local state. With link tiles that breaks: after a visitor removes the pill, the URL still says `?shape=Oval`, the strip (rendered on the server from the URL) still marks Oval as current, and clicking Oval again does nothing because the URL has not changed.

On pages that use the strip, make the URL the only owner of the shape. One way is for the pill and the Clear button to `router.replace` to the path without `shape`, using `scroll: false`. Whichever way you do it, all of these must hold on `/collections/engagement`:

1. Clicking the Oval tile sets `?shape=Oval`, the grid shows only Oval rings, the status text reads "N pieces · Oval" with N matching the catalogue, and the Oval tile is the only current one.
2. Removing the "Oval ×" pill removes `shape` from the URL, restores the full grid, and leaves no tile current.
3. Clicking Oval again filters again.
4. Browser Back and Forward step through those states, and the grid and the current tile agree at each step.
5. Clicking Heart shows "No pieces match those details", and "Clear filters" returns to the unfiltered URL.
6. Sidebar filters and sorting still work, and clicking a tile does not jump the scroll position.

The current tile does not need to toggle off on a second click; the pill and the Clear button do that. On pages without a strip, the old selector keeps working as it does now.

### 6. Look and layout

Design intent: a quiet navigation row that reads as part of the page header, in the existing palette and type. This is a starting spec. Adjust by a few pixels if your screenshots show it is needed.

- **Placement:** its own block inside `.shell`, directly under the `.page-top` band, left-aligned with the page title, with about 24px above it. The toolbar follows.
- **Heading:** the `<h2>` uses the small uppercase label style the site already has (see `.eyebrow` and `.label`: 11–12px, letter-spaced). It is not a display-serif headline; the `<h1>` above stays the only headline.
- **Tile:** image frame on top, name below. The frame is square with a `--cullen-white` background, a 1px `--cullen-border` border and a 4px radius, the same language as `.shape-card`. In `contain` groups give the image about 8% inner padding so the ring cut-outs don't touch the border. In `cover` groups the photo fills the frame.
- **Name:** `--sans`, 11px, weight 500, uppercase, letter-spacing about 0.08em, `--cullen-charcoal`, centred. Names wrap ("Solitaire Chain Bracelet" needs three lines on a narrow tile). No ellipsis or truncation. Tiles align to the top so frames line up when names wrap differently.
- **States:** hover uses the `--cullen-forest` border, 3px lift and soft shadow that `.shape-card:hover` uses. Current uses the `--cullen-forest` border with `--cullen-gold-light` behind the image, and a heavier name. Focus uses the site's existing focus ring, fully visible.
- **1024px and up:** all ten shape tiles sit on one row with no scrolling at 1024, 1280 and 1440. Tiles share the row equally up to a cap of about 120px, so groups of one, two or four tiles are the same size as the shape tiles and sit left-aligned without stretching.
- **1023px and down:** one row that scrolls horizontally. Fixed tile width (about 96px from 768 to 1023, about 88px at 767 and below), scroll-snap, hidden scrollbar, `overscroll-behavior-x: contain`. The row runs to the right edge of the screen so a partly visible tile shows there is more (about 3.5 tiles visible at 375px), while the first tile stays aligned with the page padding. Groups that fit don't scroll.
- Give the scrolling row enough block padding that the hover lift, the shadow and the focus ring are not clipped. `overflow-x: auto` clips vertically as well.
- **Placeholder frame** (no image): `--cullen-oatmeal` background, same border and radius, a small muted diamond outline in the centre. It should look deliberate next to real images.

CSS rules for this repo:

- Add one contiguous block in `src/app/storefront.css` where `.collection-shapes` is. Use a new class prefix such as `.subcat-`; `.shape-card`, `.style-card` and `.collection-tile` already exist and mean other things.
- Write base rules first, then media queries ordered wide to narrow, each one after the base rule it overrides. This file has a history of overrides placed before their base rule and silently losing.
- Use the literal pixel breakpoints from the table in the `:root` comment in `globals.css`. Never put `var()` inside an `@media` condition; it makes the whole block never match, which is the bug commit `bcc5f2e` fixed.

## Out of scope

- No `/collections/pendants` page, and no new routes for the style subcategories. Those come with the client's links.
- No renaming of "Wedding Rings" to "Wedding Bands".
- No changes to the header, mega menu, mobile menu, homepage, admin UI or admin components.
- No changes to seed data, `seed-version` or the SQLite file in `data/`.
- No new dependencies.
- Don't delete, rename or replace files in `public/images/`, including the mislabelled ones. The homepage still references some of them.
- Keep each file's existing line endings and don't reformat lines you are not changing.

## Verify and report

1. **Static checks.** `npm run typecheck` is clean. `npm run test:domain` has no failures beyond your baseline. Add a domain test for the data file: the keys are exactly the five slugs, names match the table in order, every `href` that is set starts with `/collections/`, every `shape` query value round-trips through `parseShape`, and every local `image` path exists under `public/`. `npm run build` passes.
2. **Server.** A dev server from another session may be running on port 3000. Don't start a second `next dev` in this folder, because both would write `.next-dev`. Verify against the production build on another port: `npx next start -p 3100` after the build. `next.config.ts` keeps the production build in `.next` for this reason.
3. **HTML checks** (the strip is server-rendered, so `curl` is enough):
   - Each of the five pages contains its heading and its tile names in table order, each tile is an `<a>`, and the hrefs are what the data file says (parent path for tiles without one).
   - `/collections/engagement?shape=Oval` and `?shape=oval` each have exactly one `aria-current` tile, and it is Oval. Without the parameter there is none.
   - The five pages no longer contain `collection-shapes`. `/collections/sale` and `/collections/ready-to-ship` still do, with ten shape buttons and no strip.
   - `/collections/pendants` is still a 404.
4. **Browser checks** in headless Chrome at 320, 375, 768, 1024, 1280 and 1440, on the five pages plus `/collections/sale`. Chrome is at `C:/Program Files/Google/Chrome/Application/chrome.exe`, and Node 24 has a built-in `WebSocket`, so the DevTools Protocol needs no dependencies. Helper scripts from an earlier audit may still be in `C:\Users\aashu\AppData\Local\Temp\gemoire-audit\` (`cdp.mjs`, `audit.mjs`; set `ORIGIN=http://localhost:3100`). Recreate them if they are gone.
   - No element outside the strip's scroll row extends past the viewport. Check element rects: `html` and `body` use `overflow-x: clip`, so `scrollWidth` will not reveal overflow.
   - At 1024 and up, every tile is inside the viewport and the row does not scroll. At 375 the row scrolls and a partial tile shows at the right edge.
   - No strip text is under 11px, and every tile's hit area is at least 44×44.
   - Every strip image has loaded (`naturalWidth > 0`), and the local ones are served through `/_next/image`. Report the total bytes transferred for the ten shape tiles.
   - The six cases in section 5, run as real clicks and history navigation.
5. **Screenshots to take and look at:** the top of `/collections/engagement` at 375, 768, 1024 and 1440; `/collections/engagement?shape=Oval` at 375 and 1440; `/collections/wedding` at 375 and 1440; `/collections/necklaces` at 1440 (single tile); `/collections/bracelets` at 375; `/collections/sale` at 1024 and 1440 (old row with ten buttons).

Commit in small logical steps (for example: data file, Heart shape and tests; then component, CSS, page wiring and the URL fix). Don't push.

In your final message, go through sections 1–6 and the verification list and mark each item done or not done, with the evidence: baseline and final test numbers, the audit numbers, and which screenshots you looked at. List anything you assumed and anything you could not verify, including the stale `verify-storefront.mjs` check that this change makes obsolete.
