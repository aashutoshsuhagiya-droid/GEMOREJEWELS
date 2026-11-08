import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { diamondShapes, metalOptions, parseMetal, parseShape, productHref, productPrice } from "../src/lib/product-options.ts";

const root = resolve(import.meta.dirname, "..");
const read = (relativePath) => readFileSync(resolve(root, relativePath), "utf8");

const repository = read("src/lib/admin-repository.ts");
const types = read("src/shared/admin-types.ts");

test("metal selections survive card-to-product navigation and reject unknown query values", () => {
  for (const { name } of metalOptions) {
    const url = new URL(productHref("aaria-classic", name), "http://localhost:3000");
    assert.equal(url.pathname, "/products/aaria-classic");
    assert.equal(parseMetal(url.searchParams.get("metal")), name);
    assert.equal(parseMetal([name, "invalid"]), name);
  }
  assert.equal(parseMetal("Silver"), undefined);
  assert.equal(parseMetal(undefined), undefined);
  assert.equal(parseMetal(["invalid", "Platinum"]), undefined);
});

test("metal and diamond price changes preserve the existing configurator quote", () => {
  const product = { audPrice: 3490 };
  assert.equal(productPrice(product, "18ct Yellow Gold", "1.20ct"), 3490);
  assert.equal(productPrice(product, "18ct White Gold", "1.20ct"), 3490);
  assert.equal(productPrice(product, "18ct Rose Gold", "1.20ct"), 3580);
  assert.equal(productPrice(product, "Platinum", "1.20ct"), 3770);
  assert.equal(productPrice(product, "Platinum", "2.00ct"), 5020);
  assert.equal(product.audPrice, 3490);
});

test("shape links accept all nine silhouettes and safely normalize URL filters", () => {
  assert.equal(new Set(diamondShapes).size, 9);
  for (const shape of diamondShapes) assert.equal(parseShape(shape.toLowerCase()), shape);
  assert.equal(parseShape(["Oval", "Pear"]), "Oval");
  assert.equal(parseShape(undefined), undefined);
  assert.equal(parseShape("<script>"), undefined);
});

