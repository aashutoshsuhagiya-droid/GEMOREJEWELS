# PROMPT FOR CODEX — PASTE EVERYTHING INSIDE THIS BOX

You are building "GEMOIREJEWELSLLP" — a premium fine-jewellery e-commerce website. The information architecture, section order, and overall visual language must closely mirror cullenjewellery.com (use it as the structural reference and study it first), BUT the brand identity, assets, copy, and several signature sections must be GEMOIREJEWELSLLP's own — a close structural clone with a unique skin. Do NOT copy any Cullen images, logo, fonts, or written copy. Write all copy fresh for GEMOIREJEWELSLLP and use royalty-free jewellery photography or clearly-marked placeholders.

## 0) TECH STACK
- Next.js (App Router) + TypeScript + Tailwind CSS + shadcn/ui primitives
- React 19, next/image for optimized imagery, Framer Motion for subtle animations
- Fonts via next/font:
  - "Cormorant Garamond" (display serif, weights 400/500/600) — hero headline, section H2s, big numerals
  - "Jost" (geometric sans, weights 300/400/500/600) — nav, body, labels, buttons
- Data layer: local TS/JSON files (products, categories, FAQs, reviews) shaped like a CMS so it can be swapped for Shopify/Sanity later
- Fully responsive: mobile-first, tested at 375px, 768px, 1440px

## 1) BRAND IDENTITY — GEMOIREJEWELSLLP (keep this exact name everywhere)
- Legal/entity name: GEMOIREJEWELSLLP (footer: "© 2026 GEMOIREJEWELSLLP")
- Logo lockup: two-line centered mark — "GEMOIRE" in Cormorant Garamond 600 (display size ~34px), beneath it "JEWELS LLP" in Jost 500, 10px, letter-spacing +0.35em, both forest green. This lockup is the header logo (center) and footer logo (white version).
- Tone of voice: warm, confident, quietly-luxury. No exclamation marks. Short paragraphs (max 2 sentences). Use "lab-grown" not "lab-created". Signature phrase to build around: "A diamond cut to make a lifetime moment feel effortless."
- Brand motif: thin gold hairlines used as dividers between homepage sections (1px champagne-gold line with a small diamond ◆ glyph centered) — this is a GEMOIREJEWELSLLP-only detail that differentiates from the reference.

## 2) DESIGN SYSTEM (exact values, applied via CSS custom properties / Tailwind theme)

### Colors
```
--color-forest:        #236339;  (primary brand green — buttons, links, accents)
--color-forest-dark:   #253e2b;  (dark surfaces, announcement bar, footer bg)
--color-forest-light:  #daeadf;  (tinted backgrounds, chips)
--color-champagne:     #c9a962;  (GEMOIREJEWELSLLP accent — hairline dividers, star ratings, "New" chips, price-update shimmer)
--color-cream:         #faf6ef;  (warm off-white section backgrounds)
--color-cream-dark:    #f4efe9;  (alt section background / card fill)
--color-white:         #ffffff;
--color-ink:           #232323;  (primary text)
--color-muted:         #737373;  (secondary text)
--color-line:          #d4d0cc;  (hairline borders)
--color-terracotta:    #cda17f;  (warm secondary accent — sale badges)
--color-red:           #e43a3a;  (wishlist heart)
```
Never use pure black for text; use --color-ink. Backgrounds alternate white → cream → white for rhythm.

### Typography scale
| Token | Size | Font | Tracking | Use |
|---|---|---|---|---|
| h1 | 3rem (48px), 2.25rem mobile | Cormorant Garamond 500 | 0 | Hero headline |
| h2 | 2rem (32px) | Cormorant Garamond 500 | 0 | Section titles |
| h3 | 1.5rem (24px) | Jost 500 | 0 | Card titles, PDP product name |
| h4 | 1.25rem (20px) | Jost 500 | 0 | Subheads |
| body-l | 16px / 1.6 | Jost 400 | 0 | Paragraphs |
| body-m | 14px / 1.5 | Jost 400 | 0 | Product cards, lists |
| label | 11–12px | Jost 500 | +0.08em, UPPERCASE | Nav items, buttons, eyebrows above H2s |
| caption | 12px | Jost 300 | 0 | Footnotes, prices subtext |

