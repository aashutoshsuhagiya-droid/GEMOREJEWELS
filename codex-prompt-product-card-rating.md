# Codex prompt: move the product card rating up beside the name

Copy everything below the line into Codex.

---

You are working in the GEMOIRE storefront repo: Next.js 15 (App Router), React 19. Storefront styling is hand-written CSS in `src/app/globals.css` and `src/app/storefront.css`; the admin under `/admin` is styled with Tailwind utilities. This document is the whole brief. Ignore the other `codex-prompt*.md` and `*-PROMPT*.md` files in the repo root.

## The request

The client sent a screenshot of a product card with two red boxes: one around the rating row at the bottom of the card ("★★★★★ 0 (0)"), and one empty box in the free space to the right of the metal swatches. Their note:

> Review Section: Move the reviews (stars and review count) beside the product title, so it takes up less space below the product details.

The screenshot is from an older build (it still shows the spec line and the oval swatches, both fixed since). The goal is plain: the rating should stop taking a row of its own at the bottom of the card.

Today the card's text block, `.product-info` in `src/components/commerce/product-card.tsx`, has four children in this order: the name (`h3`), the price (`.price-pair`), the metal swatches (`.metal-swatches`) and the rating (`.card-rating`). The rating row costs 32.8px of height on every card: a 12px top margin and a 20.8px line.

`ProductCard` is the only product card in the storefront. It renders in three places and all three change:

- Collection pages: `src/app/collections/[slug]/collection-client.tsx`
- "You may also like" on product pages: `src/app/products/[slug]/page.tsx`
- The Card preview in the admin product editor: `src/components/admin/connected-product-editor.tsx`

## The decision

The card has two styles, and the rating goes in a different place in each. The switch is the existing `@media (max-width: 900px)` block in `storefront.css`, commented "Mobile + tablet product card styles".

| Card style | Viewport | Where the rating goes | Stars |
| --- | --- | --- | --- |
| Desktop card (21px name) | 901px and wider | On the name's first line, at the right edge | Five, as now |
| Compact card (14px name, bordered) | 900px and narrower | On the price line, at the right edge | One |

In both styles the rating text stays exactly as it is now, for example "4.9 (78)".

The client asked for "beside the title", and on the desktop card that is what they get. On the compact card it does not fit, so the rating goes one line lower, beside the price. I prototyped each option on a production build in headless Chrome by rearranging the card in the page:

- **Five stars beside the name on a phone.** The name is cut off on all eight cards at 390, 375 and 360 wide ("Aaria East-Wes…"), and on seven of eight at 414. The rating is about 90px wide and the card's text column is 128 to 155px.
- **One star beside the name on a phone.** At 360 every name wraps onto two lines and a long name is still cut off. It saves about 14px of height where the price line saves 33px.
- **Beside the swatches**, where the client drew the empty box. The four swatches are 114px wide, so on a two-column phone card the fourth swatch wraps onto a second row and the card gets taller.
- **Beside the price with one star.** No name is cut, nothing wraps, and every card is 32.8px shorter at every width from 320 to 900.

Five stars do not fit beside the price on a two-column phone either (about 57px of price and 90 to 113px of rating in a 128px column), which is why the compact card shows one star.

## The change

Two files: `src/components/commerce/product-card.tsx` and `src/app/storefront.css`.

### Markup

In `product-card.tsx`:

1. Move the `.card-rating` span so it is the second child of `.product-info`, directly after the `h3`. The source order becomes name, rating, price, swatches. Keep it a sibling of the `h3`. Don't put it inside the heading or inside the link, because the heading's accessible name must stay the product name alone.
2. Split the star string so the compact card can hide four of the five stars. For example:

   ```tsx
   <span className="stars" aria-hidden="true">★<span className="stars-extra">★★★★</span></span>
   ```

   The class name is yours to choose. Keep `aria-hidden`, the space between the stars and the count, and the count span with its `text-cullen-muted` class.

