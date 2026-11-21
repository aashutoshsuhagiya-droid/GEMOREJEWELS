# CODEX PROMPT — GEMOIRE Jewels: Remaining UI/UX & CSS Improvements

Copy everything below this line and paste into Codex CLI.

---

## Project Context
- **Stack:** Next.js 15 + React 19 + custom CSS (no CSS modules for storefront)
- **CSS files:** `src/app/globals.css` (global tokens, buttons, utilities) and `src/app/storefront.css` (all component styles)
- **Color palette:** Cullen luxury palette (forest green `#1B382B`, charcoal, gold, linen, muted gray)
- **Typography:** Cormorant Garamond (editorial serif, variable weight) + Geist (modern sans)
- **Admin pages** use Tailwind — do NOT touch any `src/app/admin/` files or Tailwind config

---

## YOUR MISSION

The storefront CSS is ~70% polished. There are **specific loop holes, UX gaps, and CSS bugs** remaining. Fix ALL of them below. Read both CSS files and all referenced React components before starting.

---

## SECTION 1: CRITICAL CSS BUGS & INCONSISTENCIES

### 1A — Duplicate `prefers-reduced-motion` blocks (MERGE)
There are **two separate** `@media (prefers-reduced-motion: reduce)` blocks — one in `globals.css` (line ~1700) and one in `storefront.css` (line ~4043). The storefront.css one is more comprehensive (includes `.button:hover`, `.shape-card:hover`, etc.). **Delete the storefront.css block entirely** and **merge any unique rules from it into the globals.css block**. Result: exactly ONE reduced-motion block, in globals.css.

### 1B — Duplicate `.shape-showcase` rules scattered
`storefront.css` has `.shape-showcase` styles defined in THREE separate places (lines ~384-395, ~433-441, ~493-495). Consolidate into ONE cohesive block. The 3x3 grid layout and `.shape-card` overrides should be grouped with the parent `.shape-showcase` block. Remove duplication, keep all existing behavior.

### 1C — Hero shade gradient inconsistency
`globals.css` line 638 has ring-sizing hero shade:
```css
background: linear-gradient(0deg, rgba(16, 14, 13, .92) 0%, rgba(16, 14, 13, .55) 50%, rgba(16, 14, 13, .12) 100%);
```
This uses `0deg` (left-to-right) but it's a vertical hero. Change to:
```css
background: linear-gradient(180deg, rgba(16, 14, 13, 0) 0%, rgba(16, 14, 13, 0.55) 30%, rgba(16, 14, 13, 0.93) 100%);
```
Same fix for ring-styles hero at `globals.css` line 1109.

### 1D — Value strip breakpoint mismatch
In `storefront.css`:
- `.value-strip` currently only has a media query at `min-width: var(--bp-xl)` (line 1204) for the 4-col layout, but NO breakpoint for collapsing from 4-col to 2-col on tablets.
- Add: `@media (max-width: var(--bp-lg))` → `grid-template-columns: repeat(2, 1fr)` with proper border handling
- Add: `@media (max-width: var(--bp-sm))` → reduce icon size, padding, font sizes (see TASK 9B from the master prompt for exact values)

### 1E — Campaign hero benefits: single column on very small mobile
At `storefront.css` line 3996-3998:
```css
.campaign-hero-benefits {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
}
```
This makes benefits a single column on mobile. Change to 2-column grid on mobile (matching the `max-width: var(--bp-md)` rule at line 922-928):
```css
@media (max-width: var(--bp-md)) {
  .campaign-hero-benefits {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 10px;
  }
}
```

---

## SECTION 2: HEADER & NAVIGATION FIXES

### 2A — Mobile menu accessibility (React component fix)
In `src/components/layout/mobile-menu.tsx`:
1. Add `role="dialog"` and `aria-modal="true"` to the `<aside>` element
2. Add `aria-label="Site navigation menu"` 
3. Add an `onClose` call to `Escape` key: `onKeyDown={(e) => e.key === "Escape" && onClose()}`
4. The close button (`×`) needs `min-height: 44px; min-width: 44px;` in CSS
5. Add a backdrop overlay `<div>` behind the menu with `className="mobile-menu-backdrop"` that calls `onClose` on click

