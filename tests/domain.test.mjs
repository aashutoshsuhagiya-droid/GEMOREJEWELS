import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import Database from "better-sqlite3";
import { diamondShapes, metalOptions, parseMetal, parseShape, productHref, productPrice } from "../src/lib/product-options.ts";
import { sqliteDatabasePath } from "../src/lib/sqlite-storage.ts";
import { DEFAULT_CURRENCY, STATIC_USD_RATES, STATIC_RATES_UPDATED_AT, currencyAmount, currencyOptions, currencySymbol, formatCurrencyAmount, isCurrencyCode } from "../src/lib/currency.ts";
import { inferJewelryType, isJewelryType, migrateProductJewelryTypes } from "../src/lib/jewelry-type.ts";

const root = resolve(import.meta.dirname, "..");
const read = (relativePath) => readFileSync(resolve(root, relativePath), "utf8");

const repository = read("src/lib/admin-repository.ts");
const types = read("src/shared/admin-types.ts");
const storefrontCss = read("src/app/storefront.css");
const header = read("src/components/layout/header.tsx");
const currencyStore = read("src/components/commerce/currency-store.tsx");
const currencySelector = read("src/components/layout/currency-selector.tsx");
const fxRateStore = read("src/lib/fx-rate-store.ts");

test("jewelry types follow the legacy name rules and accept only the five saved values", () => {
  for (const [name, type] of [
    ["Mira Diamond Hoops", "earring"], ["Mira Golden Hoop", "earring"], ["Mira Diamond Drop", "earring"],
    ["Mira Pendant Light", "necklace"], ["Mira Open Band", "bracelet"], ["Diamond Cuff", "bracelet"],
    ["Gold Bangle", "bracelet"], ["Aaria Classic Solitaire", "ring"], ["Mira Diamond Band", "ring"],
  ]) {
    assert.equal(inferJewelryType(name), type);
    assert.equal(inferJewelryType(name.toLowerCase()), type);
  }
  for (const type of ["ring", "earring", "bracelet", "necklace", "loose-stone"]) assert.equal(isJewelryType(type), true);
  for (const type of [undefined, null, "earrings", "Ring", "invalid"]) assert.equal(isJewelryType(type), false);
});

test("jewelry type backfill preserves saved types, pricing, timestamps and existing migration markers across restarts", () => {
  const fixture = mkdtempSync(join(tmpdir(), "gemoire-jewelry-type-test-"));
  const filename = join(fixture, "migration.db");
  let db = new Database(filename);
  try {
    db.exec("CREATE TABLE entity_store (kind TEXT, id TEXT, json TEXT, updated_at TEXT, PRIMARY KEY(kind,id)); CREATE TABLE meta_store (key TEXT PRIMARY KEY, json TEXT, updated_at TEXT);");
    db.prepare("INSERT INTO meta_store VALUES (?, ?, ?)").run("currency-base-usd-v1", "{}", "2026-01-01");
    const originals = [
      { id: "legacy", name: "Mira Golden Hoop", priceUsd: 1250, priceAud: 1900, stock: 4, baseCurrency: "USD" },
      { id: "admin-choice", name: "Mira Golden Hoop", jewelryType: "necklace", priceUsd: 1400, status: "draft" },
      { id: "explicit-ring", name: "Mira Open Band", jewelryType: "ring", priceUsd: 1900 },
    ];
    for (const value of originals) db.prepare("INSERT INTO entity_store VALUES (?, ?, ?, ?)").run("products", value.id, JSON.stringify(value), "2026-02-01");
    db.prepare("INSERT INTO entity_store VALUES (?, ?, ?, ?)").run("orders", "untouched", '{"name":"Pendant"}', "2026-03-01");
    migrateProductJewelryTypes(db);
    const row = id => db.prepare("SELECT * FROM entity_store WHERE kind='products' AND id=?").get(id);
    assert.deepEqual(JSON.parse(row("legacy").json), { ...originals[0], jewelryType: "earring" });
    for (const original of originals.slice(1)) assert.equal(row(original.id).json, JSON.stringify(original));
    for (const original of originals) assert.equal(row(original.id).updated_at, "2026-02-01");
    assert.equal(db.prepare("SELECT json FROM entity_store WHERE kind='orders'").get().json, '{"name":"Pendant"}');
    assert.equal(db.prepare("SELECT updated_at FROM meta_store WHERE key='currency-base-usd-v1'").get().updated_at, "2026-01-01");
    db.prepare("UPDATE entity_store SET json=? WHERE id='legacy'").run(JSON.stringify({ ...originals[0], name: "Pendant renamed", jewelryType: "loose-stone" }));
    db.close();
    db = new Database(filename);
    migrateProductJewelryTypes(db);
    assert.equal(JSON.parse(row("legacy").json).jewelryType, "loose-stone");
    assert.equal(db.prepare("SELECT total_changes() AS count").get().count, 0, "completed migration must perform no writes");
  } finally {
    db.close();
    rmSync(fixture, { recursive: true, force: true });
  }
});

