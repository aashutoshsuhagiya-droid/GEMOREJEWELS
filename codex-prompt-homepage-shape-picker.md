# Codex prompt: homepage "Shop by diamond shape" fixes

Copy everything below the line into Codex.

---

You are working in the GEMOIRE storefront repo: Next.js 15 (App Router), React 19. Storefront styling is hand-written CSS in `src/app/globals.css` and `src/app/storefront.css`. This document is the whole brief. Ignore the other `codex-prompt*.md` and `*-PROMPT*.md` files in the repo root.

## The task

The homepage has a "Shop by diamond shape" section directly under the hero: a preview panel on the left (heading, a ring photo, a label) and a 3×3 grid of nine shape links on the right. Hovering a shape is meant to preview that shape's ring; clicking goes to `/collections/engagement?shape=<Shape>`.

The client says it is not working properly. I reproduced the section in headless Chrome and found the defects listed below. Fix them. Keep the concept, the copy, the nine shapes and their order, and the link targets.

Files:

- `src/components/marketing/split-screen-shape-hero.tsx` is the component (client component, rendered once from `src/app/page.tsx`).
- Its CSS is the `.ssh-` block at the end of `src/app/storefront.css`, from the banner comment "SPLIT-SCREEN SHAPE HERO" to the end of the file.
- `src/lib/product-options.ts` exports `ringImages` (the nine ring photos in `public/images/shapes/`) and the `ShapeWithArtwork` type.
- `src/components/commerce/shape-selector.tsx` has `ShapeIcon`, a set of outline icons that is distinct for every shape. It is not exported yet.

## What is wrong

All of this was measured on a production build of the source at commit `42ce704`, mostly at 1536×864, the client's viewport. The only later commit on the branch, `fe70606`, adds documentation files.

**1. The active circle shows the wrong picture for six of the nine shapes.** The active shape swaps its outline for `/images/diamonds/<shape>.png`. I opened every file:

| File | What it actually is |
|---|---|
| `round.png` | A 1054×114 screenshot of an old selector row. The optimizer returns it as 64×7, so the circle looks empty. |
| `oval.png` | Oval. Correct (48×68). |
| `emerald.png` | A marquise diamond. |
| `pear.png` | Pear. Correct (44×68). |
| `cushion.png` | A 58×64 crop with the stone cut off at the edges. |
| `marquise.png` | Marquise. Correct (38×72). |
| `radiant.png` | An asscher diamond. |
| `princess.png` | A cropped screenshot fragment with a "×" in it. |
| `asscher.png` | A cushion diamond. |

The `.webp` files in that folder are mislabelled too (`cushion.webp` is a radiant, `oval.webp` is a princess cut, `princess.webp` is a pear, `marquise.webp` is a heart). The folder has no round and no emerald photo under any name, and the files differ in size and background, so a correct, matching set of nine cannot be assembled from it. Re-pointing paths is not a fix.

**2. Four outline icons are identical.** `DiamondOutline` draws Emerald and Radiant as the same `rect` with `rx="1"`, and Princess and Asscher as the same sharp square. At 30px all four read as one square.

**3. The label goes out of sync.** I moved the pointer across all nine circles twice at 45 ms per circle, ending on Asscher. 2.5 seconds later the ring photo and the highlighted tile were Asscher, and the label still read "PRINCESS CUT · ON YOUR RING". It stays wrong until the next hover. The label is a keyed `motion.p` inside `AnimatePresence mode="wait"`. A slow hover test does not show this. Only a fast sweep does.

**4. The ring photo looks pasted on.** The nine files in `public/images/shapes/` are 600×450 opaque PNGs on a white background (no alpha). `.ssh-ring-img` applies `filter: drop-shadow(...)`, which on an opaque image shadows the whole rectangle, so a 200×150 box with a grey halo sits in the panel. `.ssh-ring-shadow` adds a detached grey ellipse under that box. The frame is square (200×200) while the photos are 4:3, so the ring is small inside a 368×360 panel.

