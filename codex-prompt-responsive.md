# Codex prompt: fix storefront responsiveness

Copy everything below the line into Codex.

---

You are working in the GEMOIRE storefront repo. It is Next.js 15 (App Router) with React 19. Storefront styling is hand-written CSS in `src/app/globals.css` (~1,740 lines) and `src/app/storefront.css` (~5,050 lines). Tailwind is used only by the admin UI under `/admin`, whose root element has the class `.admin-root`.

Goal: the public storefront must render correctly at every width from 320px to 1440px+. This is a targeted repair, not a redesign. Keep the Cullen palette, the fonts, the copy, the section order and every feature.

Do NOT use `MOBILE-RESPONSIVENESS-PROMPT.md` or `CODEX-PROMPT-UIUX.md` as guidance. Applying `MOBILE-RESPONSIVENESS-PROMPT.md` in commit `66fb562` is what broke the site.

## Root cause (verified)

Commit `66fb562` rewrote every media query to use custom properties, e.g. `@media (max-width: var(--bp-sm))`. `var()` is not valid inside a media query condition, so browsers treat every one of these as never matching. All 113 media blocks (21 in globals.css, 92 in storefront.css) are dead. Phones currently get the desktop layout. At 375px the desktop nav is 604px wide and simply cut off: `html, body { overflow-x: clip }` hides the overflow, so there is no scrollbar, the content is just missing. The specials cards and collection tiles also sit side by side off-screen, and the hero benefits overlap the scroll indicator.

This was verified in headless Chrome at 320/375/768/1024/1440 with the media queries rewritten to pixels in memory. That alone restores the layouts, but it also switches on several harmful rules and exposes cascade bugs. All of them are listed below. Fix everything in one pass, and don't ship Step 1 alone.

## Step 1: restore working media queries

In both CSS files, replace every `var(--bp-*)` inside an `@media` condition with a literal pixel value. max-width uses the value; min-width uses value + 1 so ranges never overlap:

| token | max-width | min-width |
|---|---|---|
| xs | 359px | 360px |
| sm | 480px | 481px |
| md | 600px | 601px |
| lg | 767px | 768px |
| xl | 900px | 901px |
| 2xl | 1023px | 1024px |
| 3xl | 1180px | 1181px |
| 4xl | 1280px | 1281px |

Examples: `@media (max-width: var(--bp-lg))` becomes `@media (max-width: 767px)`. `@media (min-width: var(--bp-lg)) and (max-width: var(--bp-2xl))` becomes `@media (min-width: 768px) and (max-width: 1023px)`.

Then delete the `--bp-*` custom properties from `:root` in globals.css (~lines 19–26). Replace them with a comment containing this table, so nobody puts `var()` back into a media query. Leave the `--sp-*` tokens alone. Don't add PostCSS plugins or any dependency for this.

Done when `grep -n "var(--bp" src/app/*.css` returns nothing.

## Step 2: remove or repair global rules that go live after Step 1

These rules came from the old prompt. Most are dormant only because their media query is broken. All are in globals.css; line numbers are approximate, as of `66fb562`.

1. **Phantom bottom-nav padding.** Delete `body { padding-bottom: 60px }` at ≤767px (~1677) and the whole `.mobile-bottom-nav` block (~1616–1676). No component renders a bottom nav (`grep -rn mobile-bottom-nav src` finds only CSS). Otherwise every phone page gets a blank 60px band at the bottom.
2. **Global animation override.** Delete `*, *::before, *::after { animation-duration: 0.6s !important; transition-duration: 0.2s !important }` at ≤480px (~1737). It overrides every animation and transition on the page. Keep the `prefers-reduced-motion` block.
3. **Blanket touch-target rule.** Delete `a, button, [role="button"], input[type="submit"], input[type="button"] { min-height: 44px; min-width: 44px }` at ≤480px (~1729). A blanket min-width breaks inline text links and icon rows. Step 4 handles touch targets per component.
4. **content-visibility.** Delete `.section:nth-child(n+3) { content-visibility: auto; contain-intrinsic-size: auto 500px }` (~1693). It makes page height jump while scrolling, breaks anchor scrolling, and fights the IntersectionObserver-based `Reveal` animations.
5. **GPU/contain hacks.** Delete `.button, .product-card, .style-card, .shape-card, .ssh-circle { transform: translateZ(0); backface-visibility: hidden }` (~1703) and `.product-card { contain: layout style paint }` (~1684). `contain: paint` clips focus rings, hover shadows and badges at the card edge, and the `translateZ` hack creates stray stacking contexts that conflict with hover transforms.
6. **Element-level form sizing** (~line 70): `button, input, select, textarea { font: inherit; font-size: clamp(15px, 1.1vw, 16px); min-height: 48px; }`. The 48px min-height hits every `<button>` and every checkbox. That is why filter rows are ~59px tall, card metal swatches render as 48px circles (the third one is clipped by the card edge at 375px), and the announcement dismiss button is 11×48. It also leaks into the Tailwind admin. Replace it with:
   - `button, input, select, textarea { font: inherit; }` (keep this part).
   - Text-entry controls only (`input` excluding checkbox/radio/range/color, plus `select` and `textarea`): `font-size: 16px` below 1024px. 16px stops iOS from zooming on focus; 15px is not enough. Many inputs are currently 15px, and the contact page inputs are 13px. Give text inputs and selects `min-height: 44px`; give buttons nothing globally (`.button` has its own sizing).
   - Scope these element rules so nothing inside `.admin-root` changes. Pick the cleanest approach, then confirm `/admin` looks identical before and after.
