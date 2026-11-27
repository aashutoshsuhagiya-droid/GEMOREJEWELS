# Codex prompt: make the product card price a little larger

Copy everything below the line into Codex.

---

You are working in the GEMOIRE storefront repo: Next.js 15 (App Router), React 19. Storefront styling is hand-written CSS in `src/app/globals.css` and `src/app/storefront.css`; the admin under `/admin` is styled with Tailwind utilities. This document is the whole brief. Ignore the other `codex-prompt*.md` and `*-PROMPT*.md` files in the repo root.

## The request

The client sent a screenshot of a product card with a red box around the price ("$85.00"). Their note:

> Price: Make the price little bit bigger, so it can be seen properly and easily

The screenshot is from an older build. It still shows a spec line under the name, oval swatches and the rating in a row of its own at the bottom, all changed since. The request still stands: the price is the smallest text on the card.

Today the price is 12px. It is the `<span>` inside `.price-pair` in `src/components/commerce/product-card.tsx`, set in the body font (Geist) at weight 400 in `--cullen-charcoal`. The product name above it is 21px Cormorant on the desktop card and 14px on the compact card.

`ProductCard` is the only product card in the storefront, and `.price-pair` is used nowhere else. The card renders in three places and all three change:

- Collection pages: `src/app/collections/[slug]/collection-client.tsx`
- "You may also like" on product pages: `src/app/products/[slug]/page.tsx`
- The Card preview in the admin product editor: `src/components/admin/connected-product-editor.tsx`

## The decision

The card has two styles. The switch is the existing `@media (max-width: 900px)` block in `storefront.css`, commented "Mobile + tablet product card styles".

| Card style | Viewport | Price size |
| --- | --- | --- |
| Desktop card (21px name) | 901px and wider | 15px, was 12px |
| Compact card (14px name, bordered) | 900px and narrower | 14px, was 12px |

Only the size changes. The weight (400), colour, font family and line height stay as they are.

I prototyped sizes from 13px to 18px, at weights 400 and 500, on a production build in headless Chrome at 17 widths from 320 to 1536. These are the reasons for the two numbers:

- **14px is the largest size at which every currency fits on a phone.** The narrowest two-column card is at a 360px viewport, where the card's text column is 128px wide. The storefront has about 90 currencies. For prices up to US$5,594, the ceiling for any card in today's catalogue, the widest formatted prices are about 8.94em: "KHR 22,720,246.00", "MNT 15,848,862.00" and "UZS 29,322,462.00". That is 125px at 14px and 134px at 15px. These strings use non-breaking spaces, so they cannot wrap, and the compact card has `overflow: hidden`.
- **The weight stays 400.** At weight 500 the same strings are about 9.17em, which is 128.3px at 14px and already past the column. A medium weight also looked heavy beside the light serif name.
- **15px on the desktop card, not 16px.** The desktop column is at least 269px wide, so width is not a limit there. This one is a judgment from screenshots: at 16px the digits are as tall as the capitals of the 21px name and the two lines compete, and at 15px the name still reads first. The client asked for "a little bit".
- **The line height is not tightened.** The price's line grows with its text (the body's 1.6), so the card's text block is 4.81px taller on the desktop card and 3.2px taller on the compact card. Keeping the old 19.2px line would squeeze the larger text against the name and the swatches.

### One consequence, accepted

On the compact card the price shares its line with a one-star rating, for example "★ 5 (1)". If the two do not fit, the rating drops onto its own line under the price. That fallback already exists and is intended.

A larger price leaves the rating less room. With today's catalogue nothing changes: every product's rating reads "5 (1)", "4 (1)" or "0 (0)", and in US dollars the rating stays beside the price at every width. Once ratings read like "4.8 (78)", a four-digit dollar price and its rating need 132.9px at 14px, against 123.3px at 12px, and the column at 360 is 128px. On a 360px phone those cards will show the rating under the price and be 19.2px taller. From 375 up they fit.

No size above 12px avoids this (13px needs 128.1px). Leave it as it is. Don't shrink the gap, the rating or the price to work around it. Mention it in your report so the client hears about it.

## The change

One file: `src/app/storefront.css`. The edit is three lines added and five removed. I applied exactly this edit to a copy of the repo at `aa1a5f7`, built it and measured it. The numbers under Verify come from that build.

