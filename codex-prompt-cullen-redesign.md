# PROMPT FOR CODEX — Cullen-Jewellery-Style Redesign of the GEMOIREJEWELSLLP Storefront

Context: the GEMOIREJEWELSLLP storefront already exists in this repo (Next.js 15 App Router + TypeScript + Tailwind v3, shared SQLite data layer under `data/` + `src/lib`, admin panel under `/admin`). Your job: **redesign the STOREFRONT only** (everything except `/admin`) so it is a 1:1 visual and structural match to cullenjewellery.com — same section order, same component language, same CSS values. Do NOT change the admin panel, do NOT touch the data layer, do NOT break the admin↔storefront sync. Keep using `next/image`-friendly markup, keep all existing routes working (/, /collections/[slug], /products/[slug], /cart, /checkout, /showroom, /faq, /blog, /invoice/[number], account). Swap copy/imagery to GEMOIRE's (lab-diamond, Indian market, 5 Indian showroom cities) but keep Cullen's *structure* identical.

## 0) DESIGN TOKENS (extracted from cullenjewellery.com's live CSS — use these EXACTLY)

Cullen's real tokens (they map almost 1:1 onto what we already have; adopt the ones that differ):

```css
:root {
  /* NAVY — Cullen's primary brand scale (replaces any green; the live site's
     nav strip and dark sections are deep navy, NOT green) */
  --cj-navy-50:  #f2f5fa;
  --cj-navy-100: #e3e8f0;
  --cj-navy-200: #c4cfdf;
  --cj-navy-400: #41587a;
  --cj-navy-500: #1f2e44;  /* primary navy — buttons, active states, focus rings */
  --cj-navy-600: #2a3c58;  /* hover */
  --cj-navy-900: #16233a;  /* brand-dark sections, footer */
  /* Neutrals */
  --cj-neutral-50:  #ffffff;
  --cj-neutral-100: #fefaf5; /* Cullen's "marketing" warm bg — ADOPT this over #faf6ef */
  --cj-neutral-200: #faf6ef; /* cream */
  --cj-neutral-300: #f4f4f4;
  --cj-neutral-400: #f4efe9;
  --cj-neutral-500: #d4d0cc; /* line */
  --cj-neutral-800: #737373; /* muted */
  --cj-neutral-900: #232323; /* ink/fore */
  /* Section backgrounds (Cullen uses these four) */
  --cj-back-default:   #ffffff;  /* neutral sections */
  --cj-back-marketing: #fefaf5; /* warm sections */
  --cj-brand:          #1f2e44; /* brand sections = navy */
  --cj-brand-dark:     #16233a; /* brand-dark sections (inverted white text) = navy-900 */
  /* Accent — champagne/gold stays as the secondary accent (pairs with navy) */
  --cj-gold: #c5a880;
  /* Image scrims on style tiles */
  --scrim-1: rgba(35,35,35,0);  /* top */
  --scrim-2: rgba(35,35,35,.8); /* bottom */
  /* Scrim gradient: linear-gradient(180deg, var(--scrim-1) 66%, var(--scrim-2) 120%) */
}
```

**RULE: every place the current repo uses `--cullen-forest: #1B382B` (green), replace it with the navy scale above — `--cullen-navy: #1f2e44` (primary), `#16233a` (dark/footer), `#2a3c58` (hover). The green `#1B382B` must disappear from the storefront entirely. Gold `#C5A880`, linen `#FDFBF7`, oatmeal `#F7F5F0`, charcoal `#1C1917` stay as-is.**