7. **Body font size.** `body { font-size: clamp(13px, 1.2vw, 15px) }` (~line 54) gives 13px body text on every phone. Use `15px`, or `clamp(15px, 0.875rem + 0.25vw, 16px)`.
8. **Overscroll.** Remove `overscroll-behavior-y: none` from `body`. It kills native pull-to-refresh and bounce on mobile. `-webkit-overflow-scrolling: touch` on `html` is a no-op and can go too.

## Step 3: fix cascade (source-order) bugs

Many responsive overrides are written before the base rule that has the same selector and specificity, so the base rule wins at every width. The lists below come from a PostCSS scan (exact selector + property matches) at `66fb562`. For each one, move the override into a media block placed after the base rule (ideally directly below that component's base rules), or merge the two. Don't reorganize the whole file; co-locate only what you touch.

**A. Responsive override beaten by a later base rule** (`override location → winning base rule`):

- storefront.css:1024 `.style-card-text h3 { font-size: 17px }` @≤480 → :1058 `20px`
- :1359 `.value-divider { display: block }` @≥901 → :1367 `none`
- :1415 `.showroom-photo img/video { height: clamp(240px, 48vw, 380px) }` @≤900 → :1448 `320px`
- :1513 `.brand-story-images { max-width: 460px }` @≤900 → :1535 `540px`
- :1517 `.brand-story-content { text-align: center }` @≤900 → :1557 `left`
- :1595 `.lets-connect-media { aspect-ratio: 16/10 }` @≤900 → :1624 `4/5`
- :1601 `.lets-connect-content { text-align: center }` @≤900 → :1645 `left`
- :1840–1842 `.gifting-tile--right .gifting-tile-label { left: 18px; right: auto; text-align: left }` @≤900 → :1847–1849
- :1883 `.gifting-price { height: 54px }` @≤900 → :1895 `60px`
- :1933 `.collection-tile-media { aspect-ratio: 4/5 }` @≤900 → :1945 `3/4`
- :2478 `.video-arrow { display: none }` @≤900 → :2572 `grid`
- :2907, :2914, :2915, :2922, :2991, :2992 `.skeletons { grid-template-columns / gap }` @≤1180/≤480/≤359 → :3009–3010 `repeat(3, 1fr)` / `16px`
- :3042 `.pdp-gallery { position: static }` @≤900 → :3065 `position: sticky`
- :3057 `.pdp-info { padding-bottom: 38px }` @≤767 → :3114 `50px`
- :3702 `.appointment-form { padding: 20px }` @≤600 → :3790 `25px`
- :3724 `.form-grid input:first-child { grid-column: auto }` @≤600 → :3734 `span 2`
- :4181 `.account-order { align-items: start }` @≤600 → :4344 `center`

**B. Narrow breakpoint beaten by a later, wider breakpoint.** Order max-width blocks from wide to narrow:

- globals.css:1154 `.rs-styles-grid { gap: 24px }` @≤600 → :1287 `20px` @≤767
- storefront.css:2922 `.product-grid, .skeletons { grid-template-columns: minmax(0, 1fr) }` @≤359 → :2991 `repeat(2, minmax(150px, 1fr))` @≤480
- :3563 `.cart-drawer { padding: 16px }` @≤480 → :4173 `20px` @≤600
- :3702 `.checkout-panel, .appointment-form { padding: 20px }` @≤600 → :3708 / :3795 `20px 18px` @≤767

**C. Same selector + property declared twice in the same context with different values.** Keep one intentional value for each:

- `.logo-main` font-size at ≤600: 22px (:4143) and 26px (:4161), plus 24px at ≤1023 (:4136)
- `.header-actions` gap 22px / 14px; `.cart-trigger` gap 5px / 8px; `.breadcrumb` font-size 11px (globals) / 12px (storefront); `h3` font-weight and line-height each set twice in globals; `.price-pair` color set twice

What users see from these bugs today:

- **PDP:** the gallery stays `position: sticky; top: 100px` on phones and slides over the title, price and thumbnails as you scroll.
- **Checkout step 1:** the First name, Address and Postcode inputs are squeezed to ~50px. `span 2` wins and creates an implicit second track.
- **Product grid at 320px:** it stays `repeat(2, minmax(150px, 1fr))`, i.e. 352px including padding, and overflows. Use `minmax(0, 1fr)` instead of `minmax(150px, 1fr)`.

When you're done, re-scan with PostCSS (it's in `node_modules`) and confirm the A and B lists are empty. The scan only matches exact selectors, so also check the neighbouring rules whenever you move a block.