### CSS

`.product-info` becomes a wrapping flex row. On the desktop card the name and the rating share the first line, and the price and the swatches each take a full line below. On the compact card the name takes a full line, the price and the rating share the next one, and `order` puts the rating after the price.

I chose flex wrap over a grid because of long prices. The storefront has about 90 currencies, and a price such as "Rp 46.606.154,00" is 97px wide. On a 128px phone card a two-column grid would leave that price a cell of about 62px (I did not prototype that case). In a wrapping flex row the rating drops onto its own line under the price, which I did test.

This is the CSS I tested. It is written as overrides, which is how I injected it. Fold it into the existing rules and don't append it as a block of overrides: the base rules are at about lines 385 to 397 and 3324 to 3351 of `storefront.css`, and the compact-card block starts at about line 3353.

```css
.product-info {
  align-items: baseline;
  column-gap: 10px;
  display: flex;
  flex-wrap: wrap;
}
.product-info h3 {
  flex: 1 1 0;
  margin: 0;            /* was 0 0 4px */
  min-width: 0;
}
.card-rating {
  flex: none;
  margin-top: 0;        /* was 12px */
  white-space: nowrap;
}
.card-rating .stars {
  line-height: 1;
}
.price-pair {
  flex: 1 1 100%;
  margin: 8px 0 0;      /* was 8px 0 5px */
}
.product-info .metal-swatches {
  flex: 0 0 100%;
}
@media (max-width: 900px) {
  .product-info h3 { flex-basis: 100%; }
  .price-pair { flex: 1 1 auto; }
  .card-rating { order: 1; }
  .product-info .metal-swatches { order: 2; }
  .card-rating .stars-extra { display: none; }
}
```

Some of those lines look optional and are not:

- **The two margin changes.** Margins collapse between blocks and do not collapse between flex items. Today the name's 4px bottom margin collapses into the price's 8px top margin, and the price's 5px bottom margin collapses into the swatches' 10px top margin. Left as they are, those gaps would grow to 12px and 15px.
- **`line-height: 1` on the stars.** `.stars` is 13px text inside a 12px line. With the body's 1.6 line height its box is 20.8px, taller than the price's 19.2px line, and on the compact card that pushes the swatches down by 0.61px. Scope it to `.card-rating .stars`: the global `.stars` rule in `globals.css` is shared with the product page and the review cards.

On the compact card the visual order (name, price, rating) differs from the source order (name, rating, price). That is intended. The rating is not focusable, so the tab order does not change.

If you find a cleaner way to get the same result, use it and say so in your report. The placement in the table above is decided.

These things look related and must stay as they are:

- **The rating's content.** Five gold stars whatever the score, and the text `{product.rating} ({product.reviewCount})`. A product with no reviews still shows "0 (0)", as it does in the client's screenshot. Don't hide it or reword it. Mention it in your report.
- **The global `.stars` rule in `globals.css`**, and the other ratings: `.pdp-rating` on the product page and `.review-card .stars` in the review carousel.
- **The swatches.** Size, hit boxes, gap and the `min-height: 0` fix from the last commit. `metal-swatches.tsx` needs no change.
- **The two-line clamp on the name** in the compact-card block (`-webkit-line-clamp: 2`).
- **`@media (max-width: 480px) { .price-pair, .card-rating { display: block !important; } }`.** It is left over from an older design. Leave it. It turns `.price-pair` from a grid into a block at 480 and narrower, and I believe that is why one measurement below reads 12.19px there and 10px at wider sizes.
- **The image, the tag, the heart button, the price logic and the link targets.**

Don't add a test and don't edit `tests/domain.test.mjs`. A source-text check on element order adds little here. The browser checks below are the gate.

## Before you start