### Typography
- **Body/UI** → `Jost` (our current `--sans`), weights 400/500/600. Cullen's "brand headline" eyebrows are 14px; make our `.brand-headline` **Jost 600, 14px, letter-spacing .02em** — reads as the small eyebrow above a big serif title.
- **Display serif (their "ABC Arizona Mix")** → `Cormorant Garamond` (our `--display`). Cullen's H1 hero is ~48px, H2 section heads 32–42px, H3 24px, all display serif with tight leading. Set:
  - `.cj-hero-h1` → display serif, `clamp(2.6rem, 5vw, 3.5rem)` (42–56px), line-height 1.05, weight 500
  - `.cj-h2` → display serif, `clamp(1.8rem, 3vw, 2.25rem)` (32–36px), lh 1.1
  - `.cj-h3` → display serif, 24px, lh 1.2
  - body-m 14px / body-l 16px / body-s 12px, Jost, line-height 1.6, ink #232323 on light, white on navy sections.

### Type scale reference (Cullen): 11 / 12 / 14 / 16 / 18 / 20 / 24 / 32 / 42 / 48
### Spacing (Culong): 80px default section padding desktop, **120px "spacious"**, 40px mobile. Container max-width **1500px**, gutters 24px.

## 1) HEADER (the most important part — Cullen's header behavior, NAVY nav strip)

Per Cullen's live site (see reference screenshot): the top row sits above a **full-width navy strip** that holds the main nav.