## Step 4: component fixes (seen in screenshots after Step 1)

### 4.1 Header

Files: `src/components/layout/header.tsx`; CSS in storefront.css ~25–140, ~560–670, ~4070–4270 and globals.css ~234–300.

Current state at 320–1023px, even with working media queries:

- The hamburger renders as one long horizontal line. The patch block at ≤1023px sets `.hamburger { display: inline-flex; align-items: center }`, which lays the two `<span>` bars side by side.
- The "Contact Us" label shows next to it.
- At 320 and 375px the logo overlaps the "Bag 0" button.

Target:

- ≤1023px: a single-row 3-column grid (`minmax(0,1fr) auto minmax(0,1fr)`) with everything vertically centred. Header height 60–64px at ≤767px and ~72px at 768–1023px. No empty second grid row.
- **Left:** hamburger with a 44×44 hit area and two 22px bars stacked vertically (flex column, ~6px gap). Phone link is icon-only at 481–1023px: hide `.header-phone-label` and the number in compact mode and keep the aria-label. At ≤480px hide the phone link entirely, and instead add a `tel:+918849760876` "Call +91 884 976 0876" link and a "Contact us" link to the mobile menu (it currently has no contact info).
- **Logo:** one font-size per breakpoint (e.g. 26px ≤1023, 22px ≤480, 20px ≤359). Hide `.logo-sub` at ≤480px (it is 7.5px and unreadable); wherever it shows, make it ≥9px.
- **Right:** search icon with a 44×44 hit area at ≥481px. At ≤767px the cart shows a bag icon plus the count badge instead of the word "Bag". Keep `aria-label="Open shopping bag"` and the `.cart-trigger` / `.cart-badge` classes. 44×44 hit area.
- Nothing may collide at 320px. Leave the desktop header (≥1024px) exactly as it is; it looks right at 1024 and 1440.
- `scripts/verify-storefront.mjs` asserts the header and mobile-menu markup (`<div class="desktop-nav desktop-only">`, the `<aside class="mobile-menu…">` summaries and their link texts). Keep it passing. Only change the script if you intentionally add the contact links.

### 4.2 Announcement bar (≤480px)

The message wraps to 3 lines and the dismiss "×" overlaps the "view crafting timeframes →" link. Reserve right padding for a 44×44 dismiss button. Let the message wrap to at most 2 lines (12px text is fine), and keep the link from overlapping anything.

### 4.3 PDP (`src/components/commerce/product-detail.tsx`)

After Step 3 the gallery must be `position: static` at ≤900px. Check the stacking order on phones: main image, then thumbnails (a horizontal row of 56–64px thumbs with no overlap), then title, price, specs, options. The swatch row wraps. Any sticky add-to-bag bar respects `env(safe-area-inset-bottom)`.

### 4.4 Product cards and PLP