In `storefront.css`, add:
```css
.mobile-menu-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(16, 14, 13, 0.4);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: 59;
}

.mobile-menu {
  /* add */
  display: flex;
  flex-direction: column;
}
```

### 2B — Header `display: contents` accessibility anti-pattern
In `storefront.css` line 3966:
```css
.header-mobile-left.mobile-only {
  display: contents;
}
```
`display: contents` removes the element from the accessibility tree. Change to use proper grid placement without `display: contents`. Instead, give `.header-mobile-left` a proper grid placement:
```css
.header-mobile-left.mobile-only {
  display: flex;
  grid-column: 1;
  grid-row: 1;
  justify-self: start;
}
```
This keeps the hamburger and phone on the left at mobile widths while maintaining accessibility.

### 2C — Cart trigger label mismatch
The cart trigger button in `header.tsx` line 39 says "Wishlist" but it opens the cart drawer:
```tsx
<button className="cart-trigger" aria-label="Open wishlist" onClick={() => setOpen(true)}>
```
Change the visible text from "Wishlist" to "Bag" (or "Cart") and change aria-label to `"Open shopping bag"`. The badge already shows item count which is correct for a cart.

### 2D — Social icon aria-labels
In `footer.tsx` line 53-55, social icons use 2-letter codes as aria-labels:
```tsx
aria-label={s}  // "IG", "TT", "FB", "YT", "P", "in"
```
Change to descriptive labels: "Instagram", "TikTok", "Facebook", "YouTube", "Pinterest", "LinkedIn".

---

## SECTION 3: CART DRAWER IMPROVEMENTS

### 3A — Cart drawer accessibility (React component fix)
In `src/components/commerce/cart-drawer.tsx`:
1. Add `role="dialog"` and `aria-modal="true"` and `aria-label="Shopping bag"` to the `<aside>`
2. Add `onKeyDown={(e) => e.key === "Escape" && setOpen(false)}`

### 3B — Cart drawer drag handle
Add a drag handle bar at the top of the cart drawer for mobile. In `cart-drawer.tsx`, add a `<div className="cart-drag-handle" aria-hidden="true" />` right after the `<aside>` opens (before `drawer-head`). In CSS:
```css
.cart-drag-handle {
  width: 36px;
  height: 4px;
  background: var(--cullen-border);
  border-radius: 2px;
  margin: 0 auto 12px;
}
@media (min-width: var(--bp-lg)) {
  .cart-drag-handle { display: none; }
}
```

### 3C — Quantity button touch target
The quantity buttons in cart are `height: 25px; width: 25px` (storefront.css line 3299). On mobile, bump to 36px:
```css
@media (max-width: var(--bp-sm)) {
  .qty-row button {
    height: 36px;
    width: 36px;
    font-size: 18px;
  }
}
```
(Already partially exists at line 3357 — ensure it overrides the 25px default.)

---

## SECTION 4: PRODUCT CARD IMPROVEMENTS

### 4A — Product image aspect ratio on desktop
In `storefront.css`, the `.product-image` has `aspect-ratio: 1` globally. For jewelry, 3:4 is much better on ALL screen sizes. Change:
```css
.product-image {
  aspect-ratio: 3 / 4;
}
```
The mobile override at line 2767 also sets `aspect-ratio: 3/4` — remove this redundancy since the base will now be 3/4 everywhere.

### 4B — Product card hover price/rating visibility
Currently `.price-pair` and `.card-rating` are always visible in the JSX but there's a CSS rule at line 2781-2783 that forces them visible on mobile:
```css
.price-pair, .card-rating {
  display: block !important;
}
```
Verify there's NO rule hiding them on desktop hover. If `.product-card:hover .product-image` opacity transition is causing layout issues, ensure `.product-info` has `position: relative; z-index: 2;` so text doesn't overlap the image on hover crossfade.

### 4C — Product card border on ALL mobile sizes
The mobile card border at line 2760-2784 only applies at `max-width: var(--bp-sm)`. Extend it to `max-width: var(--bp-xl)` so tablets also get the card treatment:
```css
@media (max-width: var(--bp-xl)) {
  .product-card {
    border: 1px solid var(--cullen-border);
    border-radius: 8px;
    overflow: hidden;
    background: white;
  }
  .product-image {
    aspect-ratio: 3 / 4;
  }
}
```
Remove the duplicate rules from the `max-width: var(--bp-sm)` block.