Site-wide pattern: small uppercase "eyebrow" label (Jost, tracked out, champagne color) ABOVE a large serif H2.

### Layout & components
- Max content width 1280px; 24px side padding mobile / 48px desktop
- Section vertical padding: 96px desktop / 64px mobile
- Buttons: pill radius 999px, height 52px, Jost 500 13px uppercase +0.08em; primary = solid forest, white text; secondary = 1px ink outline transparent bg; hover = 8% darker + translateY(-1px); 200ms ease
- Cards/images: radius 6px; product image hover = scale 1.03 over 400ms with second-image crossfade
- Accordions: full-width rows, 1px --color-line separators, plus/minus icon rotates 180°, answer fades in
- Star ratings: 14px, filled in champagne-gold #c9a962 (signature choice, not yellow), "4.9 out of 5"
- Prices: dual-line currency "AUD $X,XXX / USD $Y,YYY", on variant change the new price does a 400ms champagne shimmer sweep

## 3) GLOBAL COMPONENTS

### Announcement bar
Forest-dark bg, white 12px Jost, centered, dismissible: "Planning a December proposal? Cut-off dates for guaranteed delivery — view crafting timeframes →"

### Header (sticky, white, 1px hairline appears on scroll)
- Left: hamburger (mobile) / nav (desktop)
- Center: GEMOIREJEWELSLLP logo lockup (~36px tall)
- Right: Search icon · "Visit a Showroom" text link · Account · Cart with quantity badge
- Desktop nav: Ready-to-Ship · Engagement (mega) · Wedding (mega) · Fine Jewelry (mega) · Education (mega) · Contact
- Mega menu: hover, 300ms fade + 8px rise; columns = shop by metal (Platinum / Yellow / Rose / White Gold with tiny ring thumbnails), shop by style (Solitaire / Halo / Bezel / Three-Stone / Toi-et-Moi / East-West with custom 1.5px line icons), guidance links, featured product tile right edge (image + name + price + "New" chip)
- UNIQUE: nav underline sweep — a 1px champagne-gold line that grows left-to-right under the active/hover item in 250ms

### Mobile menu
Full-screen slide-in, forest-dark bg, Cormorant top-level categories expanding as accordions, search box top, region selector pinned bottom.

## 4) HOMEPAGE — sections in EXACTLY this order