**1. The base rules, at about lines 3344 to 3358.** A shared rule sets 12px on both `.product-spec` and `.price-pair`. Split it, so that `.product-spec` keeps 12px and `.price-pair` gets 15px.

Before:

```css
.product-spec,
.price-pair {
  font-size: 12px;
}

.product-spec {
  color: var(--cullen-muted);
}

.price-pair {
  color: var(--cullen-charcoal);
  display: grid;
  flex: 1 1 100%;
  margin: 8px 0 0;
}
```

After:

```css
.product-spec {
  color: var(--cullen-muted);
  font-size: 12px;
}

.price-pair {
  color: var(--cullen-charcoal);
  display: grid;
  flex: 1 1 100%;
  font-size: 15px;
  margin: 8px 0 0;
}
```

`.product-spec` must stay 12px. Despite its name it is no longer on the card: it is the count line above the grid on collection pages ("31 pieces"), rendered in `collection-client.tsx`.

**2. The compact-card block, at about line 3396.** Add the size to the `.price-pair` rule that is already there:

```css
  .price-pair {
    flex: 1 1 auto;
    font-size: 14px;
  }
```

If you find a cleaner way to get the same result, use it and say so in your report. The two sizes are decided.

These things look related and must stay as they are:

- **`product-card.tsx`.** No markup change is needed. Don't add a class, a wrapper or an inline style.
- **The price's weight, colour, font family, line height and letter spacing.**
- **The rating.** `.card-rating` stays 12px, with its stars, its text and the flex rules around it (`column-gap: 10px`, `order`, `flex`). Those came from the previous commit and were measured.
- **The name.** 21px and 14px, and the two-line clamp on the compact card.
- **Wrapping rules on the price.** Don't add `overflow-wrap`, `word-break` or `white-space`. Every real price fits its column. A wrap rule would split a number across two lines when it is a pixel too wide, and today such a string would only run a pixel into the card's 12px padding.
- **`@media (max-width: 480px) { .price-pair, .card-rating { display: block !important; } }`.** It is left over from an older design. Leave it. It is why one measurement below differs at 480 and narrower.
- **Every other price.** The product page (`.pdp-price`, 25px), the cart drawer, the cart page, checkout and the header. The client's box is on the card.
- **The price format.** `formatCurrencyAmount` in `src/lib/currency.ts` prints two decimals. Dropping ".00" would make room, but it changes every price in the shop and is a separate decision.

Don't add a test and don't edit `tests/domain.test.mjs`. The browser checks below are the gate.

## Before you start

1. Run `git status` and `git log --oneline -3`. I expect branch `fix/product-card-rating` at `aa1a5f7 fix: move the product card rating beside the name`, or a later commit, with a clean tree apart from untracked `codex-prompt*.md` files and possibly a modified `next-env.d.ts`. If `src/app/storefront.css` is already modified, stop and say so: that is another session's unfinished work and it would end up in your commit.
2. Confirm the rating change is in your tree: `grep -n "stars-extra" src/components/commerce/product-card.tsx src/app/storefront.css` finds a line in each file. If it finds nothing, stop and say so. The compact-card `.price-pair` rule you add a line to, and every number in this brief, come from that commit.
3. Pick the branch.
   - If nothing under `src/`, `tests/` or `scripts/` is modified, create `fix/product-card-price` from the current HEAD.
   - If other files there are modified, stay on the branch that is checked out and leave that work exactly as it is: no stash, no revert, no reformatting.
4. Record a baseline with `npm run typecheck` and `npm run test:domain`. The typecheck can take several minutes here, because the repo is in a OneDrive folder. A failing domain test prints a whole stylesheet, so filter the output: `node --test tests/domain.test.mjs 2>&1 | grep -aE "^(ℹ|✖)"`. At `aa1a5f7` I get a clean typecheck and 31 tests, 28 passing and 3 failing ("currency choice is searchable…", "header exposes the requested click-to-call number", "storefront responsive rules cover tablet, mobile, and narrow phones"). Those three are old regex mismatches and have nothing to do with this task. Don't fix them. If your numbers differ, your own baseline is the one that counts.

## Verify