1. Run `git status`. I expect branch `fix/metal-swatch-shape` at `122e317 fix: keep metal swatches round in the admin card preview`, or a later commit, with a clean tree apart from untracked `codex-prompt*.md` files and possibly a modified `next-env.d.ts`. If `src/components/commerce/product-card.tsx` or `src/app/storefront.css` is already modified, stop and say so: that is another session's unfinished work and it would end up in your commit.
2. Pick the branch.
   - If nothing under `src/`, `tests/` or `scripts/` is modified, create `fix/product-card-rating` from the current HEAD.
   - If other files there are modified, stay on the branch that is checked out and leave that work exactly as it is: no stash, no revert, no reformatting.
3. Record a baseline with `npm run typecheck` and `npm run test:domain`. A failing domain test prints a whole stylesheet, so filter the output: `node --test tests/domain.test.mjs 2>&1 | grep -aE "^(ℹ|✖)"`. At `122e317` I get 31 tests, 28 passing and 3 failing ("currency choice is searchable…", "header exposes the requested click-to-call number", "storefront responsive rules cover tablet, mobile, and narrow phones"). Those three are old regex mismatches and have nothing to do with this task. Don't fix them. If your numbers differ, your own baseline is the one that counts.

## Verify

1. **Static.** `npm run typecheck` is clean and `npm run test:domain` gives the same numbers as your baseline.
2. **Server.** Look at what is listening before you build: `netstat -ano | grep -E ":(3000|3100) "`.
   - Port 3100 is free: run `npm run build` (about two minutes), then `npx next start -p 3100`, and stop that server by PID when you finish. If the build fails in a file you did not touch, don't fix it. Report it.
   - Port 3100 is in use: another session is serving `.next` from there. Don't run `npm run build`, because it rewrites the files that server is reading, and don't stop that server. Use the dev server on port 3000 if it answers (`curl --max-time 60 http://localhost:3000/`).
   - Port 3000 belongs to the user. Never stop or restart it. While I was writing this it did not answer within 45 seconds, so don't count on it.
   - Never start a second `next dev` in this folder, because both would write `.next-dev`. If no server is usable, report the static checks and say that the browser checks were not run.
3. **Wait for network idle** before navigating away or closing Chrome. On `next start`, a `/_next/image` request that is aborted in its first few milliseconds can leave that image hanging for every later request until the server restarts. Page loads at phone widths took me about two minutes each to go idle. The layout is CSS only, so load each page once at 1536 and then resize the viewport.
4. **Browser checks** in headless Chrome (`C:/Program Files/Google/Chrome/Application/chrome.exe`; Node 24 has a built-in `WebSocket`, so the DevTools Protocol needs no dependencies). Measure with `getBoundingClientRect()`, and use a `Range` over an element's contents where you need the width of its text. The page sets `scroll-behavior: smooth` on `html`, so scroll with `behavior: "instant"` before you measure.

   **Collection cards**, `/collections/engagement`. Every name there fits on one line, so the heights below are exact.

   | Viewport | Rating sits on | Stars shown | `.product-info` height, before → after |
   | --- | --- | --- | --- |
   | 1536, 1280, 1181, 1024, 901 | the name's first line | 5 | 139.23 → 106.44 |
   | 900, 768, 600, 480, 414, 375, 360, 320 | the price line | 1 | 137.48 → 104.69 |

   At every one of those widths:
   - The rating shares a text baseline with the name (desktop card) or with the price (compact card), and its right edge is flush with the right edge of `.product-info`'s content box.
   - The gap from the bottom of the `h3` to the top of `.price-pair` is 8px, as before. The gap from the price to the swatches is the same as before your edit. Measured from the bottom of the price `<span>` to the top of `.metal-swatches`, I get 10px at 481 and wider and 12.19px at 480 and narrower, before and after.
   - Nothing is left below the swatches except `.product-info`'s own bottom padding.
   - No name is cut off (`scrollHeight` is not larger than `clientHeight` on any `h3`), the rating does not overlap the name, the price or the swatches, the four swatches are on one row, and nothing extends past the card or the viewport.

   **Stress.** In the page, replace the text of the first four cards: names "Aaria Classic Solitaire", "18ct Gold Initials Charm", "Kavya Emerald Halo Toi Et Moi Ring" and "Mira Diamond Band"; prices "$2,269.00", "A$4,397.00", "Rp 46.606.154,00" and "87.386.000 ₫", with a non-breaking space where each of the last two has a space; rating text "4.8 (78)" and "4.9 (331)".
   - At 1536 and 1181 a long name wraps onto two or three lines beside the rating, the rating stays on the first line, and no name is cut. At 1181, the narrowest desktop card (270px of text column), "Aaria Classic Solitaire" takes two lines. That is accepted.
   - At 414, 375 and 360 a card whose price and rating do not fit on one line shows the rating on its own line under the price, left-aligned, with the swatches below it. Nothing overlaps and nothing overflows. At 375 that is the Rupiah card and the dong card.

   **Product page.** On one product page at 1536 and 375, the "You may also like" cards behave like the collection cards: name line and five stars at 1536, price line and one star at 375, with the same two heights. The page's own rating line (`.pdp-rating`, "★★★★★ … out of 5 · … reviews") is unchanged.

   **Admin Card preview.** From a page on the same origin, `POST /api/auth/login` with the JSON body `{"email":"probe@gemoirejewels.test","password":"demo123","role":"Admin"}`. It only sets a session cookie. Open `/admin/products/new` at 1536×1400. The viewport is that tall because a sticky Save/Publish bar covers the bottom of the preview card at normal heights. In the "Live storefront preview" the rating ("★★★★★ 4.9 (0)") is on the name's line at the right edge, and `.product-info` is 106.44px tall (139.23 before). Don't press Save draft or Publish.