test("jewelry type backfill rolls back all changes if a legacy record cannot be read", () => {
  const db = new Database(":memory:");
  try {
    db.exec("CREATE TABLE entity_store (kind TEXT, id TEXT, json TEXT, updated_at TEXT, PRIMARY KEY(kind,id)); CREATE TABLE meta_store (key TEXT PRIMARY KEY, json TEXT, updated_at TEXT);");
    const original = '{"name":"Golden Hoop"}';
    db.prepare("INSERT INTO entity_store VALUES ('products', ?, ?, 'unchanged')").run("a", original);
    db.prepare("INSERT INTO entity_store VALUES ('products', ?, ?, 'unchanged')").run("z", "invalid JSON");
    assert.throws(() => migrateProductJewelryTypes(db));
    assert.equal(db.prepare("SELECT json FROM entity_store WHERE id='a'").get().json, original);
    assert.equal(db.prepare("SELECT count(*) AS count FROM meta_store").get().count, 0);
  } finally {
    db.close();
  }
});

test("currency registry covers and formats all 92 requested currencies from USD rates", () => {
  const expectedCodes = "AED AFN AMD ANG AUD AWG AZN BBD BDT BIF BND BOB BSD BWP BZD CAD CDF CNY CRC CVE DJF DKK DOP DZD EGP ETB EUR FJD FKP GBP GMD GNF GTQ GYD HKD HNL IDR ILS JMD JPY KES KGS KHR KMF KRW KYD KZT LAK LBP LKR MAD MMK MNT MOP MUR MVR MWK MYR NGN NIO NPR NZD PEN PGK PHP PKR PYG QAR RWF SBD SGD SHP SLL STD THB TJS TOP TTD TWD TZS UGX USD UYU UZS VND VUV WST XAF XCD XOF XPF YER".split(" ");
  assert.equal(currencyOptions.length, 92);
  assert.equal(new Set(currencyOptions.map(option => option.code)).size, 92);
  assert.deepEqual(currencyOptions.map(option => option.code), expectedCodes);
  assert.deepEqual(Object.keys(STATIC_USD_RATES).sort(), [...expectedCodes].sort());
  assert.equal(DEFAULT_CURRENCY, "USD");
  assert.equal(STATIC_USD_RATES.USD, 1);
  for (const code of expectedCodes) assert.ok(STATIC_USD_RATES[code] > 0, `${code} needs a positive fallback rate`);

  const sampleRates = { ...STATIC_USD_RATES, USD: 1, AUD: 1.55, JPY: 155.25 };
  assert.equal(currencyAmount(100, "USD", sampleRates), 100);
  assert.equal(currencyAmount(100, "AUD", sampleRates), 155);
  assert.equal(currencyAmount(100, "JPY", sampleRates), 15525);
  for (const code of ["AUD", "USD", "JPY", "CNY", "AED", "EUR", "GBP", "BDT", "XOF", "VND"]) {
    const option = currencyOptions.find(item => item.code === code);
    assert.ok(option);
    const converted = currencyAmount(1234, code, sampleRates);
    assert.equal(formatCurrencyAmount(1234, code, sampleRates), new Intl.NumberFormat(option.locale, { style: "currency", currency: code }).format(converted));
    assert.ok(currencySymbol(code).length > 0);
  }
  assert.equal(isCurrencyCode("EUR"), true);
  assert.equal(isCurrencyCode("CHF"), false);
});