1. **Static.** `npm run typecheck` is clean and `npm run test:domain` gives the same numbers as your baseline.
2. **Server.** Look at what is listening before you build: `netstat -ano | grep -E ":(3000|3100) "`.
   - Port 3100 is free: run `npm run build` (about two minutes), then `npx next start -p 3100`, and stop that server by PID when you finish. If the build fails in a file you did not touch, don't fix it. Report it.
   - Port 3100 is in use: another session is serving `.next` from there. Don't run `npm run build`, because it rewrites the files that server is reading, and don't stop that server. Use the dev server on port 3000 if it answers (`curl --max-time 60 http://localhost:3000/`).
   - Port 3000 belongs to the user. Never stop or restart it. It has been unresponsive for long stretches, so don't count on it.
   - Never start a second `next dev` in this folder, because both would write `.next-dev`. If no server is usable, report the static checks and say that the browser checks were not run.
3. **Wait for network idle** before navigating away or closing Chrome. On `next start`, a `/_next/image` request that is aborted in its first few milliseconds can leave that image hanging for every later request until the server restarts. The layout is CSS only, so load each page once at 1536 and then resize the viewport. A fresh page load at a phone width can take two minutes to go idle.
4. **Browser checks** in headless Chrome (`C:/Program Files/Google/Chrome/Application/chrome.exe`; Node 24 has a built-in `WebSocket`, so the DevTools Protocol needs no dependencies). Measure with `getBoundingClientRect()`, and use a `Range` over an element's contents where you need the width of its text. The page sets `scroll-behavior: smooth` on `html`, so scroll with `behavior: "instant"` before you measure. Heights are fractional; treat a difference under 0.05px as a match.

   **Collection cards**, `/collections/engagement`. Every name there fits on one line, so the heights are exact.

   | Viewport | Computed size of `.price-pair` | `.price-pair` height, before → after | `.product-info` height, before → after | Rating |
   | --- | --- | --- | --- | --- |
   | 1536, 1280, 1181, 1180, 1024, 901 | 15px | 19.2 → 24 | 106.44 → 111.25 | name's first line, five stars |
   | 900, 768, 600, 481, 480, 414, 390, 375, 360, 359, 320 | 14px | 19.2 → 22.4 | 104.69 → 107.89 | price line, one star |

   At every one of those widths:
   - The price is on one line at weight 400 in `rgb(28, 25, 23)`, and its right edge is inside `.product-info`'s content box.
   - The rating is where the table says, shares a text baseline with the name (desktop card) or the price (compact card), and its right edge is flush with the right edge of the content box.
   - The gap from the bottom of the `h3` to the top of `.price-pair` is 8px and the gap from the bottom of `.price-pair` to the top of `.metal-swatches` is 10px, both as before. If you measure from the bottom of the price `<span>` instead of its box, the second gap is 10px at 481 and wider and 12.39px at 480 and narrower. It was 12.19px there before.
   - Nothing is left below the swatches except `.product-info`'s own bottom padding.
   - No name is cut off (`scrollHeight` is not larger than `clientHeight` on any `h3`), the rating does not overlap the name, the price or the swatches, the four swatches are on one row, and nothing extends past the card or the viewport.
   - The count line above the grid (`.product-spec`, "31 pieces") is still 12px.

   **Stress.** In the page, replace the text of the first eight cards. Use a non-breaking space wherever a price below has a space.

   | Card | Name | Price | Rating text |
   | --- | --- | --- | --- |
   | 1 | Aaria Classic Solitaire | $2,269.00 | 4.8 (78) |
   | 2 | 18ct Gold Initials Charm | A$4,397.00 | 4.9 (331) |
   | 3 | Kavya Emerald Halo Toi Et Moi Ring | Rp 46.606.154,00 | 0 (0) |
   | 4 | Mira Diamond Band | 87.386.000 ₫ | 5 (1) |
   | 5 | Aaria Classic Solitaire | $85.00 | 4.8 (78) |
   | 6 | 18ct Gold Initials Charm | £1,734.00 | 4.9 (331) |
   | 7 | Kavya Emerald Halo Toi Et Moi Ring | KHR 22,720,246.00 | 0 (0) |
   | 8 | Mira Diamond Band | MNT 15,848,862.00 | 5 (1) |

   - At every width each price is on one line and inside the content box. At 14px the eight prices are 67.11, 73.38, 113.42, 84.23, 47.13, 61.53, 125.19 and 125.19px wide. The column at 360 is 128px.
   - On the compact card a rating that does not fit beside its price sits on its own line under the price, left-aligned, with the swatches below it. Nothing overlaps. These are the cards whose rating drops:

     | Viewport | Text column | Cards with the rating under the price |
     | --- | --- | --- |
     | 900 to 480, 359 and 320 | 186px or more | none |
     | 414 | 155px | 3, 7, 8 |
     | 390 and 375 | 143px and 135.5px | 2, 3, 7, 8 |
     | 360 | 128px | all but card 5 |

   - At 1536 and 1181 a long name wraps onto two lines beside the rating, the rating stays on the name's first line, and the price sits below at 15px. No name is cut.

   **Product page.** On one product page at 1536 and 375, the "You may also like" cards match the collection cards: 15px and 111.25px at 1536, 14px and 107.89px at 375. The page's own price (`.pdp-price`, "from $1,824.00") is still 25px and its rating line (`.pdp-rating`) is still 13px.

   **Admin Card preview.** From a page on the same origin, `POST /api/auth/login` with the JSON body `{"email":"probe@gemoirejewels.test","password":"demo123","role":"Admin"}`. It only sets a session cookie. Open `/admin/products/new` at 1536×1400. The viewport is that tall because a sticky Save/Publish bar covers the bottom of the preview card at normal heights. In the "Live storefront preview" the price ("$0.00") is 15px and `.product-info` is 111.25px tall (106.44 before). Don't press Save draft or Publish.

