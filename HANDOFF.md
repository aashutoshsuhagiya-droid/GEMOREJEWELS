# GEMOIREJEWELSLLP Admin Handoff

## Access and roles

- `/login`: any email with password `demo123`; the chosen Admin or Staff role is stored in a signed, httpOnly session cookie.
- `/admin`: protected responsive admin shell with grouped navigation, global `Cmd/Ctrl+K` or `/` search, notifications, profile/logout, toasts, and storefront preview.
- Admin-only capabilities: Settings and Reports/export. Staff can operate the remaining day-to-day screens.

## Screen inventory

| Area | Route | Implemented behaviour | Demo boundary |
| --- | --- | --- | --- |
| Overview | `/admin` | One period selector recalculates KPIs, comparison deltas, charts, today chips, attention orders, craft pipeline, alerts, leaders, and activity. | Conversion and search analytics are seeded. |
| Overview | `/admin/activity` | Repository-backed merged order, review, subscriber, craft, and discount activity. | Activity is derived from current records rather than an audit-log service. |
| Sales | `/admin/orders` | Search/filter/pagination, CSV, archive view, accessible drawers, payment simulation, shipping/tracking, order print, invoice links, and mock email. | Tracking and email delivery are simulated. Orders cannot be deleted. |
| Sales | `/admin/invoices` | Auto-generated GST invoices, tax export, A4 print/PDF layout, mock email, refund, and linked credit-note tab. | PDF uses the browser print dialog; no mail/PDF service is connected. |
| Sales | `/admin/customers` | Search/tags/notes/history, archive tag, CSV, conflict-aware merge, and signed admin storefront-profile preview. | VAS is seeded status data. |
| Catalog | `/admin/products` | Shared catalogue, status/inventory controls, bulk CSV/archive/delete, and deep editor links. | Product photography starts from Unsplash demo assets. |
| Catalog | `/admin/products/new`, `/admin/products/[slug]` | Card/PDP live preview; typed details/SEO; collections, variants, pricing, cost, stock, IGI, eight media slots, local upload previews, primary/hover/OG controls, rich copy, SERP/social previews, draft/publish. | Local uploads are data URLs capped at 2 MB, not object-storage uploads; crop is represented by the square preview rather than a destructive crop service. |
| Catalog | `/admin/collections` | Counts/revenue, membership grid, rename/description, homepage visibility/order, and mega-menu feature selection. | Drag ordering is implemented with deterministic move controls for keyboard support. |
| Catalog | `/admin/inventory` | Stock-only view, low/out-of-stock alerts, steppers, filters, and CSV. | No supplier or purchase-order integration. |
| Marketing | `/admin/discounts` | Percentage/fixed/free-shipping codes, scope/caps/expiry, copy, repository persistence, server quote, checkout application, and usage increment. | Promotion payment is still a demo checkout. |
| Marketing | `/admin/newsletter` | Subscribers, unsubscribe/resubscribe, CSV, and deterministic voucher winner history. | No external email platform. |
| Marketing | `/admin/instagram` | Shared 8–12 item library, reorder/review state, handle, and homepage feed. | Instagram connection and moderation are simulated. |
| Marketing | `/admin/seo` | Page metadata/OG/schema/status, SERP/social previews, site defaults, structured-data source, sitemap/robots previews, safe redirects, analytics, score, vitals, and CSV. | Search terms, crawl data, and Web Vitals are seeded analytics. |
| Content | `/admin/faqs` | Add/edit/publish/reorder/delete with live FAQ and FAQ JSON-LD output. | Reorder uses accessible controls rather than freeform drag. |
| Content | `/admin/blog` | Draft/publish editor, safe rich content, delete, public journal, and admin-only noindex draft preview. | Cover crop is a 16:9 visual preview. |
| Content | `/admin/reviews` | Rating filters, replies, hide/restore, and live PDP/home review output. | Review verification is seeded. |
| Extras | `/admin/craft-tracker` | Four-stage pipeline, dates/expected dates, blocked notes, stage advance, and account tracker sync. | Carrier/manufacturing events are manual demo updates. |
| Extras | `/admin/quiz-builder` | Three editable questions/options, 3×3 outcome matrix, preview, and live/offline publishing. | Recommendations are deterministic repository rules. |
| Extras | `/admin/bookings` | Requests, status filters, calendar-style confirmation/no-show actions, and public submission. | No external calendar sync; confirmations are stored in SQLite. |
| Extras | `/admin/ar-try-on` | Shared PDP toggle/note plus simulation state. | Computer vision/AR recognition is not integrated. |
| System | `/admin/reports` | 7/30/90/YTD/custom periods, revenue/orders/AOV/GST/conversion/returns, product/collection/review/newsletter charts, and per-chart CSV. | Pagespeed, broken-image, conversion, and traffic values are demo analytics where no telemetry exists. |
| System | `/admin/settings` | Store, shipping zones/rates/threshold, payment mode, bank display, billing/HSN/GST, cities, AR, IGI, Instagram, JSON export, and typed reset confirmation. | IGI/Instagram/payment gateway connections are simulated. |

## Storefront sync proof points

- Active product, collection, inventory, rich copy, image, hover, review, and SEO changes are read from the same typed SQLite repository by PLPs/PDPs/navigation.
- Checkout re-quotes products and discounts server-side in one transaction and atomically updates customer, order, stock, craft, discount, and invoice records.
- With the mock gateway enabled, checkout creates a paid order and invoice. With it disabled, checkout creates a pending order without an invoice; admin payment creates the invoice and paid spend exactly once.
- New invoices snapshot store/billing/bank settings so later Settings edits do not rewrite historical documents.
- A signed browser access cookie limits account and invoice routes to that browser's orders; an authenticated admin can use the explicit customer preview.
- Settings drive the cart free-shipping threshold, checkout payment state/bank display, showroom cities, invoice defaults, AR, quiz publishing, and Instagram handle/feed.
- SEO records drive route metadata, Product/FAQ/Event/WebSite/Breadcrumb JSON-LD, redirects, `/sitemap.xml`, and `/robots.txt`; the admin source viewer reads the same rendering helpers.

## Production caveats

- The login is intentionally demo auth: shared password, user-selected role, and a development fallback signing secret. Set `GEMOIRE_SESSION_SECRET` and replace this flow before production.
- The SQLite file is local process storage. A persistent volume or managed database is required for multi-instance/serverless deployment.
- Payment capture, transactional email, carrier tracking, Instagram, IGI, AR, search telemetry, and calendar integration are safe mocks.
- Replace demo imagery, registration/contact/bank placeholders, and data-URL uploads before launch.
- Set `NEXT_PUBLIC_SITE_URL` to the production origin; the reserved `.example` address is only the local fallback for canonical, sitemap, robots, and JSON-LD URLs.
- Saved redirect rules resolve legacy or otherwise unmatched storefront paths. Replacing an already-defined App Router route requires a deployment-level redirect or middleware rule.

## Verification status

- `npm.cmd run test:domain`: passes 9/9 repository, route, auth, checkout/payment, redirect, and storefront contract checks.
- Supplemental local TypeScript syntax and strict semantic audit: 119 TS/TSX files, zero diagnostics.
- The mandated project `npm.cmd run typecheck`, `npm.cmd run build`, and localhost HTTP probes cannot complete in this checkout because `node_modules`, `tsc`, `next`, and a running server are absent. No dependency install was retried after environment approval rejected it.
- No browser/desktop GUI automation was attempted, per `AGENTS.md`.
- This folder has no `.git` metadata, so branch/status/diff verification is unavailable.