**5. The photo swap mounts and unmounts images.** `AnimatePresence mode="popLayout"` creates a new `<Image>` on every hover. During the sweep there were nine `.ssh-image-wrap` nodes in the DOM at once, and the first hover of each shape fades in a photo that has not been fetched yet.

**6. The keyboard focus ring cuts through the label.** `.ssh-shape-btn:focus-visible` puts `border-radius: 50%` and `outline-offset: 6px` on a 56×74 column (circle plus name), so the gold outline is an ellipse that crosses the shape name.

**7. The ARIA roles are invalid.** The grid is `role="listbox"`, each item is `role="option"` wrapping an `<a>`, and `aria-selected` follows the mouse. An option cannot contain a link and there is no listbox keyboard behaviour. The label is also `aria-live`, so it announces on every hover and repeats what the focused link already says.

**8. Touch.** `onTouchStart` sets the active shape, so the preview flips whenever a finger lands on the grid to scroll the page. One tap on a shape navigates (I checked: one tap on Oval lands on `/collections/engagement?shape=Oval`), and that is the right behaviour, keep it. "Explore all shapes" is `display: none` at 767px and below, so phones have no link to the unfiltered collection.

**9. Layout.**
- `.ssh-section` has `padding-block: 20px !important`. The panel sits 20px under the hero while the neighbouring sections use `.section` (96px at 768 and up, 64px below).
- The picker column is 488px wide and the grid inside it is capped at 280px, next to a bordered 368px panel, so the block looks lopsided.
- From 768 to 900px a special rule (`order: -1` on `.ssh-image-stage`) moves the ring photo above the eyebrow and heading. At every other width the heading comes first. The comment on that block says "768px – 1023px" and the query says `max-width: 900px`.

**10. Leftovers.** The `mounted` state and its effect are never read. `sizes="(max-width:767px) 70vw, 340px"` does not match what is rendered (200px, or 160px on phones). The block uses `!important` on the section background and padding and on image width and height. I searched both stylesheets and found no rule that competes with them.

## What to build

### Icons

- Every tile shows an outline icon in both states, one icon per shape, all nine clearly different from each other and correct for the shape. Emerald is an elongated rectangle with cut corners, Radiant a cut-corner rectangle with brilliant facets, Asscher a square with cut corners, Princess a sharp square, Cushion a rounded square.
- Export `ShapeIcon` from `shape-selector.tsx` and use it here, so a shape has the same icon on the homepage and in the collection filter. `ShapeIcon` sets no size or stroke itself (on collection pages `.shape-card svg` in `globals.css` does that), so the `.ssh-` block needs its own rule. Look at all nine at the rendered size and confirm each one reads.
- Delete `DiamondOutline` and the `<Image>` inside the circle. Nothing on the homepage may load from `/images/diamonds/` or `/images/ring-styles/`.
- The active state is styling only: a 2px `--cullen-forest` ring around the circle, a darker icon stroke and a heavier name. Each circle draws its own ring in CSS. Drop the white card and faint shadow behind the active tile (`.ssh-grid-item--active`), which reads as a rendering artefact on a white section. Inactive icons use `--cullen-muted` (the current `#9A9A9A` is under 3:1 on white).

### Preview panel

- Render all nine ring photos (`ringImages`) stacked in one frame for the whole life of the component, and show the active one by toggling opacity in CSS. No mounting or unmounting on hover.
- Hide the inactive ones with opacity only, never `display: none`: they have to be fetched before the first hover. The default (Pear) may load eagerly and the other eight lazily. Through the optimizer the nine photos are about 58 KB in total at `w=384`.
- The frame uses `aspect-ratio: 4 / 3` to match the files. Remove the `drop-shadow` filter and `.ssh-ring-shadow`. Keep the panel background `#FFFFFF` so the white photo backgrounds disappear into it.
- Set `sizes` to the width the frame really renders at.
- The photos are decorative next to the label, so give them `alt=""`. The label names the shape.
- The label is a plain element rendered from state, with the same text as now: `<SHAPE> CUT · ON YOUR RING`, and `ROUND CUT · THE CLASSIC BRILLIANT` for Round. Remove `aria-live`.
- After this the component has no use for `framer-motion`, so remove that import from this file. Keep the dependency: `src/components/marketing/reveal.tsx` uses it.