5. **Screenshots to take and look at:** the first row of cards on `/collections/engagement` at 1536, 375 and 360, the stress cards at 360, and the admin Card preview. In each the price should read clearly larger than before and the name should still be the first thing you read.

The script I used may still be on this machine, at `C:\Users\aashu\AppData\Local\Temp\gemoire-audit\price\probe-price.mjs`. It imports the driver `..\sub\cdp3.mjs`. Run it on your build as:

```
ORIGIN=http://localhost:3100 MEASURE_ONLY=1 STRESS=1 SHOTS=1 node probe-price.mjs
```

In that mode it injects nothing. It measures what the server renders and prints one line per width for the collection page, an indented line per width for the stress cards, and then the count line, the product page and the admin preview. It writes its screenshots and `report.json` to `out-verify\`. After your edit:

- the collection lines read `price 15px/400 … boxH 24 … stars 5 row name rightGap 0 | infoH 111.25` at 901 and wider, and `price 14px/400 … boxH 22.39 … stars 1 row price rightGap 0 | infoH 107.89` at 900 and narrower;
- every collection line reads `lines 1`, `gaps name>price 8`, `box>sw 10`, `sw>bottom 0`, `truncated 0`, `overflow r/p/card 0/0/0`, `hits n/p/s 0/0/0` and `swatchRows 1`;
- every stress line reads `lines 1`, `overflow r/p/card 0/0/0` and `hits n/p/s 0/0/0`, and at 414, 390, 375 and 360 it reads `row own-line-under-price/price`;
- the `NEIGHBOURS` line reads `.product-spec (count line) 12px "31 pieces"`;
- the product page lines read `infoH 111.25` at 1536 and `infoH 107.89` at 375, followed by `.pdp-price 25px`;
- the two admin lines read `login 200`, then `price 15px/400` and `infoH 111.25`.

Before your edit the same command prints `price 12px/400`, `boxH 19.19`, and `infoH 106.44` or `104.69`. My output and screenshots from a build with this edit are in `reference\` in that folder (`verify.log`, `w1536-rendered.png`, `w375-rendered.png`, `w360-rendered.png`, `s360-rendered.png`, `admin-rendered.png`, and `w1536-before.png` and `w375-before.png` for comparison). Recreate the script if the folder is gone.

`scripts/verify-storefront.mjs` is not a gate for this task. It asserts product cards on the homepage, which no longer renders any.

Three things I did not check, so say so if you cannot either: live exchange rates (the build used the fallback table, so a live rate can move a long price by a pixel or two), browsers other than Chrome, and a real phone.

## Commit

One commit that contains only the one file. Use the path form, which commits that file alone whatever else is staged:

```
git commit -m "fix: make the product card price larger" -- src/app/storefront.css
```

`git show --stat` on that commit should report one file with 3 insertions and 5 deletions. The file has CRLF line endings. If the stat shows hundreds of lines, your editor rewrote them: undo that and make the edit without touching the rest of the file. Don't push.

## Report

In your final message give the diff, the baseline and final test numbers, which server you used for the browser checks, the measured result of each check, and which screenshots you looked at. Repeat the consequence for 360px phones described under "One consequence, accepted", so it reaches the client. List anything you assumed, anything you changed that this brief did not ask for, and anything you could not verify.
