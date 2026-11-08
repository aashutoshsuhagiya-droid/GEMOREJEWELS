# PROMPT FOR CODEX — PART 2: SHOPIFY-STYLE ADMIN PANEL

Context: you already built the GEMOIREJEWELSLLP storefront (Next.js + TypeScript + Tailwind, data in data/*.ts). Now build a Shopify-like admin panel in the SAME repo that manages that exact data. The admin and storefront must share one data layer (see section 1) so that products/orders created in admin instantly appear on the storefront.

## 0) TECH STACK (must match storefront)
- Same Next.js app, admin lives under /admin (App Router, protected route group)
- Zustand or React Context for client state; React Query patterns OK but no backend required
- Data layer: SQLite via better-sqlite3 (single db file, seeded from current data/products.ts, faqs.ts, reviews.ts on first run) with a thin typed repository layer (repo layer is the ONLY thing the storefront and admin both call — if we later swap to Supabase/Postgres, only this layer changes)
- Charts: Recharts (line, bar, donut only — no fancy 3D)
- Auth: mock login (any email + password "demo123"), session via httpOnly cookie, role stored in cookie; "Admin" role unlocks Settings and Reports export
- Same design tokens as storefront: forest #236339, forest-dark #253e2b, cream #faf6ef, ink #232323, muted #737373, line #d4d0cc, champagne #c9a962, red #e43a3a. Jost for UI body/nav, Cormorant Garamond ONLY for the admin wordmark "GEMOIRE" + "JEWELS LLP" (12px/8px) top-left. Radius: 6px cards, 999px pill buttons. Admin is a light theme (white bg, cream section fills) — NO dark sidebar; sidebar is white with 1px line dividers, active item = forest-left 3px bar + forest text.

## 1) LAYOUT (apply to every admin page)
- Left sidebar 240px, fixed: grouped nav —
  - OVERVIEW: Dashboard, Orders, Invoices, Customers
  - CATALOG: Products, Collections, Inventory
  - MARKETING: Discounts, Newsletter, Instagram feed, SEO & Analytics
  - CONTENT: FAQs, Blog, Review responses
  - GEMOIRE EXTRAS: Craft Tracker, Quiz Builder, Showroom bookings, AR try-on
  - SYSTEM: Reports, Settings
- Top bar 56px: global search (⌘K palette, searches products/orders/customers by id, name, sku), right side: environment chip "PREVIEW STORE ↗" (opens storefront in new tab, links are live so admin edits are visible there), notifications bell with unread dot, admin avatar + name
- Every list page: toolbar (search input + status filter chips + "New X" pill button right), data table, footer pagination (10/25/50 per page), bulk-select checkboxes enabling an action bar (Export CSV / Archive / Delete with confirm dialog, delete never allowed on orders)
- Row click → slides a detail DRAWER from the right (560px, 1px line left border, 300ms ease), never full navigation for status changes; deep edits open full sub-pages
- Every mutation = toast top-right (4s auto-dismiss, forest check icon for success, red for error), list updates in place (no page reload)
- Empty states: centered illustration-free state — big serif H3 "No orders yet", one muted line, single primary button
- Loading states: skeleton table rows (shimmer), never spinners; forms disable submit button with 15% opacity while saving, show "Saved ✓" inline next to field on success
- Focus-visible: 2px forest ring 2px offset everywhere; ⌘K, / for search, esc closes drawers — document all in a small "Shortcuts" row at sidebar bottom
- Fully responsive down to 1024px: sidebar collapses to icon rail 64px (tooltip labels), below 1024px a top hamburger

## 2) DASHBOARD (/admin) — the command center, 6 widget rows
- **Global period toggle** (top-right of dashboard): 7d / 30d / 90d / custom range — every widget on the page recalculates from this single selector
- **Row 1 — KPI cards (4)**: Revenue, Orders, Avg Order Value, Conversion rate — each with ▲/▼ % vs previous period (forest up / red down) + 14px sparkline under the number
- **Row 2 — "Today" strip**: 5 compact stat chips in one row — today's orders + revenue, new customers, craft stages started today, reviews awaiting reply, unconfirmed showroom bookings. Each chip click-through to its screen
- **Row 3 — charts**: left (2/3 width) revenue line chart (forest line, cream area fill, period follows the global toggle); right (1/3) donut — "new vs returning customers" split for the period, center label shows the %
- **Row 4 — 3-column widgets**:
  - "Orders need attention" — 5 rows, status chips (Processing = forest-light bg/forest text, Shipped = champagne, Cancelled = red-100/red text), each row links to the order drawer
  - "Craft pipeline" mini-board — 4 columns (Designed / Crafting / Certified / Shipped) with counts, click-through to Craft Tracker; **any order stuck in one stage >7 days gets a red "stuck" dot** on its column
  - "Alerts" panel — aggregated, each row one-click to its screen: low-stock count, out-of-stock items, discount usage >80% of cap, discounts expiring in 7d, payment-failed orders, flagged reviews, unconfirmed bookings. Panel header: count badge + "Mark all read"
- **Row 5 — leaderboards (2 side-by-side)**: "Top products" — top 5 by revenue for the period (rank, thumb, name, units, revenue, ▲/▼ vs prev period); "Top search terms" — mini table from the SEO analytics (term, clicks, CTR, trend arrow) with a link to /admin/seo
- **Row 6 — "Recent activity" feed**: chronological merged stream — new orders (total in bold), new reviews (star + product name + inline [Reply] quick action), new newsletter subscribers, craft stage completions ("GM-2026-0041 → Certified"), discount creations. Each entry: icon + timestamp ("2h ago") + click-through. "View all" opens a full-page activity log
- **Quick actions row** (pinned below top bar or above Row 1, pill buttons): New product · Create discount · Reply to review · View storefront ↗
- **Widget behavior**: every widget loads independently with its own skeleton shimmer (never one big page spinner); an empty period shows "No orders in this period" state, not zero rows; all numbers on the page respect the global period toggle — verify by switching 7d ↔ 90d and checking every row updates

## 3) ORDERS
- List columns: Order # (GM-2026-0001 style, monospace), customer (name + email), date, item count, total (dual currency AUD/USD in one cell, stacked 14px/12px muted), status, payment (Paid/Pending chip), actions (View, Print)
- Status filter chips: All / Pending / Crafting / Shipped / Delivered / Cancelled (with live counts)
- Drawer: order timeline vertical (created → paid → crafting started → shipped, timestamps), items table (thumb, name, variant spec line, qty, line total), customer card, address card, notes, [Mark as Shipped] button when status=Processing — updates status, auto-generates a mock tracking code, fires a toast, and the status appears on the storefront product/account page instantly
- Billing row inside the drawer: "Invoice INV-GM-2026-XXXX — [View] [Download PDF] [Email to customer]", greyed out until the order is Paid; for cancelled orders shows "Credit note instead" link
- CSV export button exports the filtered view

## 4) INVOICES / BILLING (auto-generates on order payment)
- **Trigger**: when an order's paymentStatus flips to Paid (in demo: "Simulate payment" button on order detail, or admin marks it paid), a GST-style invoice is auto-created — no manual step, exactly like Shopify's receipts
- **List page** (/admin/invoices): columns — Invoice # (INV-GM-2026-0001, mono), Order #, customer, issue date, subtotal / tax (GST) / total (dual currency stacked cell), status chip (Paid / Due / Refunded / Credit Note), actions [View] [Download PDF] [Email]
- **Invoice view (drawer + printable full page)**:
  - Header: GEMOIREJEWELSLLP logo lockup (white-on-forest block), "GEMOIREJEWELSLLP · GSTIN 06ABCDE1234F1Z5 · CIN U74999..." (placeholder values, editable in Settings → Billing)
  - Bill To (customer + address), invoice no., order ref, issue date, due date
  - Line items: # · description (with variant spec) · HSN code · qty · rate · amount
  - Totals block: Subtotal · GST @18% (split CGST/SGST in demo) · shipping (Free if over threshold, else value) · **Grand Total** — dual-currency column (AUD / USD side by side)
  - Payment status stamp: paid = forest-green "PAID" diagonal stamp with date + method (Visa / GPay / etc.); refunded = red "REFUNDED" stamp with credit-note ref
  - Footer: thank-you line ("Crafting begins on {date}"), support contact, bank details, terms in 8px muted
- **Actions**: [Download PDF] (render the invoice view to a clean print-only layout — @media print styles, A4, no admin chrome), [Email to customer] (mock send, toast "Invoice emailed to x@y"), [Mark as Refunded] (only when order is cancelled/returned — creates a linked Credit Note document, stamps the invoice)
- **Credit notes**: separate status + simple list tab, each linked back to its invoice and order
- **Storefront side**: order success screen (checkout) links "Download your invoice"; account → Orders → each paid order shows [Invoice]
- **Reports**: add a "Tax collected (GST)" KPI + monthly tax-by-month bar chart to Reports; CSV export for tax summary

## 5) PRODUCTS (the big one)
- List: thumb, name + collection, sku (mono), stock (red text when <5, "Low" chip), price (dual currency), rating (champagne stars, read-only from reviews), status chip (Active/Draft/Archived), edit icon
- **New / Edit product page** (full-page, two-column: left live preview panel, right form):
  - Left preview = the EXACT storefront ProductCard component, live-updating as you type the form — plus a PDP preview toggle (card / detail view)
  - Form: name, slug (auto from name, editable), collection multi-select (Aaria / Kavya / Mira + custom), metal swatches multi-select, shape, setting style, carat/clarity/colour, dual prices (AUD primary, USD auto-calculated editable), cost, sku (auto "GM-{CAT}-{NNN}"), stock, IGI cert no., images (upload or Unsplash placeholder URL, 1:1 crop UI, 8 slots, set-primary star), second-image-for-hover slot (labelled "hover image"), badges (New / Bestseller / Sale, multi), description rich text (toolbar: bold, italic, link, H3), "Ready-to-ship" toggle, "Featured in mega menu" toggle
  - SEO block: meta title + meta description with live char counters (green ≤60/160, red over), **live SERP preview** (fake Google result card) + **social card preview** (OG image mockup with title/desc overlaid), OG image slot (separate from product images), JSON-LD toggle (product schema + review stars on PDP, on by default)
  - Footer sticky: [Save Draft] [Publish] (forest pill, disabled with reason tooltip until required fields valid: name, price, ≥1 image, collection)
- Save → toast, list row updates, storefront reflects it immediately
- Inventory tab (catalog level): same products, stock-only view with +/- steppers per row, low-stock alert list top ("5 items below threshold")

## 6) COLLECTIONS
- 4 collection cards (Aaria / Kavya / Mira + "Ready-to-Ship" virtual collection): cover image, product count, revenue 30d, [Edit]
- Edit: name (renaming a named collection updates it everywhere — storefront, PLP, mega menu), description, product membership (checkbox grid of all products, live count), "show on homepage" toggle + order drag-handle (reorders the homepage style grid), "featured mega-menu tile" slot (pick 1 product, shows its thumbnail in the mega menu)

## 7) CUSTOMERS
- List: name, email, order count, total spent (dual currency), last order, tags (chip multi-select: VIP, Repeat, Proposal-Season), VAS status
- Drawer: order history table, tags editor (add/remove chip with backspace), notes (internal), "View storefront profile" link
- Merge flow: pick two customers → warning modal listing conflicts (different emails, overlapping orders) → merge keeps newer record, older orders re-parented

## 8) DISCOUNTS
- List: code (mono, uppercase), type (percentage/fixed/free shipping), value, scope (site-wide / category / product), expiry, usage count + cap bar, status
- New discount: type pills, value, scope picker, cap, dates, auto-generated code preview (e.g. GEMORE-10, editable)
- [Copy] button copies to clipboard with toast; codes work on the storefront cart page promo field

## 9) NEWSLETTER + INSTAGRAM FEED
- Subscribers table: email, added date, source, unsubscribed flag; [Export CSV]; simulated unsubscribe handling
- Instagram feed manager: pick 8–12 images from the product/image library for the homepage "In your words" carousel, drag-to-reorder, set handle, "under review" chip per image
- Voucher draw: winner picker — show latest 3 winners, "draw a winner" button picks random from subscribers (mock, seeds deterministically so it's demo-safe), shows the winner card

## 10) SEO & ANALYTICS (new — this is the SEO console)
A tabbed screen at /admin/seo with 5 tabs, all backed by one SEO types module:

- **Tab 1 — Pages**: editable SEO records for every storefront page type (Home, each Collection/PLP, each Product [links into the product editor], FAQ, Showroom, 404, Cart, Checkout) — per page: meta title (≤60 char counter), meta description (≤160 counter, both live), canonical URL, Open Graph image, JSON-LD type picker (WebSite / Product / FAQPage / Event / Article), [Preview SERP] button (mock Google snippet) + [Preview Social Card]. Unpublished pages flagged with a red "missing description" chip; a top "SEO health" bar shows % of pages with complete meta (green ≥90%, amber, red <60%)
- **Tab 2 — Site-wide**: default title template ("{page} · GEMOIREJEWELSLLP" style, editable), default OG image + account name/description, social share fallbacks; **Structured data toggles**: Product+Review schema on PDPs, FAQ schema on FAQ page, BreadcrumbList sitewide — each toggle regenerates the JSON-LD on the relevant page (viewable via a "View rendered source" eye icon)
- **Tab 3 — Sitemap & Robots**: live-generated /sitemap.xml and /robots.txt preview (monospace, read-only, reflects current published pages/products), [Regenerate] button with last-generated timestamp; XML errors highlighted if any route is missing from the map
- **Tab 4 — Redirects**: list of URL redirects (source → destination, 301/302 type chip, "hits" count mock); [New redirect] inline row form; [Test] link that simulates hitting the source URL; duplicate-source conflict warnings
- **Tab 5 — Analytics**: mock but visually real — top search terms table (term, clicks, CTR, position, 30-day trend arrow), top landing pages, crawl status card (bot coverage, orphaned page count, 404 click count), Core Web Vitals mock (LCP/CLS/INP with pass/fail chips tied to the Lighthouse target), "SEO score" donut (0–100, computed from Tab 1 health + redirects + structured-data coverage); [Export CSV]

Storefront wiring (required so this isn't cosmetic): the storefront's <head>/metadata must read from this SEO data layer — title templates, per-page overrides, JSON-LD blocks rendered on PDP/FAQ, real /sitemap.xml + /robots.txt routes, and a /api/test-redirect check. Changing anything in this console must be verifiable by viewing the storefront page's rendered source.

## 11) CONTENT — FAQs, BLOG, REVIEW RESPONSES
- FAQs: accordion editor mirroring the storefront FAQ data; add/edit/reorder (drag handles) / delete; the homepage + /faq page update live
- Blog: title, cover (16:9 crop), body rich text, category, publish date, excerpt; status chips Draft/Published; list page with preview link
- Review center: inbox of reviews across products with rating filter; reply composer per review (shows "Store reply" on the storefront PDP review block once sent); [Flag] marks for "Hidden" status (removes from storefront, reversible)

## 12) GEMOIRE EXTRAS (differentiators — must exist, mock data OK)
- **Craft Tracker manager**: per-order stage stepper (Design complete → Crafting → Certification → Dispatch), current date + expected date per stage; override any stage date; blocked state (red outline + note field); global "pipeline view" board = the same 4 columns from the dashboard KPI area, drag an order card between columns to advance stages
- **Quiz Builder**: edit the 3 homepage quiz questions (question text + 3 answer options each, editable + reorderable), set which 2 setting styles each answer combo recommends (outcome matrix 3×3 grid, each cell = 2 style picks); [Preview] opens a popup running the actual storefront quiz component; [Publish] toggles live/offline
- **Showroom bookings**: list of appointment requests (name, city, date, preferred time, status New/Confirmed/No-show), [Confirm] opens a native-feel calendar (mock, day view) to slot it; confirmed state reflects on the storefront "Book an Appointment" confirmation
- **AR try-on**: toggle + waitlist note text for the PDP "View on your hand" modal; [Simulate] test mode

## 13) REPORTS (Admin role only)
- Date-range picker (defaults 30d, quick chips 7d/30d/90d/YTD): revenue, orders, AOV, top products by revenue (horizontal bars), top collections, conversion, return rate, reviews by rating (5-bar donut), newsletter growth
- Every chart has [Export CSV] (mock CSV generation, real download)
- "Store health" card: pagespeed score mock, broken image count, 404 clicks count — all mock but visually complete

## 14) SETTINGS
- General: store name, currency pair (AUD+USD default), locale, timezone
- Shipping: rates editor per zone (Express / Standard, cost + days each), free-ship threshold (this value drives the storefront cart drawer progress bar — change it, check the bar updates)
- Payment: mock gateway toggle (no real integration), display-only bank details block
- Billing: invoice number prefix (default "INV-GM-"), GSTIN + CIN fields, HSN code defaults for ring/earring/bracelet categories, GST rate (default 18%), CGST/SGST split toggle, invoice footer thank-you line, "auto-email invoice on payment" toggle (on by default) — all of these render live on the next generated invoice
- Showroom: edit the 5 cities list (add/remove/rename — drives the storefront city pills + footer locations)
- Integrations: IGI cert template fields (mock), Instagram connection (mock, "Connect" button with spinner → connected state)
- Danger zone: [Reset demo data] (seed script re-run, confirm modal typing "RESET"), [Export all data JSON]

## 15) DATA MODEL (define these types once, share via a shared/ package)
Product (id, slug, name, collectionIds[], metal[], shape, setting, carat, clarity, color, priceAud, priceUsd, cost, sku, stock, igeCertNo, images[{src, alt, isPrimary}], hoverImage, badges[], description, readyToShip, featured, status, createdAt), Order (id, code, customerId, items[{productId, variant, qty, lineTotal, hsnCode}], subtotal, gstRate, gstAmount, shipping, totalAud/Usd, status, paymentStatus, paymentMethod, createdAt, timeline[{stage, at}], craftStage), Invoice (id, number, orderId, customerId, issuedAt, dueAt, lines[{desc, hsn, qty, rate, amount}], subtotal, cgst, sgst, shipping, totalAud/Usd, status: paid|due|refunded, stampDate, creditNoteId?), CreditNote (id, number, invoiceId, orderId, amount, reason, createdAt), SeoPage (pageType, slug, title, description, canonical, ogImage, jsonLdType, status), SeoSite (titleTemplate, defaultOg{image,siteName,description}), SitemapEntry, RedirectRule (from, to, type, hits, active), SeoAnalytics (topTerms[{term, clicks, ctr, position}], landingPages, vitals{LCP,CLS,INP}), Customer (id, name, email, tags[], totalSpent, orderCount, notes), Discount, Review, Faq, BlogPost, Subscriber, Booking, CraftStage, QuizQuestion/Outcome — all in a shared types module; seed a realistic demo dataset (40 products, 60 orders across 90 days, 80 customers, 12 reviews, 8 faqs, 4 blog posts, 60 subscribers, 5 bookings) so every admin screen has real-looking content on first run — include matching invoices for every paid order + 2 credit notes on refunded/cancelled orders, so the Invoices screen and Reports tax chart are never empty.

## 16) DEFINITION OF DONE
- npm run dev shows login → every section above navigable; no console errors, type-check clean
- Storefront ↔ admin live sync proven: create a product in admin → appears on storefront PLP; run a discount → applies on storefront cart; change free-ship threshold → cart drawer bar updates; advance a craft stage → storefront account page tracker updates; **mark an order paid → invoice auto-generates, appears in Invoices list + Reports tax chart, "Download PDF" renders the print layout, and the storefront order success screen shows the invoice link**; **edit a page's meta title/description in SEO & Analytics → that change appears in the storefront's rendered <head> source; toggle FAQ structured data → the FAQ page's JSON-LD block appears/disappears; add a redirect → hitting the old URL on the storefront hits the new one; regenerate sitemap → the live /sitemap.xml route lists only published pages**
- Every drawer, toast, ⌘K, drag-reorder, and export works; empty states populated where lists can be emptied
- After the build: list every screen + its mock-data caveats in a handoff note

Build in this order: layout shell + auth → data/seed → Dashboard → Products → Orders → Invoices/Billing → Customers → Discounts → Newsletter/Instagram → SEO & Analytics → Content → GEMOIRE EXTRAS → Reports → Settings. Each screen: fully working interactions before moving to the next — no placeholder clickdead buttons anywhere in the final state.

---