---

## SECTION 5: HERO SECTION ADDITIONS

### 5A — Scroll-down indicator
Add a scroll-down indicator to the hero section. In `storefront.css`:
```css
.hero-scroll-indicator {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 10px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  animation: bounceDown 2s ease-in-out infinite;
}

.hero-scroll-indicator svg {
  width: 20px;
  height: 20px;
  stroke: currentColor;
  stroke-width: 1.5;
  fill: none;
}

@keyframes bounceDown {
  0%, 100% { transform: translateX(-50%) translateY(0); opacity: 0.6; }
  50% { transform: translateX(-50%) translateY(8px); opacity: 1; }
}

@media (min-width: var(--bp-md)) {
  .hero-scroll-indicator { display: none; }
}
```
In `src/components/marketing/hero.tsx`, add before the closing `</section>`:
```tsx
<div className="hero-scroll-indicator" aria-hidden="true">
  <span>Scroll</span>
  <svg viewBox="0 0 24 24"><path d="M7 10l5 5 5-5" strokeLinecap="round" strokeLinejoin="round"/></svg>
</div>
```

### 5B — Subtitle line-clamp on mobile
In `storefront.css`, add:
```css
@media (max-width: var(--bp-md)) {
  .campaign-hero-copy > div > p:not(.eyebrow) {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}
```

---

## SECTION 6: SPLIT-SCREEN SHAPE HERO FIXES

### 6A — Active shape ring color
The active shape ring currently uses `var(--cullen-charcoal)` (dark gray). Change to `var(--cullen-forest)` (brand green) for brand consistency. In `storefront.css`:
```css
.ssh-active-ring {
  border: 2px solid var(--cullen-forest);  /* was var(--cullen-charcoal) */
}
```

### 6B — Shape grid: horizontal scroll on mobile with indicator
Currently on mobile the `.ssh-grid` uses `max-width: 250px` with 3 columns. Change to horizontal scroll on mobile:
```css
@media (max-width: var(--bp-lg)) {
  .ssh-grid {
    display: flex;
    gap: 12px;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    scroll-padding-inline: 16px;
    -webkit-overflow-scrolling: touch;
    max-width: 100%;
    padding: 4px 4px 12px;
    scrollbar-width: none;
  }

  .ssh-grid-item {
    flex: 0 0 auto;
    scroll-snap-align: start;
  }

  .ssh-circle {
    width: clamp(56px, 14vw, 72px);
    height: clamp(56px, 14vw, 72px);
  }

  .ssh-diamond-img {
    width: clamp(28px, 7vw, 36px) !important;
    height: clamp(28px, 7vw, 36px) !important;
  }
}

.ssh-grid::-webkit-scrollbar {
  display: none;
}
```

### 6C — Touch feedback on shape selection
In `src/components/marketing/split-screen-shape-hero.tsx`, add touch feedback to the shape buttons:
```tsx
<Link
  href={`/collections/engagement?shape=${encodeURIComponent(s)}`}
  className="ssh-shape-btn"
  onMouseEnter={() => setActive(s)}
  onFocus={() => setActive(s)}
  onTouchStart={() => setActive(s)}
  aria-label={`${s} cut diamond shape`}
>
```

### 6D — Active shape touch target minimum
Ensure each `.ssh-grid-item` has minimum 44x44px touch target:
```css
.ssh-grid-item {
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

---

## SECTION 7: FILTER SIDEBAR MOBILE FIXES

### 7A — Mobile filter overlay
The filter sidebar currently shows inline on desktop but has NO mobile overlay behavior. The `.mobile-filters` button is `display: none` (line 2671) and `.filter-mobile-head` / `.filter-actions` are also `display: none`.

Add mobile filter overlay styles:
```css
.mobile-filters {
  display: none;
  width: 100%;
  padding: 14px 0;
}