### Interaction and markup

- Mouse hover and keyboard focus preview a shape. A click, a tap or Enter navigates to the same href as today in one step. Pear is active on first render, and the last previewed shape stays active when the pointer leaves the grid.
- Remove `onTouchStart`. A touch that starts on a tile and turns into a scroll must not change the preview.
- Markup is a `<ul>` of `<li>`, each holding one `next/link`. No `listbox` or `option` roles and no `aria-selected`. The visible shape name is the link's accessible name.
- The focus ring is fully visible and does not cross the name. Use the site's existing focus style (`a:focus-visible` in `globals.css`), around the whole tile with a small radius or around the circle only.
- "Explore all shapes" is visible at every width.
- Put hover styles inside `@media (hover: hover)` so a tapped tile does not stay in its hover state, as the `.subcat-` block in `storefront.css` does. Under `prefers-reduced-motion: reduce` there are no transitions or transforms.
- Remove the unused `mounted` state.

### Layout

The section is meant to be a compact, centred block, so keep the 900px cap. This is a starting spec. Adjust by a few pixels if your screenshots show it is needed.

- Section padding: 48px top and bottom at 768px and up, 32px at 767px and below, without `!important`.
- At 768px and up the two columns are equal halves with the same height. At 767px and below they stack, panel first.
- The order inside the panel is the same at every width: eyebrow, heading, subtitle, ring photo, label. Remove the 768–900 rearrangement.
- Ring frame about 260px wide at 768 and up, about 220px below.
- Circles about 64px at 768 and up, about 52px below, with the grid capped at about 320px and 260px, centred in its column.
- No text under 11px. Every tile's hit area is at least 44×44.

CSS rules for this repo:

- Rewrite the `.ssh-` block in place as one contiguous block. Base rules first, then media queries ordered wide to narrow, each one after the base rule it overrides. This file has a history of overrides placed before their base rule and silently losing.
- Use literal pixel breakpoints (767, 768, 1023, 1024). Never put `var()` inside an `@media` condition, because it makes the whole block never match.
- Avoid `!important`. If one is truly needed, name the rule it has to beat in a comment.

## Out of scope

- No change to the copy, to the nine shapes or their order, or to the hrefs. Heart stays off the homepage because there is no heart ring photo.
- No change to `src/app/page.tsx`, to collection pages, or to how `ShapeSelector` behaves. Exporting `ShapeIcon` is the only edit to that file.
- Leave `.shape-showcase…` in `globals.css` and `.shape-section` in `storefront.css` alone. They are leftovers from earlier versions of this section and no component uses them.
- Don't delete, rename or replace anything in `public/images/`, including the mislabelled files. Say in your report that the homepage no longer references `public/images/diamonds/`.
- No new dependencies. Keep each file's line endings (`storefront.css` is CRLF) and don't reformat lines you are not changing.

## Before you start

1. Run `git status`. Untracked `codex-prompt*.md` files and a modified `next-env.d.ts` are fine; leave them out of your commits. If anything under `src/`, `tests/` or `scripts/` is modified, stop and say so.
2. Create `fix/homepage-shape-picker` from the tip of `feat/collection-subcategories`, or from `main` if that branch has been merged. `main` on its own does not have `ShapeWithArtwork` yet.
3. Record a baseline: `npm run typecheck`, `npm run test:domain`, `npm run build`. The last `test:domain` run I have shows 29 tests, 26 passing and 3 failing ("currency choice is searchable…", "header exposes the requested click-to-call number", "storefront responsive rules cover tablet, mobile, and narrow phones"). Those three are regex matches against source text and have nothing to do with this task. The rule is no new failures. Don't fix the old ones.