- Metal swatches in cards: the visible circle is 20–24px. The hit area can be larger via padding or a pseudo-element, but it must not overflow the card. Show at most ~4, then "+N". Nothing clipped at 320 or 375px.
- Product grid: 2 columns at ≥360px, 1 column below that; gap 12px at ≤480px.
- Filter overlay: checkbox rows ~40–44px tall once Step 2 lands. "Clear all" and "Show N results" stay visible in a sticky footer. Page scroll is locked while the overlay is open.

### 4.5 Checkout and forms

One column at ≤600px with every field full width (the Step 3 fix). Contact page inputs and textarea go from 13px to 16px on mobile. Keep the existing `autoComplete` / `inputMode` attributes.

### 4.6 Footer

Social icon links are 9–15px wide tap targets, and the row overflows at 320px (the last icon ends at x=334). Make each icon link 40–44px square (the icon itself stays small), use `flex-wrap: wrap`, and centre the row on mobile.

### 4.7 Tiny text (measured at 375px)

- 7.5px: `.logo-sub`
- 8px: `.ssh-shape-name`, `.ssh-cta`
- 9px: `.ssh-eyebrow`, `.ssh-shape-label`, `.video-play-caption`
- 9.5px: `.product-tag`
- 10px: `.gifting-tile-cta`, `.review-platform`, `.footer-social`, `.currency-rates-note`

Raise the floors: 11px for uppercase letter-spaced labels, 12px for anything a user needs to read, 14px+ for paragraph copy.

### 4.8 Mobile menu

At 375px each top-level row is ~120px tall, so only 5 items fit on screen. Tighten rows to ~56–64px (font ~22–24px) while keeping 44px+ targets, and add the contact links from 4.1. Confirm Escape closes the menu and focus returns to the hamburger. In testing, dispatching Escape on `document` left it open, so check where the listener is attached.

## Step 5: verify and report results

1. `grep -n "var(--bp" src/app/*.css` prints nothing. `npm run typecheck`, `npm run test:domain` and `npm run build` pass. With `npm run dev` running, `node scripts/verify-storefront.mjs` passes.
2. Run a headless Chrome audit. Chrome is at `C:/Program Files/Google/Chrome/Application/chrome.exe`, and Node 24 has a built-in `WebSocket`, so the DevTools Protocol needs no dependencies. A reference script is at `C:\Users\aashu\AppData\Local\Temp\gemoire-audit\audit.mjs`. It may have been cleaned up; recreate it if so. Its in-memory media-query fix becomes a no-op after Step 1. Widths: 320, 360, 375, 390, 414, 768, 1024, 1280, 1440. Pages: `/`, `/collections/engagement`, `/products/aaria-east-west-oval`, `/cart`, `/checkout`, `/about`, `/contact`, `/ring-sizing`, `/ring-styles`, `/showroom`, `/virtual-appointment`, `/faq`, `/blog`, `/account`, `/shipping-policy`. Check that:
   - No visible element's bounding box extends past the viewport. Because html and body use `overflow-x: clip`, `scrollWidth` will NOT reveal overflow, so check element rects. Ignore descendants of intentional `overflow-x: auto/hidden` scrollers and closed off-canvas drawers.
   - No text input, select or textarea is under 16px below 1024px.
   - No icon or button control is smaller than 40×40 (inline links inside paragraphs are exempt).
   - No text is under 11px.
3. Take screenshots and actually look at them:
   - Header at 320, 375, 768, 1024 and 1440
   - PDP at 375, scrolled 300px and again at 800px
   - Checkout step 1 at 375
   - First PLP card row at 320 and 375
   - Filters open, mobile menu open and cart drawer open, all at 375
   - Footer at 320
4. Spot-check `/admin` and `/admin/products` at 1440 and 768. They must look the same as before your change.

## Constraints

- No new dependencies. No redesign: palette, typography, copy and section order stay as they are.
- Don't touch admin Tailwind classes or admin components.
- Keep React changes minimal: header markup (bag icon, compact phone), mobile-menu contact links, and only what 4.x strictly needs.
- Work on a branch named `fix/responsive-media-queries`. Commit in logical steps: (1) media queries and global cleanup, (2) cascade fixes, (3) component fixes.
- In your final message, mark each numbered item above as done or not done, with evidence: audit numbers and which screenshots you checked. Also list anything you could not verify, such as real iOS Safari safe-area behaviour.