5. **Screenshots to take and look at:** the first row of cards on `/collections/engagement` at 1536 and at 375, the stress cards at 375, and the admin Card preview.

The scripts I used may still be on this machine, in `C:\Users\aashu\AppData\Local\Temp\gemoire-audit\rating\`. `probe2.mjs` imports the driver `..\sub\cdp3.mjs`. Run on your build as `ORIGIN=http://localhost:3100 MEASURE_ONLY=1 node probe2.mjs`, it measures what the server renders, with no injection, and prints one line per width for the collection page, the stress cards, the product page and the admin preview. It writes its screenshots and `report.json` to `out-verify\`. After your edit:

- the collection lines read `stars 5 row name rightGap 0` with `infoH 106.44` at 901 and wider, and `stars 1 row price rightGap 0` with `infoH 104.69` at 900 and narrower;
- every line reads `truncated 0`, `sw>bottom 0`, `overflow r/p/card 0/0/0`, `hits n/p/s 0/0/0` and `swatchRows 1`;
- the stress lines at 414, 375 and 360 read `row own-line-under-price/price`.

Without `MEASURE_ONLY` the same script rearranges the card in the page and injects `proposal.css` from that folder, which is how I got the numbers above. My prototype screenshots are in `out2\` (`c1536-after.png`, `c375-after.png`, `s375-stress.png`, `admin-after.png`) if you want something to compare against. Recreate the script if the folder is gone.

`scripts/verify-storefront.mjs` is not a gate for this task. It asserts product cards on the homepage, which no longer renders any.

## Commit

One commit that contains only the two files. Use the path form, which commits those files alone whatever else is staged:

```
git commit -m "fix: move the product card rating beside the name" -- src/components/commerce/product-card.tsx src/app/storefront.css
```

`git show --stat` on that commit should report two files and a few dozen changed lines at most. If it shows hundreds, your editor rewrote the line endings: undo that and make the edit without touching the rest of the file. Don't push.

## Report

In your final message give the diff, the baseline and final test numbers, which server you used for the browser checks, the measured result of each check, and which screenshots you looked at. List anything you assumed, anything you changed that this brief did not ask for, and anything you could not verify.