test("currency choice is searchable, persistent, responsive, and next to the call link", () => {
  assert.match(header, /<HeaderPhone\/><CurrencySelector\/>/, "desktop currency control must sit beside the phone link");
  assert.match(header, /<CurrencySelector mobile\/>/, "mobile navigation must retain currency selection");
  assert.match(currencySelector, /placeholder="Search"/);
  assert.match(currencySelector, /role="listbox"/);
  assert.match(currencySelector, /event\.key !== "Escape"/);
  assert.match(currencySelector, /event\.key === "ArrowDown"/);
  assert.match(currencySelector, /event\.key === "Home"/);
  assert.match(currencySelector, /currencySymbol/, "search must include symbols resolved by Intl");
  assert.match(currencyStore, /gemoire_currency/, "the selection must persist between visits");
  assert.match(currencyStore, /fetch\("\/api\/currency\/rates"\)/, "rates must load once through the shared store");
  assert.match(currencyStore, /sessionRatesRequest \?\?=/, "client requests must be cached for the session");
  assert.match(currencyStore, /formatCurrencyAmount/, "all consumers must share one formatter");
  assert.match(storefrontCss, /\.currency-popover \{[^}]*position: absolute/s, "desktop selector must use an anchored popover");
  assert.match(storefrontCss, /\.mobile-menu \.currency-popover \{[^}]*bottom: calc\(100% \+ 9px\)[^}]*position: absolute/s, "mobile selector must overlay without shifting the menu");
});