1. **Announcement bar**
2. **Sticky header**
3. **Hero** — full-width 80vh. Cream-to-white gradient, lifestyle photo (hands holding ring, warm light) on right 55% bleeding off right edge, 6px radius crop. Left: eyebrow "NEW ARRIVALS", H1 "Find the ring you'll love forever.", one-line subcopy on lab-grown = identical sparkle at a fraction of the price, buttons [Build Your Ring] [View Ready-to-Ship], small deadline line with calendar icon ("Order by Nov 11 with express crafting for Dec 24 delivery")
4. **Style showcase grid** — eyebrow "SIX WAYS TO SAY YES" over H2 "Shop by Setting". 3×2 desktop / 2-col mobile. Square 1:1 photos, hover crossfade + "Explore →" sliding up on a cream scrim. Labels: Solitaire, Halo, Bezel, Three-Stone, Toi et Moi, East-West
5. **[UNIQUE] "Find Your Setting" quiz band** — cream-dark bg, centered card: 3-question inline quiz (personality → lifestyle → sparkle preference), on finish recommends 2 setting styles with product links. This is a GEMOIREJEWELSLLP differentiator; reference site has no equivalent
6. **Ready-to-Ship banner** — cream full-width, split: left text (eyebrow "READY WHEN YOU ARE", H2 "Shipped this week, not next year", [View Ready-to-Ship]), right: two overlapping showroom photos postcard-collage style (12px offsets, soft shadows)
7. **Gold hairline divider** (brand motif from section 1)
8. **Value prop strip** — 4 columns desktop / 2×2 mobile: "Free 10-day delivery · Free resizing for life · Lifetime warranty · Free customisation", minimal 1.5px-stroke line icons (custom-drawn set, 28px) above two-line labels
9. **Showroom section** — dark forest bg, "Visit our showroom", city pills (Los Angeles · Houston · San Diego · Austin · San Francisco), interior photo strip, white [Book an Appointment] button
10. **[UNIQUE] "Diamond Origins" journey** — white bg, 3-step horizontal journey with connecting gold line: "Grown in 45 days, not millennia" (crystal farm) → "Cut by hand in our atelier" (crafting bench photo) → "Certified by IGI, insured to your door". Small map graphic showing growth-to-door journey. Replaces a plain "impact" block with something interactive: steps advance on scroll
11. **Social proof** — centered: big "4.9" in Cormorant + 5 champagne stars, "from 20,000+ reviews", 3-column review carousel (6s autoplay, arrows, dots), cards: stars, italic quote, name + city + "Verified Purchase"
12. **FAQ accordion** — "Your questions, answered", 8–10 items (crafting timeframes, worldwide shipping, lab-grown vs mined, diamond shapes, warranty, moissanite, showroom locations, certification). Single-open, smooth height animation
13. **Instagram / feed carousel** — "In your words" + handle link, horizontal infinite-feel scroll of 1:1 images, hover play icon
14. **Newsletter band** — cream, H3 "Get AUD $500 off your first ring" + fine print "by entering our monthly voucher draw", pill email input (1px ink border) + [Subscribe], terms checkbox, success state "You're in. Good luck with the draw."
15. **Footer** — forest-dark bg, white/60% text. 4 columns (Shop / About Us / Client Care / Contact incl. phone, hours, appointment note) + 5th "Our Locations" city list. 6 social line icons (IG, TikTok, FB, YT, Pinterest, LinkedIn). Bottom bar: payment line-art icons (Visa, MC, Amex, GPay, PayPal), "Secure checkout · SSL encrypted", region selector, legal links, "© 2026 GEMOIREJEWELSLLP"

## 5) COLLECTION / PLP PAGES
- Breadcrumb (Home / Engagement Rings / Halo)
- Header: eyebrow + serif H2 + one-line description, sort dropdown right
- Filter sidebar (desktop 240px): Metal, Carat, Shape, Setting, Price, Clarity, Colour, Certification — accordions with checkboxes + live counts, "Clear all"
- Mobile: "Filters" button → bottom-sheet drawer
- Active filter pills above grid, removable
- Grid: 4 / 3 / 2 columns, 16px gap; card = 1:1 image, hover second image, "New"/"Bestseller" chip top-left (champagne bg), heart top-right (fills red when active), name 14px Jost, spec line "1.0ct Halo, 18ct White Gold" 12px muted, dual-currency price, champagne star rating
- Infinite scroll with skeleton shimmer cards
- [UNIQUE] Collection names: use GEMOIREJEWELSLLP's own named collections alongside settings, e.g. "The Aaria Collection" (solitaires), "The Kavya Collection" (halos), "The Mira Collection" (three-stone) — original names, not Cullen's

## 6) PRODUCT DETAIL PAGE
- Two columns: left sticky gallery (large 1:1 + 5-thumb strip, 3px radius, active thumb 2px forest ring), right:
  - H3 name, "from $X,XXX / $Y,YYY USD" dual price, star rating + "214 reviews" link
  - Spec quick row: metal · carat · clarity · shape · IGI — 11px labels + 14px values
  - Variant selectors: Metal (swatch circles w/ tooltips: Platinum, 18ct Yellow/Rose/White Gold), Diamond (carat + clarity pills), Setting — price updates live with champagne shimmer
  - [Add to Cart] full-width-on-mobile pill, [Save for Later] ghost, heart wishlist
  - [UNIQUE] "View on your hand" AR-try-on placeholder button (opens modal: "AR try-on coming to the app" + upload-your-photo fallback)
  - Delivery estimator: postcode input → "Express: arrives Jan 12 · Standard: Jan 25"
  - Accordions: "The Details" (spec table), "Certification" (IGI no. + download), "Shipping & Returns", "Our promise" (warranty)