test("demo seed fulfils the catalogue and operational data contract", () => {
  const designsSource = repository.match(/const designs = \[(.*?)\];/s)?.[1] ?? "";
  const designCount = [...designsSource.matchAll(/"[^"]+"/g)].length;

  assert.equal(designCount, 40, "expected 40 seeded products");
  assert.match(repository, /Array\.from\(\{ length: 80 \}/, "expected 80 customers");
  assert.match(repository, /Array\.from\(\{ length: 60 \}/, "expected 60 orders or subscribers");
  assert.match(repository, /Array\.from\(\{ length: 12 \}/, "expected 12 reviews");
  assert.match(repository, /const faqs: Faq\[\] = \[/, "expected FAQ seed");
  assert.match(repository, /const blog: BlogPost\[\] = \[/, "expected blog seed");
  assert.match(repository, /const bookings: Booking\[\] = \[/, "expected booking seed");
  assert.match(repository, /synchronizeAllProductReviewSummaries/, "product ratings must be derived from published reviews");
});

test("shared types define the single admin and storefront model", () => {
  for (const model of [
    "AdminProduct",
    "Order",
    "Invoice",
    "CreditNote",
    "Customer",
    "Discount",
    "Review",
    "Faq",
    "BlogPost",
    "Subscriber",
    "Booking",
    "CraftStage",
    "QuizQuestion",
    "QuizOutcome",
    "SeoPage",
    "SeoSite",
    "RedirectRule",
    "StoreSettings",
  ]) {
    assert.match(types, new RegExp(`export (?:type|interface) ${model}\\b`), `${model} is missing`);
  }
});

test("checkout is server-quoted and atomically creates its dependent records", () => {
  assert.match(repository, /database\(\)\.transaction/, "checkout must use a SQLite transaction");
  assert.match(repository, /discountForSelections/, "checkout must validate discounts in the repository");
  assert.match(repository, /createStorefrontOrder/, "storefront order creation is missing");
  assert.match(repository, /put\(db, "orders", order\)/, "order persistence is missing");
  assert.match(repository, /put\(db, "invoices", invoice\)/, "invoice persistence is missing");
  assert.match(repository, /put\(db, "craft",/, "craft persistence is missing");
});

test("store payment state controls invoice creation and pending-order messaging", () => {
  const checkout = read("src/app/checkout/page.tsx");
  const settingsRoute = read("src/app/api/storefront/settings/route.ts");

  assert.match(repository, /const paymentCaptured = settings\.paymentEnabled/, "checkout must read the live payment toggle");
  assert.match(repository, /paymentStatus: paymentCaptured \? "Paid" : "Pending"/, "disabled payments must create pending orders");
  assert.match(repository, /if \(invoice\) put\(db, "invoices", invoice\)/, "pending orders must not persist an invoice");
  assert.match(repository, /billingSnapshot: invoiceBillingSnapshot\(settings\)/, "new invoices must snapshot billing settings");
  assert.match(repository, /const gstAmount = order\.gstAmount/, "payment confirmation must preserve the accepted tax quote");
  assert.match(repository, /paymentWasCaptured && existingInvoice/, "paid orders with missing invoices must remain repairable");
  assert.match(repository, /!paymentWasCaptured && customer/, "customer spend must only advance when payment is first captured");
  assert.match(repository, /order\.paymentStatus !== "Pending"/, "seeded pending orders must not count as captured customer spend");
  assert.match(repository, /const splitGst = appliedSnapshot\.splitGst/, "repaired invoices must use their snapshotted tax split");
  assert.match(settingsRoute, /paymentEnabled: settings\.paymentEnabled/, "storefront settings must expose the payment state");
  assert.match(checkout, /awaiting manual payment confirmation/, "checkout must explain pending payment state");
  assert.match(types, /billingSnapshot\?: InvoiceBillingSnapshot/, "invoice snapshot type is missing");
});

test("all requested admin destinations are implemented as App Router pages", () => {
  const pages = [
    "admin/page.tsx",
    "admin/activity/page.tsx",
    "admin/orders/page.tsx",
    "admin/invoices/page.tsx",
    "admin/customers/page.tsx",
    "admin/products/page.tsx",
    "admin/products/new/page.tsx",
    "admin/collections/page.tsx",
    "admin/inventory/page.tsx",
    "admin/discounts/page.tsx",
    "admin/newsletter/page.tsx",
    "admin/instagram/page.tsx",
    "admin/seo/page.tsx",
    "admin/faqs/page.tsx",
    "admin/blog/page.tsx",
    "admin/reviews/page.tsx",
    "admin/craft-tracker/page.tsx",
    "admin/quiz-builder/page.tsx",
    "admin/bookings/page.tsx",
    "admin/ar-try-on/page.tsx",
    "admin/reports/page.tsx",
    "admin/settings/page.tsx",
  ];

  for (const page of pages) {
    assert.equal(existsSync(resolve(root, "src/app", page)), true, `${page} is missing`);
  }
});

test("storefront integration routes cover checkout, navigation, settings and content", () => {
  const routes = [
    "api/catalog/route.ts",
    "api/checkout/route.ts",
    "api/discounts/validate/route.ts",
    "api/storefront/bookings/route.ts",
    "api/storefront/latest-invoice/route.ts",
    "api/storefront/navigation/route.ts",
    "api/storefront/newsletter/route.ts",
    "api/storefront/quiz/route.ts",
    "api/storefront/settings/route.ts",
    "api/test-redirect/route.ts",
    "sitemap.ts",
    "robots.ts",
  ];

  for (const route of routes) {
    assert.equal(existsSync(resolve(root, "src/app", route)), true, `${route} is missing`);
  }

  const siteConfig = read("src/shared/site-config.ts");
  const structuredData = read("src/components/seo/storefront-structured-data.tsx");
  const productDetail = read("src/components/commerce/product-detail.tsx");
  const adminSidebar = read("src/components/admin/sidebar.tsx");
  const adminTopbar = read("src/components/admin/topbar.tsx");
  assert.match(siteConfig, /NEXT_PUBLIC_SITE_URL/, "canonical routes need a production-configurable origin");
  assert.match(structuredData, /jsonLdForPath/, "public routes need repository-backed structured data");
  assert.match(productDetail, /useDialogFocus\(arPanelRef/, "the AR dialog must trap and restore focus");
  assert.match(productDetail, /aria-controls="pdp-ar-dialog"/, "the AR trigger must expose its dialog relationship");
  assert.match(adminSidebar, /useDialogFocus\(panelRef, onClose, open\)/, "mobile navigation must trap and restore focus");
  assert.match(adminTopbar, /aria-expanded=\{menuOpen\}/, "mobile navigation must expose open state");
  assert.equal(existsSync(resolve(root, "src/app/api/admin/seo-source/route.ts")), true, "rendered SEO source route is missing");
});

test("saved SEO redirects resolve on real storefront paths", () => {
  const rootCatchAlls = readdirSync(resolve(root, "src/app"), { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && /^\[\.\.\.[^\]]+\]$/.test(entry.name));
  assert.equal(rootCatchAlls.length, 1, "only one root catch-all route may exist");
  const redirectPage = read("src/app/[...legacy]/page.tsx");
  assert.match(redirectPage, /adminRepository\.resolveRedirect\(source\)/);
  assert.match(redirectPage, /permanentRedirect\(rule\.to\)/);
  assert.match(redirectPage, /redirect\(rule\.to\)/);
  assert.match(redirectPage, /notFound\(\)/);
});

test("payment, shipping and refund mutations keep linked records in sync", () => {
  const adminRoute = read("src/app/api/admin/[resource]/route.ts");
  assert.match(repository, /markOrderPaid/, "paid-order mutation is missing");
  assert.match(repository, /markShipped/, "shipping mutation is missing");
  assert.match(repository, /refundInvoice/, "refund mutation is missing");
  assert.match(repository, /creditNoteId/, "invoice-credit-note linkage is missing");
  assert.match(repository, /trackingCode/, "shipment tracking generation is missing");
  assert.match(repository, /Only a cancelled order can be refunded/, "repository must enforce the refund eligibility rule");
  assert.match(adminRoute, /Use the payment or refund action/, "generic order writes must not bypass invoice invariants");
});

test("authentication uses a protected httpOnly session cookie", () => {
  const authRoute = read("src/app/api/auth/login/route.ts");
  const middleware = read("middleware.ts");

  assert.match(authRoute, /demo123/);
  assert.match(authRoute, /httpOnly:\s*true/);
  assert.match(middleware, /\/admin/);
  assert.match(middleware, /login/);
});