- **Top row (page header)**: max-width 1500px, height ~64px, **white background** (or transparent over hero on homepage, switching to white + `box-shadow: 0 2px 8px rgba(0,0,0,.08)` on scroll >40px). Left: hamburger (mobile only). Centre-left: wordmark — "GEMOIRE / JEWELS LLP" lockup (Cormorant Garamond, 12px/8px stacked, charcoal; white when transparent over hero). Right: search icon, account link, cart icon with badge (24px stroke icons, 1.5 stroke width, currentColor).
- **NAV STRIP (the Cullen signature)**: directly below the top row, **full-bleed `#1f2e44` navy bar**, height ~48px, centred content, max-width 1500px. Items (Cullen's exact live set, UPPERCASE): **ENGAGEMENT RINGS** (chevron ⌄) · **WEDDING RINGS** (⌄) · **FINE JEWELRY** (⌄) · **CUSTOM DESIGN** · **GIFTS** (⌄).
  - Item style: **Jost 600, 13px, white `#fff`, letter-spacing .1em**, small 10px chevron (⌄) after items that have submenus, gap 32px between items.
  - **Hover**: text brightens to `#e3e8f0` + a **2px gold `#C5A880` underline animates in from left** (200ms); the chevron rotates 180° when its menu is open.
  - **Mega-menu flyout on hover**: drops **below** the strip, white background, 1px top border `#e3e8f0`, panel 200ms fade, 4-column grid of sub-links (12px, muted #737373, 7px row gaps) + right-side 240px promo image column (live featured product from admin). Sub-links per item:
    - ENGAGEMENT RINGS → Build a Ring, All Engagement Rings, New Arrivals, Custom-Made, Ready-to-Ship, By style (Solitaire / Three Stone / Halo / Toi et Moi / Bezel / East-West)
    - WEDDING RINGS → Women's (Pavé, Curved, Accents), Men's (Classic, Multi-Colour, Unique)
    - FINE JEWELRY → Rings, Earrings, Bracelets, Chains, Pendants
    - CUSTOM DESIGN → How it works, Gem shapes (Round, Oval, Pear, Emerald, Radiant, Cushion, Marquise, Princess, Asscher, Heart)
    - GIFTS → Gift cards, Personalisation, **Visit a showroom** (5 city links from settings, live)
- **Above the top row: announcement bar** — `#16233a` navy-dark strip, 13px white/80, centred, e.g. "Planning a proposal? See our cutting dates →".
- Mobile: the navy strip collapses; hamburger opens a **full-height side drawer** with `#1f2e44` navy background, white stacked nav (chevron expanders), close button top-right — matching the strip's color.
- Sticky behavior: on scroll the **white top row + navy strip** stick together (`position: sticky; top: 0`), shadow on the strip.

## 2) HOMEPAGE — EXACT Cullen section order (map every Cullen section to a GEMOIRE equivalent)

Build each section as a `cj-section` with one of 4 backgrounds: `neutral` (#fff), `warm` (#fefaf5), `brand` (navy `#1f2e44`), `brand-dark` (navy-900 `#16233a` + white text). Padding 80px desktop / 120px spacious / 40px mobile.

1. **HERO** (replaces Cullen's "Find the Ring You'll Love Forever" full-bleed block): full-width image 620–720px tall, dark scrim gradient (0% top → 60% rgba(35,35,35,.5) bottom), centred white text: brand-headline "Engagement Rings" (14px, Jost 600, letter-spaced, white/80) + H1 "Find the ring you'll love forever" (Cormorant Garamond 48–56px) + subcopy (16px white/85, max 480px) + **two buttons side by side**: primary = **navy `#1f2e44` pill "Shop Engagement Rings"** (inverted white text on dark bg → use **white bg, navy text** for contrast like Cullen does on dark; min-width 160px, padding 16px 32px, Jost 14px 600) and ghost = 1px white border, transparent, white text "Shop Ready-to-Ship".
2. **"Shop by Style" carousel** (Cullen's "Shop Lab Diamond Engagement Rings by Style"): section intro centred (H2 + body line), then horizontal carousel of **6 style tiles**: Solitaire · Bezel · Toi Et Moi · Three Stone · Halo · East-West.
   - **Style tile component (this is THE Cullen card)**: `aspect-ratio: 2/3`, min-height 571px, image absolute-fill `object-cover`. Image has the **scrim overlay** (`linear-gradient(180deg, transparent 66%, rgba(35,35,35,.8) 120%)`) **only when it has content over it**. Content pinned bottom, left-aligned: H3 24px white serif + ghost-inverted "Explore →" (1px border white, 40px tall, arrow icon 24px box). **Hover: image `transform: scale(1.1)` with 600ms ease — this zoom is Cullen's signature, must be there.** Arrows = square 44px icon buttons (1px #d4d0cc border, white bg, **navy chevron**; disabled = greyed), overlaying both ends; carousel shows 4 tiles desktop / 2 tablet / 1 mobile, drag/scroll snap.
3. **"Ready When You Are" (Ready-to-Ship block)** — warm section `#fefaf5`, **two-column 50/50 split, no gap-in between (image flush to text)**: left = brand-headline "Ready-To-Ship" (14px, navy #41587a) + H2 "Ready when you are" (36px serif) + body (14px, 1.6) + primary **navy pill** "Shop Ready-to-Ship Rings"; right = tall 3:4 showroom photo, square corners (Cullen uses square corners everywhere — **no border-radius on images or cards**, buttons-only pills/full-radius).
4. **"We've arrived in India" promo panel** (Cullen's US expansion banner) → ours: "Our showrooms, across India" — **full-bleed promo panel**: outer section neutral, inner panel = image left (45%) + content right (55%) on warm `#fefaf5` panel, image has 16px inner padding frame (Cullen wraps the image with white framing). Brand-headline "Visit a showroom" + H2 + city list ("Open now in Mumbai, Delhi NCR, Bengaluru, Hyderabad & Pune") + primary **navy button** "Book an appointment" linking /showroom.
5. **"In your words" reviews strip — BRAND-DARK section** (`#16233a` navy-900, inverted white text, **this is the one dark section on Cullen's home**): centred intro (brand-headline "GEMOIRE, in your words" in gold #C5A880 + H2 white "Tens of thousands of five-star reviews"), then **3-column testimonial cards** (or carousel on mobile): 5 gold `#C5A880` stars row, quote 16px white/90 serif-italic, reviewer name + city 12px white/60. Data from our reviews table (top 6 by rating, live from data layer).
6. **FAQ accordion "Your questions, answered"** — neutral section, two columns: left sticky H2 + intro, right = **6–8 FAQs** (from `faqs` table, admin-editable) in Cullen's accordion style: each row = question 16px Jost 600 ink + **plus/minus 24px icon** (navy; rotates 45° to × when open), 1px #d4d0cc divider between rows, answer 14px muted with 400ms height transition. No boxes, no cards — pure list dividers.
7. **"Beyond the jewelry" 3-tile carousel** (Cullen's Initiatives / Difference / Careers): 3 wide 21:9 tiles in a carousel, image fill, **scrim gradient bottom**, content bottom-left: H3 white serif 24px + 14px white/85 body + inverted ghost "Learn more →". Ours: "Our promise" (lab-grown, certified) · "The GEMOIRE difference" (IGI-certified, lifetime warranty) · "Craft, not factory" (our makers page).
8. **Instagram carousel** — neutral section, centred intro ("Instagram" H2 + line), then 4-per-view carousel of **1:1 square image cards** (Cullen's exact instagram tiles — plain `object-cover`, NO scrim, NO text, hover zoom 1.1), each linking target `_blank` to our handle. Feed managed from admin "Instagram feed" screen.
9. **Trust-badge strip** (Cullen's footer-adjacent strip): 4 icons in a row, each = 48px circular outline icon (1.5px stroke **navy `#1f2e44`**, **navy-100 `#e3e8f0` fill circle**) + 14px Jost 600 label below: "Worldwide express shipping · Free resizing · Lifetime ring warranty · Free customisation". Icons: truck, ruler/resize, shield, pencil (inline SVG, lucide-style 1.5 stroke).
10. **Newsletter band** (warm `#fefaf5`, centred): H2 "Stay in the loop" + body + **the Cullen draw hook**: "Subscribe for a chance to win a ₹5,000 voucher" → input (1px #d4d0cc border, 48px tall, white bg) + **navy pill** "Join". Posts to our existing `subscribers` endpoint.

Then **FOOTER** (Cullen's, adapted): **navy-900 `#16233a`** bg, 4-column grid (Quick Links / About Us / Client Care / Contact Us) 14px white/70 with 12px white column headings Jost 600; under Contact: phone, email, hours, **Service Areas = 5 city links** (live from settings); payment icon row (Visa/MC/Amex/GPay/PhonePe/UPI greyscale white SVGs) + "All payments are 256-bit SSL secure and encrypted." 12px white/40; bottom bar: "© 2026 GEMOIREJEWELSLLP · T&C · Privacy" 12px white/40. Social icons 24px circle-outlined (1px white/40 border).

## 3) COMPONENT SPECS (the shared building blocks — put in `src/components/cj/`)

- `cj-section` (neutral|warm|brand|brand-dark × spacious) — see tokens above; brand/brand-dark = navy scale.
- `CjButton`: **primary** = navy `#1f2e44` pill (border-radius 999px), padding 16px/32px, Jost 14px 600 white, hover `#2a3c58` (navy-600); **inverted primary on dark** = white bg + navy text; **secondary** = transparent, 1px #d4d0cc border, ink text, hover bg #f4f4f4; **inverted secondary/ghost** = transparent, 1px white, white text (used over images). Disabled: 40% opacity. **Focus ring everywhere = 2px `#1f2e44` offset 2px (replaces the green focus ring).**
- `CjIconCard` (the style tile above) with optional `withContent` scrim.
- `CjCarousel`: arrow-overlay variant (square 44px icon buttons on edges, navy chevron) + counter "2 / 6" bottom-right 12px muted; framer-motion already in repo — use it for the image zoom on hover and section reveals (fade+8px up, 500ms) but **keep Cullen's restraint: no parallax, no scroll-jacking**.
- `CjAccordion`: as in FAQ spec (navy icons).
- `CjMegaMenu`: as in header spec.
- Product card (PLP/PDP carousels, Cullen's product cards are NOT on home but ARE on collection pages): image 1:1 or 3:4 **square corners**, **no scrim**, name 14px Jost 500 ink + price 14px (our dual AUD/USD: primary 14px ink, secondary 12px muted stacked) + "From $" prefix; hover: **second image cross-fades in** (our hoverImage field, 200ms) — this replaces any scale zoom on product cards (zoom is for style tiles only), a small "View" pill slides up bottom-centre (navy pill, white text). This matches Cullen's product-card hover language.

## 4) PAGES BEYOND HOME (keep Cullen's grammar)

- **PLP /collection/[slug]**: H2 breadcrumb "Home / Engagement / Solitaire" (12px muted, slashes), H2 title 32px serif + count "48 rings", filter sidebar (left 240px, 1px right divider, checkbox facets: metal / shape / carat / price, all live from our product fields — **checked box = navy 12px square with white check**) + 3-col product grid of `CjProductCard` above + sort dropdown top-right. Keep our existing data wiring.
- **PDP /products/[slug]**: 50/50 two-col — left: main 1:1 square image + 3 thumbs column (selected = **1px navy outline**); right: 12px breadcrumb, H1 32px serif, price 18px + "or $X/mo" 12px muted, **variant selectors as Cullen's "fancy options"**: metal swatches = 32px circles with real metal gradient fills (platinum #d9dbe0→#f5f6f8, yellow gold #e8c47e→#f9e9c4, rose #e8b4a0→#f9d7c7, white gold #eef0f3) selected = **2px navy `#1f2e44` ring**; stone shape = icon tiles (active = **navy border + navy-50 `#f2f5fa` fill**); carat = pill options; then 2-col spec table (IGI cert no., clarity, cut, metal, band width) 14px rows with 1px dividers, **primary CTA "Add to cart" full-width navy pill + secondary "Build this ring" (navy outline pill)**, then **collapsible info accordions** (Shipping/Returns, Warranty, Our promise) in CjAccordion style. Keep our AR-try-on modal, quiz link, review block with **gold #C5A880 stars** + replies, "You may also like" 4-up carousel. Craft-tracker dots: done = **navy**, current = **gold** ring.
- **Showroom /showroom**: city pills (5 cities, active = **navy solid, white text; inactive = 1px navy/40 border, navy text**), then per-city card: map placeholder 16:9 (Unsplash), address, hours table (rows 1px dividers), phone, **primary "Book an appointment" navy pill** — posts to our bookings endpoint, shows Cullen-style confirmation state (navy-50 bg card, navy left border 3px).
- **Cart & checkout**: keep existing flow but restyle to Cullen: cart line items = 80px thumb + name 14px + spec 12px muted + qty stepper (− / n / +, 32px squares, 1px borders, no pill) + line total right; **free-shipping progress bar under "Continue" = 4px track #f4f4f4, fill navy `#1f2e44`** (keep threshold from settings). Checkout steps: active step = **navy underline + navy text**, inactive muted.
- **Order success**: **navy-900 `#16233a` block** (was green), white heading, white/75 body.
- **Blog / FAQ / invoice print / not-found**: FAQ = the CjAccordion page (centred, max 640px, H1 + count, JSON-LD block from SEO data). Invoice = existing print layout, restyle header lockup to **white-on-navy block** (was white-on-forest); PAID stamp = navy border/text, REFUNDED = red. 404 = Cullen's: centred, big serif 64px "Lost in the carat?" + sub + **navy pill** button home.
- **Admin login card / wordmark**: the `/login` storefront screen currently uses forest — switch to **navy** to stay consistent (admin panel internals may keep their own tokens, but the login page chrome + wordmark should be navy).

## 5) TECH RULES

- Tailwind v3 config / globals.css: add Cullen tokens as the source of truth. In this repo the storefront variables live as `--cullen-*` in `globals.css` and are used from `storefront.css` — **change `--cullen-forest: #1B382B` → `--cullen-navy: #1f2e44`, add `--cullen-navy-dark: #16233a`, `--cullen-navy-hover: #2a3c58`, `--cullen-navy-100: #e3e8f0`, `--cullen-navy-50: #f2f5fa`**, then **redefine `--cullen-forest`/`--cullen-forest-hover` as aliases of the navy values** (or do a find-replace of `--cullen-forest` → `--cullen-navy` across `globals.css` + `storefront.css`) so no green remains. Redefine `cream → #fefaf5` for section-warm. **Gold stays `#C5A880`.**
- Search `src/` for any literal `#1B382B`, `#13291F` (old green values) and replace with the navy scale — check `storefront.css`, component files, tailwind config.
- Every image: `next/image` with `fill`/`object-cover`, `loading="lazy"` below fold, explicit aspect wrappers (`aspect-[2/3]`, `aspect-[3/4]`, `aspect-[21/9]`) so layout never shifts.
- **Images**: do NOT hotlink Cullen's Shopify CDN. Use Unsplash (jewellery, showroom, craft) with sensible seed URLs; style tiles must keep 2:3, promo 4:5, instagram 1:1.
- Keep the admin panel, API routes, data layer, and discount/quiz/bookings behaviour exactly as-is; this pass is purely storefront presentation. Where our content differs from Cullen (Indian cities, AUD/USD pricing, GEMOIRE copy), keep OURS — structure is Cullen's, content is ours.
- **Color rule (critical)**: the final storefront must contain **no green anywhere** — nav strip, buttons, footer, dark review section, mobile drawer, focus rings, progress bars, invoice header, order-success block, active states: all navy scale. Gold `#C5A880` is the only warm accent (stars, dividers, active city pill highlights can use gold where current design already does).
- Responsive: 1500px container → 1200 at 1280 viewport → 720 single-column; header collapses to hamburger+logo+cart under 1024px (navy strip hidden, drawer replaces it); carousels per-view 4→2→1; sections 120→80→40px.
- `npm run typecheck` must stay clean. No console errors. Lighthouse mobile perf ≥ 90 (keep the image strategy lean, no LCP-heavy hero: use 1x hero + blur-up).

## 6) DEFINITION OF DONE (verify each, then list what's done + caveats in a handoff note)

1. Homepage has all 10 sections in the order above with Cullen's exact spacing/backgrounds/section-type pattern (neutral→warm→neutral→warm→**dark**→neutral→warm→neutral→badges→newsletter).
2. **Header: white top row + full-width navy `#1f2e44` nav strip** with the exact items ENGAGEMENT RINGS ⌄ / WEDDING RINGS ⌄ / FINE JEWELRY ⌄ / CUSTOM DESIGN / GIFTS ⌄ (uppercase white 13px, .1em tracking); hover = gold underline + chevron rotates; mega flyout white below strip; mobile drawer navy bg; sticky on scroll.
3. Style tiles: 2:3, scrim, white H3 + ghost "Explore", **hover zoom 1.1 verified**, carousel arrows (navy chevron) + counter work.
4. Reviews strip is the **navy-900 #16233a** section with gold stars and **live data from the reviews table** (add a review in admin → it shows here next run).
5. FAQ accordion renders from admin FAQs; accordion open/close animation 400ms; icons navy.
6. PLP filters (navy checkboxes) + PDP swatches (metal gradients, 2px navy ring selected) + hover-image crossfade work; cart (navy progress bar), checkout (navy active step), bookings, quiz all still function.
7. Footer is navy-900 with 5 live service-area cities from settings.
8. **No green left**: `grep -r "#1B382B\|#13291F\|forest" src/` in storefront files returns nothing (admin can keep its own tokens); every button, focus ring, dark section, drawer, invoice header, order-success block is navy.
9. Screenshots of home/PLP/PDP at 1440px and 390px for the handoff note; note every deviation (e.g. font substitution) in one table.

Build in this order: design tokens (navy scale replaces green) + `cj` components → header + navy nav strip / mega-menu → homepage sections top-to-bottom → PLP/PDP → cart/checkout/showroom/faq/footer → global green→navy sweep. Each screen visually complete before the next — no dead buttons, no placeholder images that break layout.