@media (max-width: var(--bp-lg)) {
  .mobile-filters {
    display: flex;
  }

  .filters {
    position: fixed;
    inset: 0;
    z-index: 70;
    background: white;
    padding: 20px;
    overflow-y: auto;
    transform: translateX(-100%);
    transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .filters.mobile-open {
    transform: translateX(0);
  }

  .filter-mobile-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--cullen-border);
    margin-bottom: 16px;
  }

  .filter-actions {
    display: flex;
    gap: 10px;
    padding-top: 16px;
    border-top: 1px solid var(--cullen-border);
    position: sticky;
    bottom: 0;
    background: white;
  }

  .filter-actions .button {
    flex: 1;
  }

  .filter-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(16, 14, 13, 0.4);
    backdrop-filter: blur(4px);
    z-index: 69;
  }

  .clear-filters {
    display: inline-block;
  }
}
```

### 7B — Filter sidebar React component update
In `src/components/commerce/filter-sidebar.tsx`, update the component to:
1. Add a backdrop `<div>` when `mobileOpen` is true
2. Wrap the filters in a scrollable container
3. Show active filter count in the mobile filter button: `Filters (X)`
4. The close button needs `min-height: 44px; min-width: 44px;`

---

## SECTION 8: FORM INPUT CONSOLIDATION

### 8A — All form inputs: consistent styling
Currently form inputs are styled inconsistently across different sections (contact form, checkout, newsletter, admin login). Standardize ALL inputs with:
```css
input:not([type="submit"]):not([type="button"]):not(.currency-search):not(.mobile-search),
select,
textarea {
  font-size: clamp(15px, 1.1vw, 16px);
  min-height: 48px;
  padding: 14px 16px;
  border-radius: 10px;
  border: 1px solid var(--cullen-border);
  background: white;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

input:not([type="submit"]):not([type="button"]):focus,
select:focus,
textarea:focus {
  border-color: var(--cullen-forest);
  box-shadow: 0 0 0 3px rgba(27, 56, 43, 0.1);
  outline: none;
}
```
This applies to: `.form-grid input`, `.contact-form input`, `.contact-form textarea`, `.appointment-form input`, `.appointment-form select`, `.appointment-form textarea`, `.footer-newsletter-form input`, `.promo input`, `.sort-select`, `.postcode`, `.currency-search-wrap`.

### 8B — Input attributes for mobile keyboards
In the React components, ensure proper `inputMode` and `autoComplete` attributes:

**Checkout (`src/app/checkout/page.tsx`):**
- Phone inputs: `type="tel" inputMode="numeric" autoComplete="tel"`
- Email: `type="email" inputMode="email" autoComplete="email"`
- Name: `autoComplete="name"`
- Address: `autoComplete="address-line1"`, `autoComplete="address-line2"`
- City: `autoComplete="address-level2"`
- Zip: `autoComplete="postal-code"`

**Contact (`src/app/contact/page.tsx`):**
- Same as above for name, email, phone
- Add `enterkeyhint="next"` on non-submit inputs
- Add `enterkeyhint="send"` on the submit button

**Newsletter (`src/components/layout/footer-newsletter.tsx`):**
- Email input: `type="email" inputMode="email" autoComplete="email" enterkeyhint="subscribe"`

**Login (`src/app/login/page.tsx`):**
- Email: `type="email" inputMode="email"`
- Password: `autoComplete="current-password"`

### 8C — Remove border-radius: 0 from inputs
In `storefront.css`, `.sort-select` and `.postcode` have `border-radius: 0` (line 2603). Change to `border-radius: 10px` to match the new consistent style.

---

## SECTION 9: VIDEO GALLERY SCROLL INDICATOR

### 9A — Add scroll indicator for video carousel
The video carousel already has horizontal scroll but no indicator. Add a scroll indicator above the carousel on mobile:

```css
.video-scroll-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--cullen-muted);
  font-size: 12px;
  letter-spacing: 0.06em;
  padding: 4px 0 12px;
}

@media (min-width: var(--bp-xl)) {
  .video-scroll-hint {
    display: none;
  }
}