## Verify

1. **Static.** `npm run typecheck` is clean, `npm run build` passes, and `npm run test:domain` shows no new failures. Add one domain test in the style of the existing ones: the source of `split-screen-shape-hero.tsx` contains neither `/images/diamonds/` nor `/images/ring-styles/`.
2. **Server.** A dev server from another session is usually running on port 3000. Don't start a second `next dev` in this folder, because both would write `.next-dev`. Verify on the production build: `npx next start -p 3100` after `npm run build`. Stop that server by PID when you finish.
3. **Image optimizer trap on `next start`.** If a `/_next/image` request for a local file is aborted in its first few milliseconds while that size is not cached yet, that image and width hang for every later request until the server restarts. Fetch every image variant once without aborting before you open the browser, and wait for network idle before navigating or closing Chrome. If a photo renders blank, `curl --max-time 20` its `/_next/image` URL and restart the server before concluding the code is wrong.
4. **Browser checks** in headless Chrome (`C:/Program Files/Google/Chrome/Application/chrome.exe`; Node 24 has a built-in `WebSocket`, so the DevTools Protocol needs no dependencies). Use real mouse-move, click and touch events, not synthetic DOM events.
   - With the section in view and the network idle, before any hover: all nine ring photos have `naturalWidth > 0`, and the page has made no request containing `/images/diamonds/`.
   - Hover each of the nine shapes in turn: the label, the highlighted tile and the one visible ring photo all name that shape.
   - Fast sweep: two passes over the nine circles at 45 ms per circle, ending on Asscher. Check 300 ms later and again 2.5 s later: label, highlighted tile and visible photo all say Asscher, and the number of ring `<img>` elements is still nine.
   - The nine icons are different: no two tiles have the same SVG markup.
   - One mouse click on Oval lands on `/collections/engagement?shape=Oval`. With touch emulation at 375px, one tap does the same.
   - At 375px, a touch that starts on a tile, moves 120px vertically and ends leaves the label unchanged and the URL unchanged.
   - Tab to a tile: the preview changes to it and the focus ring does not overlap the name.
   - "Explore all shapes" is visible at 375px and links to `/collections/engagement`.
   - At 320, 375, 768, 900, 1024, 1280, 1536 and 1920: nothing in the section extends past the viewport (check element rects, since `html` and `body` use `overflow-x: clip` and `scrollWidth` will not show it), and the order inside the panel is eyebrow, heading, subtitle, photo, label.
   - The served HTML of `/` has nine links to `/collections/engagement?shape=…` and no `role="listbox"`.
5. **Screenshots to take and look at:** the default state at 1536; hover on Round, Emerald, Radiant, Princess and Asscher at 1536; the keyboard focus state; and the section at 900, 768, 375 and 320.

The script I used for the measurements above may still be on this machine: `C:\Users\aashu\AppData\Local\Temp\gemoire-audit\shape\probe.mjs`, with its "before" screenshots and `report.json` in `shape\out\`. It imports the driver `..\sub\cdp3.mjs` and takes `ORIGIN=http://localhost:3100`. It selects by the current class names (`.ssh-grid-item`, `.ssh-diamond-img`, `.ssh-image-wrap`, `.ssh-ring-img`), so update the selectors to match your markup. Recreate both files if the folder is gone.

Commit in small logical steps on the new branch (for example: icons and markup; preview panel; CSS and layout; test). Don't push.

## Report

In your final message go through defects 1–10 and say for each whether it is fixed, with the evidence: baseline and final test numbers, the result of each browser check, and which screenshots you looked at. List anything you assumed, anything you changed that this brief did not ask for, and anything you could not verify.