- Below: "You may also like" 4-item carousel · "Complete the look" pair card · reviews with histogram (5 bars) + 3 written reviews · "How we craft your ring" 4-step timeline (Design → Craft → Inspect → Deliver)
- [UNIQUE] **Craft Tracker**: on checkout-confirmed state and in account, a live "Your ring is at Stage 2 of 4" progress strip (mock data), with date per stage — this is a differentiator the reference site doesn't surface prominently

## 7) CART / CHECKOUT (mock, no real payments)
- Cart drawer (right, 420px): line items with thumb, variant edit, qty stepper, remove; subtotal; free-ship progress bar ("You're $40 from free express delivery"); [View Cart] [Checkout]
- Cart page: + promo code, trust icon row, [Continue to Checkout]
- Checkout: 3-step mock (Shipping → Delivery → Payment) with progress dots, forest success screen "Order confirmed — your craft date is Jan 4" + Craft Tracker link + **"Download your invoice" link** (renders a clean A4 invoice: GEMOIREJEWELSLLP letterhead, GSTIN placeholder, line items with HSN codes, CGST/SGST @18% breakdown, dual-currency totals, green "PAID" stamp, print-ready with no chrome)

## 8) MOTION & POLISH (this is what separates #1 from average)
- Hero elements fade-up staggered 80ms on load
- Intersection-observer section reveals (opacity 0→1, 12px rise, 600ms ease-out, once)
- Mega menu 150ms fade + 4px rise; nav champagne underline sweep (250ms)
- Carousels 6s autoplay, pause on hover, swipe on mobile
- Skeleton shimmer for all async image states (no spinners)
- focus-visible: 2px forest ring, 2px offset
- Button press: scale 0.98 on active
- 404: cream bg, big serif "Lost your way?" + search box + popular category links
- Lighthouse target: >95 performance, zero CLS (explicit image aspect-ratios)

## 9) GEMOIREJEWELSLLP-ONLY UNIQUE ELEMENTS (do not skip — these are the differentiators from the reference)
1. Champagne-gold #c9a962 accent system (stars, chips, hairline dividers, price shimmer, nav underline sweep)
2. Gold hairline + ◆ diamond divider between major homepage sections
3. "Find Your Setting" 3-question quiz band on homepage
4. "Diamond Origins" scroll-activated 3-step journey section
5. AR try-on placeholder + "View on your hand" on PDP
6. Post-purchase Craft Tracker (4-stage live progress strip)
7. Named original collections: The Aaria / Kavya / Mira Collections
8. Two-line GEMOIREJEWELSLLP logo lockup + footer legal name "© 2026 GEMOIREJEWELSLLP"
9. Custom 1.5px-stroke line-icon set (no stock icon library look)

## 10) CONTENT: WRITE FRESH, NEVER COPY
All marketing copy original for GEMOIREJEWELSLLP — warm, confident, quietly-luxury tone. Emulate the tone of this reference line (do NOT copy it): "A diamond cut to make a lifetime moment feel effortless." Every paragraph ≤ 2 sentences. Dual currency AUD/USD throughout. Product names, collection names, review quotes: invented.

## 11) DELIVERABLES & DEFINITION OF DONE
- /app: home, collections/[slug], products/[slug], cart, checkout, showroom, faq, 404
- components/: layout/ (Header, Footer, AnnouncementBar, MobileMenu, MegaMenu), commerce/ (ProductCard, FilterSidebar, CartDrawer, CraftTracker, QuizBand), marketing/ (Hero, StyleGrid, OriginsJourney, Testimonials, FAQAccordion, NewsletterBand, GoldDivider)
- data/: products.ts (24 products across 3 categories with variants, dual prices, ratings), faqs.ts, reviews.ts
- Type-check passes, zero build warnings, every page responsive at 375/768/1440, every interaction in section 8 working
- All 9 elements from section 9 present and functional
- After build: output a checklist of placeholder assets to swap for real GEMOIREJEWELSLLP photography before launch

Build section by section in the order above. Every section must use only the token system in section 2 — no ad-hoc colors, sizes, or radii. When finished, self-review against this spec and fix drift before reporting done.

---