.video-scroll-hint::after {
  content: '→';
  animation: slideArrow 1.5s ease infinite;
}
```

In `src/components/marketing/video-gallery.tsx`, add before the `<div className="video-viewport">`:
```tsx
<div className="video-scroll-hint" aria-hidden="true">Scroll to explore</div>
```

---

## SECTION 10: RESPONSIVE FINE-TUNING

### 10A — Product grid: better tablet breakpoint
Currently the product grid goes 3-col → 2-col at 900px. At 900px, 2 columns of product cards look cramped. Change the 2-col breakpoint to `max-width: var(--bp-3xl)` (1180px) instead:
```css
@media (max-width: var(--bp-3xl)) {
  .product-grid,
  .skeletons {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
```
Keep the `max-width: var(--bp-sm)` and `max-width: var(--bp-xs)` rules as-is.

### 10B — Header height on mobile
In `storefront.css`, update the mobile header to be more compact:
```css
@media (max-width: var(--bp-sm)) {
  .header-inner {
    grid-template-rows: minmax(52px, 7vh) auto;
  }
}
```
This replaces the current `minmax(68px, auto)` with a shorter 52px base.

### 10C — Safe area inset on cart drawer
Already present at line 3336, but also add to the modal:
```css
@media (max-width: var(--bp-lg)) {
  .modal {
    padding-bottom: max(20px, env(safe-area-inset-bottom));
  }
}
```

---

## SECTION 11: ANIMATION & PERFORMANCE POLISH

### 11A — GPU acceleration on more elements
In `globals.css`, expand the GPU acceleration list:
```css
.button,
.product-card,
.style-card,
.shape-card,
.ssh-circle,
.shape-thumbnail-wrap,
.video-tile,
.review-card,
.specials-card,
.gifting-tile,
.value-icon-shell {
  transform: translateZ(0);
  backface-visibility: hidden;
}
```

### 11B — Content visibility for lazy sections
Already exists at globals.css line 1682, but refine it:
```css
@media (max-width: var(--bp-2xl)) {
  .section:nth-child(n+3) {
    content-visibility: auto;
    contain-intrinsic-size: auto 600px;
  }
  
  /* Exclude the hero and shape selector from lazy loading */
  .hero,
  .ssh-section,
  .section:nth-child(2) {
    content-visibility: visible;
    contain-intrinsic-size: none;
  }
}
```

---

## SECTION 12: MISSING FEATURES TO ADD

### 12A — Skip to content link in HTML
In `src/app/layout.tsx`, add a skip link as the first child of `<body>`:
```tsx
<body>
  <a href="#top" className="skip-link">Skip to main content</a>
  <CurrencyProvider>...
```
The `.skip-link` CSS already exists in globals.css — just needs to be in the HTML.

### 12B — Scroll margin for anchored sections
Add to `globals.css` so that when users click anchor links (like in footer), the section isn't hidden behind the sticky header:
```css
[id] {
  scroll-margin-top: 100px;
}

@media (max-width: var(--bp-sm)) {
  [id] {
    scroll-margin-top: 70px;
  }
}
```

### 12C — Image decoding optimization
In `globals.css`, add:
```css
@media (max-width: var(--bp-sm)) {
  img {
    loading: lazy;
    decoding: async;
  }
}
```
(Already partially in globals.css — verify it exists and is correct.)

---

## SECTION 13: CSS CODE QUALITY

### 13A — Remove unused/unreachable CSS
Search for and remove these dead rules:
- Any `border-radius: 0` on interactive elements (should be 10px now)
- `.campaign-hero-inner` `grid-template-columns: minmax(390px, .92fr)` — this `minmax` with a fixed minimum can cause overflow; change to `minmax(0, .92fr)`
- Any `!important` flags that are no longer needed (but KEEP the ones in reduced-motion)

### 13B — Consistent `border-radius` across cards
Audit all card-like elements and ensure they use either `2px` (luxury minimal) or `8px` (mobile-friendly). Specifically:
- `.product-card` → `border-radius: 8px` on mobile, `2px` on desktop (already done)
- `.style-card-image` → `border-radius: 2px` (keep)
- `.specials-card` → `border-radius: 2px` (keep — it has hover effects)
- `.video-tile` → `border-radius: 2px` (keep)
- `.review-card` → `border-radius: 2px` (keep)

### 13C — Button text contrast on dark backgrounds
The `.button-ghost` has `border: 1px solid rgba(255, 255, 255, 0.35)` — on the forest green hero this may have insufficient contrast. Increase to `rgba(255, 255, 255, 0.5)`.

---

## SECTION 14: FOOTER MOBILE LAYOUT

### 14A — Footer links: 2-column on small screens
Currently the footer links collapse to 1 column at `max-width: var(--bp-sm)` (line 2523). Change to 2-column on `max-width: var(--bp-sm)`:
```css
@media (max-width: var(--bp-sm)) {
  .footer-grid {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 28px;
  }

  .footer .logo {
    justify-items: center;
  }

  .footer-links {
    grid-template-columns: 1fr 1fr;
    text-align: left;
    gap: 6px;
  }

  .footer-bottom {
    flex-direction: column;
    align-items: center;
    gap: 10px;
    text-align: center;
  }
}
```

### 14B — Newsletter form on mobile
In `storefront.css` line 3937-3943, the email row already stacks on mobile. Ensure the button is full width:
```css
@media (max-width: var(--bp-md)) {
  .email-row {
    flex-direction: column;
  }

  .email-row .button {
    width: 100%;
    justify-content: center;
  }
}
```
(Already exists — verify it works.)

---

## SECTION 15: CHECKLIST BEFORE SUBMITTING

After making ALL changes above, verify:

- [ ] Only ONE `@media (prefers-reduced-motion: reduce)` block exists (in globals.css)
- [ ] No duplicate `.shape-showcase` blocks
- [ ] Ring sizing hero shade uses `180deg` gradient
- [ ] Value strip has breakpoints at `max-width: var(--bp-lg)` AND `max-width: var(--bp-sm)`
- [ ] Campaign hero benefits show 2-column grid on mobile
- [ ] Mobile menu has `role="dialog"`, `aria-modal`, ESC key handler, backdrop
- [ ] Header no longer uses `display: contents` on `.header-mobile-left`
- [ ] Cart trigger button says "Bag" not "Wishlist"
- [ ] Cart drawer has `role="dialog"`, ESC handler, drag handle bar
- [ ] Product images are `aspect-ratio: 3/4` on ALL screen sizes
- [ ] Product cards have borders on ALL mobile/tablet (up to bp-xl)
- [ ] Hero has scroll-down indicator on mobile
- [ ] Hero subtitle is clamped to 3 lines on mobile
- [ ] Shape selector uses horizontal scroll on mobile (not 3-col grid)
- [ ] Active shape ring uses `var(--cullen-forest)` border
- [ ] Shape circles have `clamp(56px, 14vw, 72px)` size on mobile
- [ ] Filter sidebar has mobile overlay with backdrop
- [ ] All form inputs have consistent 48px height, 10px radius, focus ring
- [ ] Input fields have proper `inputMode` / `autoComplete` attributes
- [ ] Video gallery has "Scroll to explore" hint on mobile
- [ ] Product grid switches to 2-col at 1180px (not 900px)
- [ ] Footer links show 2-column on small mobile
- [ ] Skip-to-content link exists in layout.tsx
- [ ] `[id] { scroll-margin-top: 100px }` exists for anchor links
- [ ] GPU acceleration applied to all animated cards
- [ ] Social icon aria-labels are full names ("Instagram" not "IG")
- [ ] No `border-radius: 0` on any input/button element
- [ ] All changes preserve the Cullen color palette and typography exactly

---

## IMPORTANT RULES

1. Read BOTH CSS files fully before making any edits
2. Work section by section — complete each section fully before moving on
3. Do NOT add new dependencies
4. Do NOT modify any `src/app/admin/` files or Tailwind config
5. Preserve ALL existing functionality — don't remove features
6. Do NOT change React component logic unless explicitly instructed
7. Run `npm run build` after changes to verify no TypeScript/CSS errors
8. Commit with message: `fix: remaining UI/UX and CSS improvements for storefront`
9. End commit with: `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`

---

## FILES TO MODIFY

- `src/app/globals.css`
- `src/app/storefront.css`
- `src/components/layout/mobile-menu.tsx`
- `src/components/commerce/cart-drawer.tsx`
- `src/components/marketing/hero.tsx`
- `src/components/marketing/split-screen-shape-hero.tsx`
- `src/components/marketing/video-gallery.tsx`
- `src/components/commerce/filter-sidebar.tsx`
- `src/components/layout/footer.tsx`
- `src/app/layout.tsx`
- `src/app/checkout/page.tsx`
- `src/app/contact/page.tsx`
- `src/app/login/page.tsx`
- `src/components/layout/footer-newsletter.tsx`

Apply ALL sections now. This is a luxury jewelry brand — every detail matters.