test("FX route provides live caching and a never-empty SQLite/static fallback chain", () => {
  const route = read("src/app/api/currency/rates/route.ts");
  assert.match(route, /FX_RATES_API_KEY/);
  assert.match(route, /openexchangerates\.org\/api\/latest\.json/);
  assert.match(route, /15 \* 60 \* 1000/, "upstream cache must not exceed 15 minutes");
  assert.match(route, /return \[code, Number\.isFinite\(providerRate\)/, "provider USD-base rates must be used directly");
  assert.match(route, /persistFxRates\(derived, updatedAt\)/);
  assert.match(route, /readPersistedFxRates\(\)/);
  assert.match(route, /STATIC_USD_RATES/);
  assert.match(route, /base: "USD"/);
  assert.match(route, /source: "fallback"/);
});

test("FX snapshots persist in the existing SQLite database contract", () => {
  const fixture = mkdtempSync(join(tmpdir(), "gemoire-fx-test-"));
  const filename = join(fixture, "gemoire-admin.db");
  let db;
  try {
    const rates = { AUD: 1.55, USD: 1, JPY: 155.25 };
    db = new Database(filename);
    db.exec("CREATE TABLE fx_rates_usd (code TEXT PRIMARY KEY, rate REAL NOT NULL, updated_at TEXT NOT NULL)");
    const insert = db.prepare("INSERT INTO fx_rates_usd (code, rate, updated_at) VALUES (?, ?, ?)");
    db.transaction(() => Object.entries(rates).forEach(([code, rate]) => insert.run(code, rate, STATIC_RATES_UPDATED_AT)))();
    assert.deepEqual(db.prepare("SELECT code, rate, updated_at FROM fx_rates_usd ORDER BY code").all(), [
      { code: "AUD", rate: 1.55, updated_at: STATIC_RATES_UPDATED_AT },
      { code: "JPY", rate: 155.25, updated_at: STATIC_RATES_UPDATED_AT },
      { code: "USD", rate: 1, updated_at: STATIC_RATES_UPDATED_AT },
    ]);
    assert.match(fxRateStore, /sqliteDatabasePath\(\)/, "FX snapshots must share the existing database path");
    assert.match(fxRateStore, /CREATE TABLE IF NOT EXISTS fx_rates_usd/);
    assert.match(fxRateStore, /ON CONFLICT\(code\) DO UPDATE/);
    assert.match(fxRateStore, /DELETE FROM fx_rates_usd/);
  } finally {
    db?.close();
    rmSync(fixture, { recursive: true, force: true });
  }
});

test("every public price surface derives display values from canonical USD", () => {
  const publicPriceFiles = [
    "src/components/commerce/product-card.tsx",
    "src/components/commerce/product-detail.tsx",
    "src/components/commerce/cart-drawer.tsx",
    "src/components/commerce/cart-store.tsx",
    "src/app/cart/page.tsx",
    "src/app/checkout/page.tsx",
    "src/app/account/page.tsx",
    "src/app/invoice/[number]/page.tsx",
    "src/components/layout/header.tsx",
    "src/components/marketing/newsletter-band.tsx",
  ];
  for (const filename of publicPriceFiles) {
    const source = read(filename);
    assert.doesNotMatch(source, /usdFromAud|subtotalAud|adjustedAud|discountAud/, `${filename} still uses a parallel AUD conversion path`);
  }
  const invoice = read("src/app/invoice/[number]/page.tsx");
  assert.match(invoice, /CurrencyAmount usd=\{invoice\.totalUsd\}/);
  assert.doesNotMatch(invoice, /AUD \$|USD \$/);
  assert.match(read("src/components/commerce/cart-store.tsx"), /usdPrice/);
});

test("admin pricing, reporting, settings, and stored records are USD based", () => {
  const usdAdminFiles = [
    "src/app/admin/page.tsx",
    "src/app/admin/activity/page.tsx",
    "src/components/admin/orders.tsx",
    "src/components/admin/invoices.tsx",
    "src/components/admin/customers.tsx",
    "src/components/admin/reports.tsx",
    "src/components/admin/connected-reports.tsx",
    "src/components/admin/connected-admin-screens.tsx",
    "src/components/admin/live-settings-screen.tsx",
    "src/components/admin/repository-catalog-extras.tsx",
    "src/components/admin/repository-discounts-screen.tsx",
  ];
  for (const filename of usdAdminFiles) {
    const source = read(filename);
    assert.doesNotMatch(source, /formatAdminAud|\bTotal AUD\b|\bRevenue AUD\b|\bGST AUD\b|\bAUD value\b|\(AUD\)/, `${filename} still exposes AUD as the admin base`);
  }
  assert.match(read("src/components/admin/connected-product-editor.tsx"), /Price USD \*/);
  assert.doesNotMatch(read("src/components/admin/connected-product-editor.tsx"), /Price AUD/);
  assert.match(repository, /currency-base-usd-v1/, "existing SQLite records need a one-time USD migration");
  assert.match(repository, /baseCurrency: "USD"/, "new admin records must declare USD as their base");
  assert.match(repository, /currencyPair: "USD \+ local currencies"/);
  assert.match(types, /baseCurrency\?: "USD"/);
});

test("header exposes the requested click-to-call number", () => {
  assert.match(header, /href="tel:\+918849760876"/, "the phone number must use a direct telephone link");
  assert.match(header, /Contact Us/, "visitors must see the contact label");
  assert.match(header, /\+91 884 976 0876/, "the requested formatted phone number must be visible");
  assert.match(storefrontCss, /\.header-inner > \.header-contact \{ grid-column: 1; grid-row: 1; \}/, "the call link must stay on the left side of the header");
  assert.match(header, /<HeaderPhone compact\/>/, "mobile visitors must retain a compact call action");
});

test("storefront responsive rules cover tablet, mobile, and narrow phones", () => {
  assert.match(storefrontCss, /html, body \{ max-width: 100%; overflow-x: clip; \}/, "the page must prevent accidental horizontal overflow");
  assert.match(storefrontCss, /@media \(max-width: 900px\)/, "tablet layouts need a dedicated collapse breakpoint");
  assert.match(storefrontCss, /\.ready-grid, \.showroom-grid, \.newsletter-grid, \.showroom-page-grid \{ grid-template-columns: minmax\(0, 1fr\); \}/, "two-column marketing layouts must stack before phone widths");
  assert.match(storefrontCss, /\.product-grid, \.skeletons \{ grid-template-columns: repeat\(2, minmax\(0, 1fr\)\); \}/, "catalogues must use a stable two-column mobile grid");
  assert.match(storefrontCss, /\.spec-quick \{[^}]*grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/s, "product specifications must wrap without horizontal scrolling");
  assert.match(storefrontCss, /@media \(max-width: 480px\)/, "small phones need compact controls and single-column footer rules");
  assert.match(storefrontCss, /\.campaign-hero-copy \.button \{ width: 100%; \}/, "campaign actions must remain tappable on narrow screens");
  assert.match(storefrontCss, /env\(safe-area-inset-bottom\)/, "fixed mobile surfaces must respect device safe areas");
  assert.match(storefrontCss, /@media \(prefers-reduced-motion: reduce\)/, "responsive polish must preserve reduced-motion behavior");
});

test("SQLite keeps the existing persistent local path outside Vercel", () => {
  const workingDirectory = resolve("storage-fixture");
  const expected = join(workingDirectory, "data", "gemoire-admin.db");
  assert.equal(sqliteDatabasePath({}, workingDirectory), expected);
  assert.equal(sqliteDatabasePath({ NODE_ENV: "production" }, workingDirectory), expected);
  assert.equal(sqliteDatabasePath({ VERCEL: "0" }, workingDirectory), expected);
});

test("Vercel SQLite uses temporary storage instead of the read-only application", () => {
  const workingDirectory = resolve("application-fixture");
  const temporaryDirectory = resolve("temporary-fixture");
  const expected = join(temporaryDirectory, "gemoire-jewels", "gemoire-admin.db");
  assert.equal(sqliteDatabasePath({ VERCEL: "1" }, workingDirectory, temporaryDirectory), expected);
  assert.equal(sqliteDatabasePath({ VERCEL: "1", GEMOIRE_DATA_DIR: "  " }, workingDirectory, temporaryDirectory), expected);
  assert.match(repository, /const filename = sqliteDatabasePath\(\)/);
  assert.match(repository, /new Database\(filename\)/);
  assert.doesNotMatch(repository, /path\.join\(process\.cwd\(\), "data"\)/);
});

test("SQLite supports an explicit persistent data directory", () => {
  const workingDirectory = resolve("application-fixture");
  const persistentDirectory = resolve("persistent-fixture");
  assert.equal(
    sqliteDatabasePath({ GEMOIRE_DATA_DIR: `  ${persistentDirectory}  ` }, workingDirectory),
    join(persistentDirectory, "gemoire-admin.db")
  );
  assert.equal(
    sqliteDatabasePath({ GEMOIRE_DATA_DIR: "custom-data" }, workingDirectory),
    join(workingDirectory, "custom-data", "gemoire-admin.db")
  );
});

for (const vercel of [false, true]) {
  test(`SQLite ${vercel ? "Vercel" : "local"} storage preserves committed rows and transaction rollback`, () => {
    const fixture = mkdtempSync(join(tmpdir(), "gemoire-sqlite-test-"));
    let database;
    try {
      const workingDirectory = join(fixture, "application");
      const temporaryDirectory = join(fixture, "temporary");
      mkdirSync(workingDirectory, { recursive: true });
      if (vercel) writeFileSync(join(workingDirectory, "data"), "Application data directory must not be written.");
      const filename = sqliteDatabasePath(vercel ? { VERCEL: "1" } : {}, workingDirectory, temporaryDirectory);
      mkdirSync(dirname(filename), { recursive: true });
      database = new Database(filename);
      database.pragma("journal_mode = WAL");
      database.exec("CREATE TABLE records (id TEXT PRIMARY KEY, value TEXT NOT NULL)");
      const insert = database.prepare("INSERT INTO records (id, value) VALUES (?, ?)");
      database.transaction(() => insert.run("saved", "Persisted value"))();
      assert.throws(database.transaction(() => {
        insert.run("rolled-back", "Must not persist");
        throw new Error("Abort transaction");
      }), /Abort transaction/);
      database.close();
      database = new Database(filename);
      assert.deepEqual(database.prepare("SELECT id, value FROM records").all(), [{ id: "saved", value: "Persisted value" }]);
      if (vercel) assert.equal(readFileSync(join(workingDirectory, "data"), "utf8"), "Application data directory must not be written.");
    } finally {
      database?.close();
      rmSync(fixture, { recursive: true, force: true });
    }
  });
}

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

test("metal and diamond price changes preserve the USD configurator quote", () => {
  const product = { usdPrice: 2269 };
  assert.equal(productPrice(product, "18ct Yellow Gold", "1.20ct"), 2269);
  assert.equal(productPrice(product, "18ct White Gold", "1.20ct"), 2269);
  assert.equal(productPrice(product, "18ct Rose Gold", "1.20ct"), 2328);
  assert.equal(productPrice(product, "Platinum", "1.20ct"), 2451);
  assert.equal(productPrice(product, "Platinum", "2.00ct"), 3264);
  assert.equal(product.usdPrice, 2269);
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
    "api/currency/rates/route.ts",
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
