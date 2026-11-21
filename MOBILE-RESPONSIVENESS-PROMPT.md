# Mobile Responsiveness — Complete Single Prompt for GEMOIRE Jewels

Copy the entire block below and paste it into a new conversation to get all mobile responsiveness fixes implemented at once.

---

```
I need you to implement world-class mobile responsiveness across the entire GEMOIRE Jewels storefront (Next.js 15 + React 19 + custom CSS in src/app/globals.css and src/app/storefront.css). The site is a luxury e-commerce brand for fine lab-grown diamond jewelry. Currently mobile responsiveness is incomplete and needs a comprehensive overhaul.

Apply ALL of the following changes systematically. Do NOT skip any section. Read both CSS files fully before making changes.

═══════════════════════════════════════════════
TASK 1: CSS CUSTOM PROPERTIES FOR BREAKPOINTS
═══════════════════════════════════════════════

In globals.css, add CSS custom properties at the top of :root for ALL breakpoints used across the project:

  --bp-xs: 359px;   /* Ultra-small phones */
  --bp-sm: 480px;   /* Small phones */
  --bp-md: 600px;   /* Large phones / small tablets */
  --bp-lg: 767px;   /* Tablet boundary */
  --bp-xl: 900px;   /* Tablet landscape / small desktop */
  --bp-2xl: 1023px; /* Desktop boundary */
  --bp-3xl: 1180px; /* Large desktop */
  --bp-4xl: 1280px; /* XL desktop */

Then replace ALL hardcoded breakpoint pixel values across BOTH globals.css AND storefront.css with these CSS custom properties in @media rules. For example, replace every `@media (max-width: 480px)` with `@media (max-width: var(--bp-sm))` and every `@media (min-width: 768px)` with `@media (min-width: var(--bp-lg))`. Be thorough — every single hardcoded breakpoint value must be replaced.

Also add a spacing scale as CSS custom properties in :root:
  --sp-1: 4px; --sp-2: 8px; --sp-3: 12px; --sp-4: 16px; --sp-5: 20px; --sp-6: 24px; --sp-8: 32px; --sp-10: 40px; --sp-12: 48px;

Apply these spacing values consistently throughout all sections, replacing magic numbers.

═══════════════════════════════════════════════
TASK 2: GLOBAL MOBILE FOUNDATION
═══════════════════════════════════════════════

In globals.css, make these global changes:

A) Add these global rules:
  html {
    -webkit-text-size-adjust: 100%;
    -webkit-overflow-scrolling: touch;
  }
  body {
    overscroll-behavior-y: none;
    -webkit-tap-highlight-color: transparent;
  }
  *, *::before, *::after {
    -webkit-tap-highlight-color: transparent;
  }
  button, a, [role="button"], input, select, textarea {
    touch-action: manipulation;
  }

B) Add a fluid type scale. Replace the fixed body font-size with:
  body {
    font-size: clamp(13px, 1.2vw, 15px);
  }
  Ensure ALL font sizes across both CSS files use clamp() or are responsive. Minimum body text must be 14px at 320px viewport width.

C) Add these utility classes to globals.css:
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

D) Ensure ALL form inputs across the site have minimum 16px font-size (prevents iOS auto-zoom on focus). Add to globals.css:
  input, select, textarea {
    font-size: clamp(15px, 1.1vw, 16px);
    min-height: 48px;
  }

E) Add a "Skip to content" accessibility link in globals.css:
  .skip-link {
    position: absolute;
    top: -100%;
    left: 16px;
    z-index: 9999;
    padding: 12px 24px;
    background: var(--cullen-forest);
    color: white;
    font-size: 14px;
    border-radius: 0 0 8px 8px;
    transition: top 0.2s;
  }
  .skip-link:focus {
    top: 0;
  }

═══════════════════════════════════════════════
TASK 3: PRODUCT GRID — MOBILE OPTIMIZATION
═══════════════════════════════════════════════

In storefront.css, modify the .product-grid section:

A) Change the grid breakpoints:
  - Default (desktop): 3 columns → keep as is
  - At max-width: var(--bp-xl): change to 2 columns
  - At max-width: var(--bp-sm): keep 2 columns BUT add min-width: 150px to each card
  - At max-width: var(--bp-xs): change to 1 column (single column full-width cards)

B) Product card mobile improvements:
  - On mobile, product image aspect-ratio should be 3/4 (not 1/1) — better for jewelry photography
  - Product name: apply .line-clamp-2 class, max 2 lines
  - Price and rating must ALWAYS be visible (not hidden until hover)
  - Card gap: increase to 12px on mobile
  - Add a subtle card border on mobile for better visual separation

C) Filter sidebar mobile:
  - Ensure .mobile-filters button is visible and prominent on mobile
  - When filters open, they should cover screen as overlay with backdrop
  - Add a "Clear All" and "Show X results" close button in the filter overlay

D) Add .product-card mobile styles:
  @media (max-width: var(--bp-sm)) {
    .product-card {
      border: 1px solid var(--cullen-border);
      border-radius: 8px;
      overflow: hidden;
      background: white;
    }
    .product-image {
      aspect-ratio: 3 / 4;
    }
    .product-info {
      padding: 10px 12px 12px;
    }
    .product-info h3 {
      font-size: 14px;
    }
  }

═══════════════════════════════════════════════
TASK 4: HEADER & NAVIGATION — MOBILE EXCELLENCE
═══════════════════════════════════════════════

In storefront.css, overhaul the mobile header:

A) Mobile header bar (max-width: var(--bp-2xl)):
  - Header height: minmax(52px, 7vh) on mobile
  - Logo: max-height 22px on mobile (font-size: 22px for .logo-main)
  - Hamburger button: minimum 44x44px touch target, add padding
  - Cart trigger: minimum 44x44px touch target
  - Add a subtle box-shadow at bottom of header for depth: box-shadow: 0 1px 8px rgba(0,0,0,0.06)

B) Mobile menu improvements:
  - Change from transform-based slide to opacity/visibility-based overlay (better for accessibility and performance)
  - Add backdrop-filter: blur(8px) on the underlying page when menu is open
  - Search input: height 48px, full width, with search icon
  - Nav items: font-size 20px, padding 16px 0, minimum 44px tap target each
  - Close button: minimum 44x44px, top-right corner
  - Currency selector: full-width pill button at bottom
  - Menu links should have clear hover/active states
  - Add ESC key listener to close menu
  - Add focus trap when menu is open

C) Tablet (var(--bp-lg) to var(--bp-2xl)):
  - Show simplified nav: logo centered, compact nav links visible
  - Hide full mega menu dropdown on tablet — show simplified links
  - Hamburger visible on left, cart on right

D) Header inner grid fix — replace the display: contents hack at small screens with a proper grid layout to avoid accessibility issues.

═══════════════════════════════════════════════
TASK 5: HERO SECTION — MOBILE-FIRST REDESIGN
═══════════════════════════════════════════════

In storefront.css, modify the .hero and .campaign-hero-* sections:

A) Mobile (max-width: var(--bp-md)):
  - Hero min-height: calc(100svh - 0px) — use full viewport
  - Copy overlay: position at bottom 15% (not center)
  - H1 font-size: clamp(34px, 9vw, 52px) — larger on small screens
  - Subtitle: max 3 lines, use line-clamp-3
  - CTA buttons: stacked vertically, full width, height 48px
  - Benefits strip: change from single row to 2x2 grid layout on mobile
  - Shade gradient: STRENGTHEN for readability on all image brightness levels:
    Change from: linear-gradient(0deg, rgba(16,14,13,.94) 0%, rgba(16,14,13,.48) 62%, rgba(16,14,13,.08) 100%)
    Change to:   linear-gradient(180deg, rgba(16,14,13,0) 0%, rgba(16,14,13,0.55) 30%, rgba(16,14,13,0.93) 100%)
  - Add a scroll-down indicator: animated chevron at bottom center

B) Tablet (var(--bp-md) to var(--bp-2xl)):
  - Two-column: image left (55%), copy right (45%)
  - H1: clamp(40px, 5.5vw, 60px)
  - Buttons side by side

C) Desktop (var(--bp-2xl)+):
  - Keep current layout

D) Hero actions (already has mobile stacking) — verify buttons are full-width on mobile:
  @media (max-width: var(--bp-md)) {
    .hero-actions .button {
      width: 100%;
      justify-content: center;
    }
  }

═══════════════════════════════════════════════
TASK 6: HORIZONTAL SCROLL SECTIONS — TOUCH OPTIMIZATION
═══════════════════════════════════════════════

In globals.css, add a global horizontal scroll utility:
  .horizontal-scroll {
    -webkit-overflow-scrolling: touch;
    scroll-snap-type: x mandatory;
    scroll-padding-inline: 16px;
    overscroll-behavior-x: contain;
    scroll-behavior: smooth;
  }
  .horizontal-scroll > * {
    scroll-snap-align: start;
  }
  .scroll-indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: var(--cullen-muted);
    font-size: 12px;
    letter-spacing: 0.06em;
    padding: 8px 0;
    animation: fadeHint 3s ease 2s forwards;
  }
  .scroll-indicator::after {
    content: '→';
    animation: slideArrow 1.5s ease infinite;
  }
  @keyframes fadeHint {
    to { opacity: 0; visibility: hidden; }
  }
  @keyframes slideArrow {
    0%, 100% { transform: translateX(0); }
    50% { transform: translateX(6px); }
  }

In storefront.css, apply to each horizontal scroll section:

A) Style Grid (.style-grid):
  - Add -webkit-overflow-scrolling: touch
  - Add scroll-padding-inline: 16px
  - At max-width: var(--bp-3xl): grid-auto-columns: 200px
  - At max-width: var(--bp-sm): grid-auto-columns: 160px
  - Add scroll indicator above the grid on mobile
  - Cards already have scroll-snap-align: start — verify

B) Shape Grid (.shape-grid):
  - Add -webkit-overflow-scrolling: touch
  - At max-width: 380px: reduce circle/shape sizes further if needed
  - Add scroll-snap-type: x mandatory
  - Add scroll indicator

C) Video Gallery (.video-carousel):
  - Add -webkit-overflow-scrolling: touch
  - Add scroll-snap-type: x mandatory to .video-carousel
  - At max-width: var(--bp-xl): hide arrows, show scroll indicators
  - Video tiles: width min(220px, 78vw) on mobile

D) Reviews Carousel (.review-track):
  - Already has touch handlers — add CSS scroll-snap as fallback
  - At max-width: var(--bp-md): hide arrow buttons (already done)
  - Card width on mobile: calc(100vw - 48px)
  - Add "Swipe →" indicator on mobile

═══════════════════════════════════════════════
TASK 7: SPLIT-SCREEN SHAPE HERO — MOBILE STACK
═══════════════════════════════════════════════

In storefront.css, modify the .ssh-* (split-screen hero) section:

A) Mobile (max-width: var(--bp-lg)):
  - Stack layout: showcase card FIRST, shape grid SECOND
  - Showcase card: min-height 400px (reduce from 540px)
  - Add section title "Choose Your Shape" above the grid on mobile
  - Shape grid: 3 columns, circles should be clamp(64px, 14vw, 84px) diameter
  - Active shape: clear visible border (2px solid var(--cullen-forest)) + label below circle
  - Ensure touch targets on shape circles are minimum 44x44px
  - Crossfade animation: reduce to 0.3s on mobile for snappiness
  - Remove any CTA link below grid on mobile (confirm it's hidden)

B) Tablet (var(--bp-lg) to var(--bp-xl)):
  - Side-by-side: showcase left (40%), shape grid right (60%)
  - Circles: 76px
  - Grid: 3 columns

C) Desktop (var(--bp-xl)+):
  - Keep current layout
  - Circles: current clamp value is fine

D) In the React component (src/components/marketing/split-screen-shape-hero.tsx):
  - Ensure crossfade works smoothly on mobile
  - Add loading="lazy" to shape images
  - Add descriptive alt text for shape SVG icons
  - Add onTouchStart/onTouchEnd for haptic-like feedback on shape selection

═══════════════════════════════════════════════
TASK 8: CART DRAWER & MODALS — MOBILE UX
═══════════════════════════════════════════════

In storefront.css, modify cart drawer and modal styles:

A) Cart Drawer on mobile (max-width: var(--bp-sm)):
  - Width: 100vw (not max-width 440px)
  - Height: 85svh (not full height)
  - Border-radius: 16px 16px 0 0 (top corners only — bottom sheet style)
  - Add a drag handle bar at top: 36px wide, 4px tall, centered
  - Backdrop: blur(8px) on background
  - Slide-up animation: from translateY(100%) to translateY(0)
  - Padding: 16px, padding-bottom: max(16px, env(safe-area-inset-bottom))

B) Cart items on mobile:
  - Product image: 64px square
  - Grid: 64px 1fr (not 84px)
  - Quantity buttons: 36px touch targets
  - Remove button: full width, clear styling
  - Subtotal: sticky at bottom
  - Action buttons: full width, stacked, 50px height

  @media (max-width: var(--bp-sm)) {
    .cart-drawer {
      width: 100vw;
      height: 85svh;
      border-radius: 16px 16px 0 0;
      padding: 16px;
      padding-bottom: max(16px, env(safe-area-inset-bottom));
    }
    .cart-line {
      grid-template-columns: 64px minmax(0, 1fr);
      gap: 10px;
    }
    .qty-row button {
      height: 36px;
      width: 36px;
    }
    .drawer-actions {
      grid-template-columns: 1fr;
      gap: 10px;
    }
    .drawer-actions .button {
      height: 50px;
    }
  }

C) Modals on mobile (max-width: var(--bp-lg)):
  - Bottom sheet style: align-items: flex-end
  - Backdrop: click to close
  - Max height: calc(100svh - 24px)
  - Border-radius: 16px 16px 0 0
  - Content scrollable within sheet
  - Swipe down to close (add touch handlers in React)

═══════════════════════════════════════════════
TASK 9: SECTIONS — RESPONSIVE GRID REFINEMENTS
═══════════════════════════════════════════════

Refine these section grids for mobile:

A) Footer (.footer-grid):
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
  @media (max-width: var(--bp-2xl)) {
    .footer-grid {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
    .footer-grid > :first-child {
      grid-column: 1 / -1;
    }
  }
  @media (max-width: var(--bp-md)) {
    .footer-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

B) Value Strip (.value-strip):
  @media (max-width: var(--bp-lg)) {
    .value-strip {
      grid-template-columns: repeat(2, 1fr);
    }
    .value-item:nth-child(-n+2) {
      border-bottom: 1px solid var(--cullen-border);
    }
    .value-item:nth-child(odd) {
      border-right: 1px solid var(--cullen-border);
    }
  }
  @media (max-width: var(--bp-sm)) {
    .value-icon-shell {
      height: 56px;
      width: 56px;
    }
    .line-icon {
      height: 26px;
      width: 26px;
    }
    .value-item {
      padding: 28px 10px;
    }
    .value-item-label {
      font-size: 13px;
    }
    .value-item-desc {
      font-size: 11px;
    }
  }

C) Collection Tiles (.collection-tiles):
  @media (max-width: var(--bp-xl)) {
    .collection-tiles {
      grid-template-columns: minmax(0, 1fr);
      gap: 28px;
    }
  }

D) Gifting Specials (.gifting-grid):
  @media (max-width: var(--bp-xl)) {
    .gifting-grid {
      grid-template-columns: minmax(0, 1fr);
    }
    .gifting-tile {
      aspect-ratio: 16 / 9;
      min-height: 0;
    }
  }
  @media (max-width: var(--bp-sm)) {
    .gifting-prices {
      grid-template-columns: 1fr;
    }
  }

E) Gemoire Specials (.specials-cards):
  @media (max-width: var(--bp-xl)) {
    .specials-cards {
      grid-template-columns: minmax(0, 1fr);
      gap: 16px;
    }
  }

F) Ready Grid (.ready-grid), Brand Story (.brand-story-grid), Let's Connect (.lets-connect-grid), Showroom Grid (.showroom-grid):
  For ALL of these 2-column sections, change the breakpoint from max-width: 900px to max-width: var(--bp-xl) for consistency:
  @media (max-width: var(--bp-xl)) {
    [grid-class] {
      grid-template-columns: minmax(0, 1fr);
    }
  }

G) Origins Steps (.origins-steps):
  Already collapses at 767px — update to var(--bp-lg). Also ensure the mobile vertical timeline layout works at var(--bp-sm).

H) Craft Tracker (.tracker-steps):
  Already 2-col at 767px — update to var(--bp-lg). At var(--bp-sm), reduce gap and font sizes.

I) PDP Grid (.pdp-grid):
  Already collapses at 900px — update to var(--bp-xl). At var(--bp-sm):
  - Reduce padding-top to 16px
  - PDP info padding-bottom: 32px
  - Thumbnails: 56px size (from 65px)
  - PDP price: font-size 22px

J) Product Detail Spec Quick (.spec-quick):
  Already 2-col at 767px — update to var(--bp-lg). Ensure horizontal scroll works at var(--bp-sm).

K) Checkout (.checkout):
  Already responsive — update all breakpoint values to CSS variables.

L) Contact Grid (.contact-grid):
  Already responsive — update breakpoint values.

M) Virtual Appointment (.virtual-channel):
  Already responsive — update breakpoint values.

═══════════════════════════════════════════════
TASK 10: FORM INPUTS — MOBILE KEYBOARD OPTIMIZATION
═══════════════════════════════════════════════

Across ALL form components (checkout, contact, newsletter, account, etc.):

A) Ensure ALL inputs, selects, and textareas have:
  - font-size: clamp(15px, 1.1vw, 16px) minimum (prevents iOS zoom)
  - min-height: 48px on mobile
  - padding: 14px 16px
  - border-radius: 10px (not 0 — softer on mobile)
  - border: 1px solid var(--cullen-border)
  - Focus: 2px solid var(--cullen-forest) outline with 2px offset

B) Add proper input attributes:
  - Phone/tel inputs: type="tel", inputmode="numeric"
  - Email inputs: type="email", inputmode="email", autocomplete="email"
  - Name inputs: autocomplete="name"
  - Address: autocomplete="address-line1", etc.
  - Search: enterkeyhint="search"

C) Button standards:
  - ALL buttons: min-height 48px on mobile
  - CTA buttons: full width on mobile
  - Add :active state with scale(0.97) for touch feedback:
    @media (hover: none) {
      .button:active {
        transform: scale(0.97);
        transition: transform 0.1s ease;
      }
    }

═══════════════════════════════════════════════
TASK 11: MOBILE BOTTOM NAVIGATION BAR
═══════════════════════════════════════════════

Add a sticky mobile bottom navigation bar (only visible on mobile max-width: var(--bp-lg)):

Create these new CSS classes:
  .mobile-bottom-nav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 60px;
    background: rgba(255, 255, 255, 0.96);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-top: 1px solid var(--cullen-border);
    display: flex;
    align-items: center;
    justify-content: space-around;
    z-index: 50;
    padding-bottom: env(safe-area-inset-bottom);
    transform: translateY(0);
    transition: transform 0.3s ease;
  }
  .mobile-bottom-nav.hidden {
    transform: translateY(100%);
  }
  .mobile-bottom-nav a,
  .mobile-bottom-nav button {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
    background: none;
    border: 0;
    color: var(--cullen-muted);
    font-size: 10px;
    letter-spacing: 0.04em;
    padding: 6px 12px;
    min-height: 44px;
    min-width: 44px;
  }
  .mobile-bottom-nav a.active,
  .mobile-bottom-nav button.active {
    color: var(--cullen-forest);
  }
  .mobile-bottom-nav .nav-icon {
    height: 22px;
    width: 22px;
  }
  .mobile-bottom-nav .cart-badge {
    position: absolute;
    top: 2px;
    right: calc(50% - 18px);
    background: var(--cullen-red);
    color: white;
    font-size: 10px;
    font-weight: 600;
    height: 18px;
    min-width: 18px;
    border-radius: 9px;
    display: grid;
    place-items: center;
    padding: 0 5px;
  }

Add padding-bottom to body on mobile to prevent content being hidden behind nav:
  @media (max-width: var(--bp-lg)) {
    body {
      padding-bottom: 60px;
    }
  }

═══════════════════════════════════════════════
TASK 12: IMAGE & PERFORMANCE OPTIMIZATIONS
═══════════════════════════════════════════════

A) Add to globals.css:
  img {
    display: block;
    max-width: 100%;
    height: auto;
  }
  @media (max-width: var(--bp-sm)) {
    img {
      loading: lazy;
      decoding: async;
    }
  }

B) Add CSS contain for performance:
  .product-card {
    contain: layout style paint;
  }
  .cart-drawer,
  .mobile-menu {
    contain: layout style;
  }

C) Add content-visibility for below-fold sections:
  @media (max-width: var(--bp-2xl)) {
    .section:nth-child(n+3) {
      content-visibility: auto;
      contain-intrinsic-size: auto 500px;
    }
  }

═══════════════════════════════════════════════
TASK 13: ANIMATION & MOTION POLISH
═══════════════════════════════════════════════

A) Reduce animation duration on mobile for snappier feel:
  @media (max-width: var(--bp-sm)) {
    *, *::before, *::after {
      animation-duration: 0.6s !important;
      transition-duration: 0.2s !important;
    }
  }

B) Ensure prefers-reduced-motion works (verify and strengthen):
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }

C) Add GPU acceleration to animated elements:
  .button, .product-card, .style-card, .ssh-circle, .shape-card {
    transform: translateZ(0);
    backface-visibility: hidden;
  }

═══════════════════════════════════════════════
TASK 14: ACCESSIBILITY FINAL PASS
═══════════════════════════════════════════════

A) Ensure all interactive elements have minimum 44x44px touch targets on mobile. Add to globals.css:
  @media (max-width: var(--bp-sm)) {
    a, button, [role="button"], input[type="submit"], input[type="button"] {
      min-height: 44px;
      min-width: 44px;
    }
  }

B) Add focus-visible styles for keyboard navigation (globals.css):
  :focus-visible {
    outline: 2px solid var(--cullen-forest);
    outline-offset: 3px;
    border-radius: 4px;
  }
  :focus:not(:focus-visible) {
    outline: none;
  }

C) In the React components, ensure:
  - All icon-only buttons have aria-label attributes
  - Mobile menu has role="dialog" and aria-modal="true"
  - Cart drawer has role="dialog" and aria-modal="true"
  - All images have descriptive alt text
  - Form inputs have associated labels
  - Error messages are linked to inputs with aria-describedby

═══════════════════════════════════════════════
TASK 15: VERIFICATION CHECKLIST
═══════════════════════════════════════════════

After making all changes, verify these EXACT viewport widths work perfectly:
  - 320px (iPhone SE)
  - 375px (iPhone 12/13/14)
  - 390px (iPhone 14 Pro)
  - 428px (iPhone 14 Pro Max)
  - 768px (iPad)
  - 1024px (iPad Pro)

For EACH viewport, verify:
  ✓ No horizontal overflow (no scrollbar on x-axis)
  ✓ No text truncation or overlapping
  ✓ All buttons have minimum 44px touch target
  ✓ All images display correctly (no broken, no pixelated)
  ✓ Forms are usable with mobile keyboard
  ✓ Navigation works (hamburger menu opens/closes)
  ✓ Cart drawer slides up properly
  ✓ Horizontal scroll sections have scroll indicators
  ✓ No layout shift or jumping

Also verify on desktop (1280px+):
  ✓ Desktop nav is visible and functional
  ✓ Mega menu works on hover
  ✓ All sections display in multi-column layout
  ✓ No overflow issues

═══════════════════════════════════════════════
IMPORTANT IMPLEMENTATION NOTES
═══════════════════════════════════════════════

1. Read globals.css and storefront.css COMPLETELY before starting any edits.
2. Make changes systematically — complete each task fully before moving to the next.
3. Do NOT add any new dependencies. Use only existing CSS capabilities.
4. Preserve ALL existing functionality — do not remove any features.
5. The Cullen color palette and typography system must be preserved exactly.
6. Framer Motion animations should continue working — only adjust timing/duration where specified.
7. All admin panel styles (Tailwind-based) should NOT be modified.
8. The .desktop-only / .mobile-only display toggle pattern should be preserved.
9. Do NOT change any React component logic unless explicitly instructed in a task.
10. After all changes, do a final review pass to ensure consistency.

Apply all 15 tasks now. This is a luxury jewelry brand — the mobile experience must feel premium, elegant, and effortless.
```
