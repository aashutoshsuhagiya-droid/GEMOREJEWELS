import "server-only";

import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import type {
  AdminProduct, Booking, Collection, CraftStage, CreditNote, Customer, Discount, EntityMap, EntityName, Faq, InstagramItem,
  Invoice, InvoiceBillingSnapshot, Order, OrderStatus, PaymentStatus, QuizOutcome, QuizQuestion, RedirectRule, Review, SeoAnalytics, SeoPage, SeoSite,
  StoreSettings, Subscriber, BlogPost
} from "@/shared/admin-types";
import { siteUrl } from "@/shared/site-config";
import { sqliteDatabasePath } from "@/lib/sqlite-storage";

type Sqlite = Database.Database;
declare global { var __gemoireDb: Sqlite | undefined; }

const imagePool = [
  "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?auto=format&fit=crop&w=1200&q=85"
];
const firstNames = ["Maya", "Elliot", "Priya", "Olivia", "Amir", "Sofia", "Arjun", "Zoe", "Noah", "Isla"];
const lastNames = ["Rao", "Bennett", "Patel", "Nguyen", "Morgan", "Kim", "Wilson", "Singh"];
const settingsSeed: StoreSettings = {
  id: "settings", storeName: "GEMOIREJEWELSLLP", currencyPair: "AUD + USD", locale: "en-AU", timezone: "Australia/Sydney", freeShippingThreshold: 40,
  shippingZones: [
    { id: "australia", name: "Australia", rates: [{ id: "express", name: "Express", cost: 0, minDays: 1, maxDays: 3 }, { id: "standard", name: "Standard", cost: 15, minDays: 3, maxDays: 7 }] },
    { id: "international", name: "International", rates: [{ id: "express", name: "Express", cost: 65, minDays: 4, maxDays: 8 }, { id: "standard", name: "Standard", cost: 35, minDays: 8, maxDays: 14 }] }
  ],
  paymentEnabled: true,
  bankDetails: { accountName: "GEMOIREJEWELSLLP", bankName: "GEMOIRE Demo Bank", accountNumber: "0000 2026 0041", bic: "GEMOAU2S" },
  cities: ["Los Angeles", "Houston", "San Diego", "Austin", "San Francisco"], arEnabled: true, arNote: "AR try-on is coming to the GEMOIREJEWELSLLP app.",
  quizPublished: true, instagramHandle: "@GEMOIREJEWELSLLP",
  instagramConnected: false,
  igi: { issuer: "International Gemological Institute", certificateUrl: "https://www.igi.org/verify-your-report" },
  billing: { prefix: "INV-GM-", gstin: "06ABCDE1234F1Z5", cin: "U74999MH2026PLC000001", gstRate: 18, splitGst: true, ringHsn: "7113", earringHsn: "7113", braceletHsn: "7113", autoEmail: true, footer: "Crafting begins on the date shared in your tracker." }
};
function invoiceBillingSnapshot(settings: StoreSettings): InvoiceBillingSnapshot {
  return {
    storeName: settings.storeName,
    gstin: settings.billing.gstin,
    cin: settings.billing.cin,
    gstRate: settings.billing.gstRate,
    splitGst: settings.billing.splitGst,
    footer: settings.billing.footer,
    bankDetails: { ...settings.bankDetails }
  };
}
const seoSiteSeed: SeoSite = { id: "site", titleTemplate: "{page} · GEMOIREJEWELSLLP", defaultOg: { image: imagePool[0], siteName: "GEMOIREJEWELSLLP", description: "Lab-grown diamond jewellery, considered for a lifetime." }, structuredData: { product: true, faq: true, breadcrumbs: true }, lastGenerated: new Date().toISOString() };
const seoAnalyticsSeed: SeoAnalytics = { id: "analytics", topTerms: [{ term: "lab grown oval ring", clicks: 1240, ctr: 6.4, position: 2.1, trend: "up" }, { term: "engagement rings australia", clicks: 827, ctr: 4.9, position: 4.8, trend: "up" }, { term: "three stone diamond ring", clicks: 412, ctr: 3.7, position: 7.2, trend: "down" }], landingPages: [{ page: "/collections/engagement", clicks: 1980, impressions: 18500 }, { page: "/", clicks: 1440, impressions: 11200 }, { page: "/collections/wedding", clicks: 710, impressions: 7600 }], vitals: { LCP: 2.1, CLS: 0.03, INP: 148 }, orphanedPages: 2, notFoundClicks: 7 };

function isoDaysAgo(days: number) { const date = new Date(); date.setDate(date.getDate() - days); return date.toISOString(); }
function slugify(text: string) { return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""); }
function makeProducts(): AdminProduct[] {
  const designs = ["Aaria Classic Solitaire", "Aaria East-West Oval", "Aaria Bezel Light", "Aaria Pear Poise", "Aaria Emerald Line", "Aaria Marquise Arc", "Aaria Cushion Frame", "Aaria Radiant Still", "Kavya Halo Bloom", "Kavya Round Halo", "Kavya Pear Halo", "Kavya Cushion Glow", "Kavya Emerald Halo", "Kavya Radiant Bloom", "Kavya Secret Halo", "Kavya Toi Et Moi", "Mira Three-Stone", "Mira Oval Trilogy", "Mira Emerald Trio", "Mira Pear Trilogy", "Mira Diamond Band", "Mira Soft Curve", "Mira Diamond Hoops", "Mira Pendant Light", "Aaria Floating Marquise", "Aaria Oval Crest", "Kavya Starlight Halo", "Kavya Double Halo", "Mira Open Band", "Mira Pavé Curve", "Aaria Cathedral Oval", "Aaria North Star", "Kavya Petal Halo", "Kavya Elongated Cushion", "Mira Petite Trilogy", "Mira Golden Hoop", "Aaria Compass Set", "Kavya Heart Halo", "Mira Brilliance Band", "Mira Diamond Drop"];
  const shapes = ["Round", "Oval", "Emerald", "Pear", "Cushion", "Marquise", "Radiant"];
  const settings = ["Solitaire", "Halo", "Bezel", "Three-Stone", "Toi et Moi", "East-West"];
  return designs.map((name, index) => {
    const collection = name.startsWith("Aaria") ? "aaria" : name.startsWith("Kavya") ? "kavya" : "mira";
    const priceAud = 2690 + index * 115;
    const image = imagePool[index % imagePool.length];
    const description = "A considered balance of lab-grown diamond and precious metal, made for a lifetime of ordinary and extraordinary moments.";
    return { id: `prod-${String(index + 1).padStart(3, "0")}`, slug: slugify(name), name, collectionIds: [collection], metal: index % 4 === 0 ? ["Platinum"] : index % 4 === 1 ? ["18ct Yellow Gold", "18ct White Gold"] : index % 4 === 2 ? ["18ct Rose Gold"] : ["18ct White Gold"], shape: shapes[index % shapes.length], setting: settings[index % settings.length], carat: `${(0.8 + (index % 8) * 0.15).toFixed(2)}ct`, clarity: index % 2 ? "VS1" : "VVS2", color: index % 3 ? "E" : "F", priceAud, priceUsd: Math.round(priceAud * .65), cost: Math.round(priceAud * .42), sku: `GM-${collection.slice(0, 3).toUpperCase()}-${String(index + 1).padStart(3, "0")}`, stock: (index * 3 + 2) % 17, igeCertNo: `IGI-GL-${39280 + index}`, images: [{ src: image, alt: `Placeholder product photography for ${name}`, isPrimary: true }, { src: imagePool[(index + 1) % imagePool.length], alt: `Hover placeholder for ${name}`, isPrimary: false }], hoverImage: imagePool[(index + 1) % imagePool.length], badges: index % 9 === 0 ? ["New"] : index % 7 === 0 ? ["Bestseller"] : [], description, details: "<h3>Made with intention</h3>Responsibly crafted in precious metal with a certified lab-grown diamond. <strong>Complimentary lifetime care</strong> is included.", seoTitle: name, seoDescription: description, ogImage: image, jsonLdEnabled: true, readyToShip: index % 5 === 0, featured: index < 6, status: index % 13 === 0 ? "draft" : "active", createdAt: isoDaysAgo(90 - index), rating: Number((4.6 + (index % 4) * .1).toFixed(1)), reviewCount: 18 + index * 7 };
  });
}
function makeCustomers(): Customer[] { return Array.from({ length: 80 }, (_, index) => { const first = firstNames[index % firstNames.length]; const last = lastNames[index % lastNames.length]; return { id: `cust-${String(index + 1).padStart(3, "0")}`, name: `${first} ${last}`, email: `${first.toLowerCase()}.${last.toLowerCase()}${index + 1}@example.com`, tags: index % 9 === 0 ? ["VIP"] : index % 4 === 0 ? ["Repeat"] : index % 7 === 0 ? ["Proposal-Season"] : [], totalSpent: 0, orderCount: 0, notes: index % 11 === 0 ? "Prefers a quiet, considered client-service experience." : "", address: `${10 + index} Collins Street, Melbourne VIC 3000`, createdAt: isoDaysAgo(120 - index), vasStatus: index % 5 === 0 ? "Active" : "None" }; }); }
function makeOrders(products: AdminProduct[], customers: Customer[]): Order[] { return Array.from({ length: 60 }, (_, index) => { const product = products[index % products.length]; const quantity = index % 11 === 0 ? 2 : 1; const subtotal = product.priceAud * quantity; const gstAmount = Math.round(subtotal * .18); const status: OrderStatus = index % 17 === 0 ? "Cancelled" : index % 8 === 0 ? "Delivered" : index % 5 === 0 ? "Shipped" : index % 3 === 0 ? "Crafting" : "Processing"; const paymentStatus: PaymentStatus = status === "Cancelled" ? "Refunded" : index % 6 === 0 ? "Pending" : "Paid"; const createdAt = isoDaysAgo(index + 1); return { id: `order-${String(index + 1).padStart(3, "0")}`, code: `GM-2026-${String(index + 1).padStart(4, "0")}`, customerId: customers[index % customers.length].id, items: [{ productId: product.id, variant: `${product.carat} · ${product.metal[0]}`, qty: quantity, lineTotal: subtotal, hsnCode: "7113" }], subtotal, gstRate: 18, gstAmount, shipping: subtotal > 40 ? 0 : 25, totalAud: subtotal + gstAmount, totalUsd: Math.round((subtotal + gstAmount) * .65), status, paymentStatus, paymentMethod: index % 2 ? "Visa" : "G Pay", createdAt, timeline: [{ stage: "Order created", at: createdAt }, ...(paymentStatus === "Paid" ? [{ stage: "Payment received", at: isoDaysAgo(index) }] : []), ...(status !== "Processing" && status !== "Cancelled" ? [{ stage: "Crafting started", at: isoDaysAgo(Math.max(0, index - 1)) }] : []), ...(status === "Shipped" || status === "Delivered" ? [{ stage: "Shipped", at: isoDaysAgo(Math.max(0, index - 2)) }] : [])], craftStage: status === "Delivered" || status === "Shipped" ? 3 : status === "Crafting" ? 1 : 0, trackingCode: status === "Shipped" || status === "Delivered" ? `GMX${20260000 + index}` : undefined, notes: index % 10 === 0 ? "Please call before delivery." : "" }; }); }
function makeInvoices(orders: Order[]): Invoice[] { return orders.filter(order => order.paymentStatus === "Paid" || order.paymentStatus === "Refunded").map((order, index) => ({ id: `invoice-${String(index + 1).padStart(3, "0")}`, number: `${settingsSeed.billing.prefix}2026-${String(index + 1).padStart(4, "0")}`, orderId: order.id, customerId: order.customerId, issuedAt: order.createdAt, dueAt: order.createdAt, lines: order.items.map(item => ({ desc: `GEMOIREJEWELSLLP fine jewellery · ${item.variant}`, hsn: item.hsnCode, qty: item.qty, rate: Math.round(item.lineTotal / item.qty), amount: item.lineTotal })), subtotal: order.subtotal, cgst: Math.round(order.gstAmount / 2), sgst: Math.round(order.gstAmount / 2), shipping: order.shipping, totalAud: order.totalAud, totalUsd: order.totalUsd, status: order.paymentStatus === "Refunded" ? "refunded" : "paid", stampDate: order.createdAt, method: order.paymentMethod, billingSnapshot: invoiceBillingSnapshot(settingsSeed) })); }

function database(): Sqlite {
  if (global.__gemoireDb) return global.__gemoireDb;
  const filename = sqliteDatabasePath();
  fs.mkdirSync(path.dirname(filename), { recursive: true });
  const db = new Database(filename);
  db.pragma("journal_mode = WAL");
  db.exec("CREATE TABLE IF NOT EXISTS entity_store (kind TEXT NOT NULL, id TEXT NOT NULL, json TEXT NOT NULL, updated_at TEXT NOT NULL, PRIMARY KEY(kind, id)); CREATE TABLE IF NOT EXISTS meta_store (key TEXT PRIMARY KEY, json TEXT NOT NULL, updated_at TEXT NOT NULL);");
  global.__gemoireDb = db;
  seed(db);
  synchronizeAllProductReviewSummaries();
  return db;
}
function put<T extends { id: string }>(db: Sqlite, kind: string, value: T) { db.prepare("INSERT INTO entity_store (kind,id,json,updated_at) VALUES (@kind,@id,@json,@updatedAt) ON CONFLICT(kind,id) DO UPDATE SET json=excluded.json,updated_at=excluded.updated_at").run({ kind, id: value.id, json: JSON.stringify(value), updatedAt: new Date().toISOString() }); }
function putMeta<T>(db: Sqlite, key: string, value: T) { db.prepare("INSERT INTO meta_store (key,json,updated_at) VALUES (@key,@json,@updatedAt) ON CONFLICT(key) DO UPDATE SET json=excluded.json,updated_at=excluded.updated_at").run({ key, json: JSON.stringify(value), updatedAt: new Date().toISOString() }); }
function seed(db: Sqlite) {
  const seeded = db.prepare("SELECT json FROM meta_store WHERE key='seed-version'").get() as { json: string } | undefined;
  if (seeded?.json === '"2026-11-admin-v1"') return;
  const products = makeProducts(); const customers = makeCustomers(); const orders = makeOrders(products, customers);
  orders.forEach(order => { const customer = customers.find(item => item.id === order.customerId)!; if (order.paymentStatus !== "Pending") customer.totalSpent += order.totalAud; customer.orderCount += 1; });
  const collections: Collection[] = ["Aaria", "Kavya", "Mira"].map((name, index) => ({ id: name.toLowerCase(), name, slug: name.toLowerCase(), description: `${name} is a quietly considered GEMOIREJEWELSLLP collection.`, coverImage: imagePool[index], productIds: products.filter(product => product.collectionIds.includes(name.toLowerCase())).map(product => product.id), homepage: true, homepageOrder: index, megaProductId: products[index].id, revenue30d: 28700 + index * 8640 })).concat([{ id: "ready-to-ship", name: "Ready-to-Ship", slug: "ready-to-ship", description: "Pieces ready to begin their next chapter this week.", coverImage: imagePool[3], productIds: products.filter(product => product.readyToShip).map(product => product.id), homepage: true, homepageOrder: 3, megaProductId: products[4].id, revenue30d: 21430 }]);
  const faqs: Faq[] = ["How long will my ring take to craft?", "Do you ship worldwide?", "What is a lab-grown diamond?", "Which diamond shape is right for me?", "Is there a lifetime warranty?", "Do you offer moissanite?", "Where are your showrooms?", "Will my diamond come with certification?"].map((question, index) => ({ id: `faq-${index + 1}`, question, answer: index === 0 ? "Most made-to-order rings are crafted in four to six weeks. Ready-to-ship pieces leave our studio within ten business days." : "Our client care team will guide you through every detail with clear, considered advice.", position: index, published: true }));
  const reviews: Review[] = Array.from({ length: 12 }, (_, index) => ({ id: `review-${index + 1}`, productId: products[index % products.length].id, customerName: customers[index].name, city: ["Melbourne", "Sydney", "Brisbane"][index % 3], rating: index % 5 === 0 ? 4 : 5, quote: "The whole experience felt unhurried, considered and beautifully personal.", status: "published", createdAt: isoDaysAgo(index + 3), reply: index % 3 === 0 ? "Thank you for trusting us with such a meaningful piece." : undefined }));
  const discounts: Discount[] = [{ id: "disc-1", code: "GEMOIRE-10", type: "percentage", value: 10, scope: "sitewide", expiresAt: "2026-12-31", usageCount: 34, usageCap: 100, status: "active" }, { id: "disc-2", code: "SHIPWITHCARE", type: "shipping", value: 0, scope: "sitewide", expiresAt: "2027-01-31", usageCount: 18, usageCap: 50, status: "active" }];
  const subscribers: Subscriber[] = Array.from({ length: 60 }, (_, index) => ({ id: `sub-${index + 1}`, email: `considered.client${index + 1}@example.com`, addedAt: isoDaysAgo(index), source: index % 2 ? "Newsletter band" : "Checkout", unsubscribed: index % 17 === 0 }));
  const instagram: InstagramItem[] = Array.from({ length: 10 }, (_, index) => ({ id: `ig-${index + 1}`, src: imagePool[index % imagePool.length], productId: products[index].id, position: index, underReview: index % 4 === 0 }));
  const blog: BlogPost[] = ["A diamond shaped around your day", "How a ring comes to life", "A considered guide to lab-grown", "The art of the three-stone ring"].map((title, index) => ({ id: `blog-${index + 1}`, title, slug: slugify(title), cover: imagePool[index], body: "A thoughtful editorial note from the GEMOIREJEWELSLLP studio.", category: ["Guides", "Craft", "Diamond education", "Style"][index], publishDate: isoDaysAgo(index * 8), excerpt: "A short, considered introduction to the details that make a piece feel like yours.", status: index === 3 ? "draft" : "published" }));
  const bookings: Booking[] = ["Los Angeles", "Houston", "San Diego", "Austin", "San Francisco"].map((city, index) => ({ id: `booking-${index + 1}`, name: customers[index].name, email: customers[index].email, city, date: new Date(Date.now() + (index + 2) * 86400000).toISOString().slice(0, 10), preferredTime: "11:00", status: index === 0 ? "New" : "Confirmed" }));
  const craft: CraftStage[] = orders.slice(0, 16).map(order => ({ id: order.id, orderId: order.id, stage: order.craftStage, dates: [order.createdAt, isoDaysAgo(3), isoDaysAgo(1), isoDaysAgo(0)], expectedDates: [isoDaysAgo(-2), isoDaysAgo(-12), isoDaysAgo(-18), isoDaysAgo(-25)], blocked: false }));
  const quizQuestions: QuizQuestion[] = ["What feels most like you?", "How does your ring need to live?", "Choose your kind of sparkle"].map((question, index) => ({ id: `quiz-${index + 1}`, question, answers: index === 0 ? ["Understated and enduring", "Romantic and expressive", "Distinctly modern"] : index === 1 ? ["Quietly every day", "Ready for anything", "Made for a little attention"] : ["A single clear point", "A halo of light", "A considered balance"], position: index }));
  const quizOutcomes: QuizOutcome[] = Array.from({ length: 9 }, (_, index) => ({ id: `outcome-${index}`, first: Math.floor(index / 3), second: index % 3, styles: index % 2 ? ["Halo", "Toi et Moi"] : ["Solitaire", "Bezel"] }));
  const seoPages: SeoPage[] = [
    { id: "seo-home", pageType: "home", slug: "/", title: "Fine lab-grown diamond jewellery", description: "A diamond cut to make a lifetime moment feel effortless.", canonical: siteUrl("/"), ogImage: imagePool[0], jsonLdType: "WebSite", status: "published" },
    { id: "seo-faq", pageType: "faq", slug: "/faq", title: "Diamond FAQs", description: "Clear answers for every considered diamond decision.", canonical: siteUrl("/faq"), ogImage: imagePool[1], jsonLdType: "FAQPage", status: "published" },
    { id: "seo-showroom", pageType: "showroom", slug: "/showroom", title: "Visit a GEMOIREJEWELSLLP showroom", description: "Private appointments in five considered cities.", canonical: siteUrl("/showroom"), ogImage: imagePool[2], jsonLdType: "Event", status: "published" },
    { id: "seo-cart", pageType: "cart", slug: "/cart", title: "Your bag", description: "", canonical: siteUrl("/cart"), ogImage: imagePool[0], jsonLdType: "WebSite", status: "draft" },
    ...products.map((product): SeoPage => ({ id: `seo-${product.id}`, pageType: "product", slug: `/products/${product.slug}`, title: product.name, description: product.description, canonical: siteUrl(`/products/${product.slug}`), ogImage: product.images[0].src, jsonLdType: "Product", status: product.status === "active" ? "published" : "draft" }))
  ];
  seoPages.push(
    ...collections.map(collection => ({ id: `seo-collection-${collection.id}`, pageType: "collection" as const, slug: `/collections/${collection.slug}`, title: `${collection.name} collection`, description: collection.description, canonical: siteUrl(`/collections/${collection.slug}`), ogImage: collection.coverImage, jsonLdType: "WebSite" as const, status: "published" as const })),
    ...[{ slug: "engagement", title: "Engagement Rings", description: "Lab-grown diamond rings that make the beginning feel entirely like you." }, { slug: "wedding", title: "Wedding Rings", description: "Considered bands and three-stone designs for the promise you make every day." }, { slug: "fine-jewelry", title: "Fine Jewellery", description: "Diamond details designed to become part of your own signature." }].map((page, index) => ({ id: `seo-plp-${page.slug}`, pageType: "collection" as const, slug: `/collections/${page.slug}`, title: page.title, description: page.description, canonical: siteUrl(`/collections/${page.slug}`), ogImage: imagePool[index], jsonLdType: "WebSite" as const, status: "published" as const })),
    { id: "seo-checkout", pageType: "checkout", slug: "/checkout", title: "Checkout", description: "Complete your considered GEMOIREJEWELSLLP order.", canonical: siteUrl("/checkout"), ogImage: imagePool[0], jsonLdType: "WebSite", status: "draft" },
    { id: "seo-404", pageType: "404", slug: "/404", title: "Lost your way?", description: "Find a considered place to begin with GEMOIREJEWELSLLP.", canonical: siteUrl("/404"), ogImage: imagePool[0], jsonLdType: "WebSite", status: "draft" }
  );
  const redirects: RedirectRule[] = [{ id: "redirect-1", from: "/rings/old-solitaire", to: "/products/aaria-classic-solitaire", type: 301, hits: 28, active: true }];
  const invoices = makeInvoices(orders);
  const creditNotes: CreditNote[] = invoices.filter(invoice => invoice.status === "refunded").slice(0, 2).map((invoice, index) => ({ id: `credit-${index + 1}`, number: `CN-GM-2026-${String(index + 1).padStart(4, "0")}`, invoiceId: invoice.id, orderId: invoice.orderId, amount: invoice.totalAud, reason: index === 0 ? "Cancelled before dispatch" : "Returned to studio", createdAt: isoDaysAgo(4 + index * 12) }));
  creditNotes.forEach(credit => { const invoice = invoices.find(item => item.id === credit.invoiceId); if (invoice) invoice.creditNoteId = credit.id; });
  ([ ["products", products], ["customers", customers], ["orders", orders], ["invoices", invoices], ["creditNotes", creditNotes], ["collections", collections], ["faqs", faqs], ["reviews", reviews], ["discounts", discounts], ["subscribers", subscribers], ["instagram", instagram], ["blog", blog], ["bookings", bookings], ["craft", craft], ["quizQuestions", quizQuestions], ["quizOutcomes", quizOutcomes], ["seoPages", seoPages], ["redirects", redirects] ] as Array<[string, Array<{ id: string }>]>) .forEach(([kind, values]) => values.forEach(value => put(db, kind, value)));
  putMeta(db, "settings", settingsSeed); putMeta(db, "seo-site", seoSiteSeed); putMeta(db, "seo-analytics", seoAnalyticsSeed); putMeta(db, "seed-version", "2026-11-admin-v1");
}

function getMeta<T>(key: string): T { const row = database().prepare("SELECT json FROM meta_store WHERE key=?").get(key) as { json: string } | undefined; if (!row) throw new Error(`Missing admin meta ${key}`); return JSON.parse(row.json) as T; }
function setMeta<T>(key: string, value: T) { putMeta(database(), key, value); return value; }
function entityList<K extends EntityName>(kind: K): EntityMap[K][] { return (database().prepare("SELECT json FROM entity_store WHERE kind=? ORDER BY updated_at DESC").all(kind) as { json: string }[]).map(row => JSON.parse(row.json) as EntityMap[K]); }
function entityGet<K extends EntityName>(kind: K, id: string): EntityMap[K] | undefined { const row = database().prepare("SELECT json FROM entity_store WHERE kind=? AND id=?").get(kind, id) as { json: string } | undefined; return row ? JSON.parse(row.json) as EntityMap[K] : undefined; }

function currentSettings(): StoreSettings {
  const stored = getMeta<Partial<StoreSettings> & Pick<StoreSettings, "id" | "billing">>("settings");
  return { ...settingsSeed, ...stored, billing: { ...settingsSeed.billing, ...stored.billing }, bankDetails: { ...settingsSeed.bankDetails, ...stored.bankDetails }, igi: { ...settingsSeed.igi, ...stored.igi }, shippingZones: stored.shippingZones?.length ? stored.shippingZones : settingsSeed.shippingZones };
}

function synchronizeProductReviewSummary(productId: string) {
  const product = entityGet("products", productId);
  if (!product) return;
  const reviews = entityList("reviews").filter(review => review.productId === productId && review.status === "published");
  const reviewCount = reviews.length;
  const rating = reviewCount ? Number((reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount).toFixed(1)) : 0;
  if (product.reviewCount === reviewCount && product.rating === rating) return;
  put(database(), "products", { ...product, reviewCount, rating });
}

function synchronizeAllProductReviewSummaries() {
  entityList("products").forEach(product => synchronizeProductReviewSummary(product.id));
}

function synchronizeProductSeo(product: AdminProduct) {
  const existing = entityGet("seoPages", `seo-${product.id}`);
  const value: SeoPage = {
    id: `seo-${product.id}`,
    pageType: "product",
    slug: `/products/${product.slug}`,
    title: product.seoTitle?.trim() || existing?.title || product.name,
    description: product.seoDescription?.trim() || existing?.description || product.description,
    canonical: existing?.canonical && existing.slug === `/products/${product.slug}` ? existing.canonical : siteUrl(`/products/${product.slug}`),
    ogImage: product.ogImage?.trim() || existing?.ogImage || product.images.find(image => image.isPrimary)?.src || imagePool[0],
    jsonLdType: product.jsonLdEnabled === false ? "WebSite" : product.jsonLdEnabled === true ? "Product" : existing?.jsonLdType ?? "Product",
    status: product.status === "active" ? "published" : "draft"
  };
  put(database(), "seoPages", value);
}

function synchronizeProductFieldsFromSeo(page: SeoPage) {
  if (page.pageType !== "product") return;
  const product = entityList("products").find(item => `seo-${item.id}` === page.id || `/products/${item.slug}` === page.slug);
  if (!product) return;
  put(database(), "products", {
    ...product,
    seoTitle: page.title,
    seoDescription: page.description,
    ogImage: page.ogImage,
    jsonLdEnabled: page.jsonLdType === "Product"
  });
}

function synchronizeCollection(collection: Collection) {
  const db = database();
  entityList("products").forEach(product => {
    const included = collection.productIds.includes(product.id);
    const hasCollection = product.collectionIds.includes(collection.id);
    if (included === hasCollection) return;
    put(db, "products", { ...product, collectionIds: included ? [...product.collectionIds, collection.id] : product.collectionIds.filter(id => id !== collection.id) });
  });
  const existing = entityGet("seoPages", `seo-collection-${collection.id}`);
  put(db, "seoPages", {
    id: `seo-collection-${collection.id}`,
    pageType: "collection",
    slug: `/collections/${collection.slug}`,
    title: existing?.title || `${collection.name} collection`,
    description: existing?.description || collection.description,
    canonical: existing?.canonical && existing.slug === `/collections/${collection.slug}` ? existing.canonical : siteUrl(`/collections/${collection.slug}`),
    ogImage: existing?.ogImage || collection.coverImage,
    jsonLdType: existing?.jsonLdType ?? "WebSite",
    status: "published"
  } satisfies SeoPage);
}

type StorefrontLineInput = { slug: string; quantity: number; audPrice?: number; metal?: string; carat?: string; setting?: string };
type StorefrontSelection = { product: AdminProduct; quantity: number; price: number; variant: string };

function selectStorefrontProducts(items: StorefrontLineInput[]): StorefrontSelection[] {
  return items.map(item => {
    const product = entityList("products").find(candidate => candidate.slug === item.slug && candidate.status === "active");
    if (!product) throw new Error("One of the selected pieces is no longer available.");
    const quantity = Math.max(1, Math.min(9, Math.floor(Number(item.quantity) || 1)));
    if (product.stock < quantity) throw new Error(`${product.name} no longer has enough stock available.`);
    const requestedPrice = Number(item.audPrice);
    const price = Number.isFinite(requestedPrice) && requestedPrice >= product.priceAud && requestedPrice <= product.priceAud * 2 ? Math.round(requestedPrice) : product.priceAud;
    return { product, quantity, price, variant: [item.carat ?? product.carat, item.metal ?? product.metal[0], item.setting ?? product.setting].filter(Boolean).join(" · ") };
  });
}

function discountForSelections(code: string | undefined, selections: StorefrontSelection[]) {
  if (!code?.trim()) return undefined;
  const normalized = code.trim().toUpperCase();
  const discount = entityList("discounts").find(item => item.status === "active" && item.code.toUpperCase() === normalized);
  if (!discount) throw new Error("That code is not active.");
  if (new Date(discount.expiresAt).getTime() < Date.now()) throw new Error("That code has expired.");
  if (discount.usageCount >= discount.usageCap) throw new Error("That code has reached its usage limit.");
  const eligible = selections.filter(({ product }) => discount.scope === "sitewide" || (discount.scope === "product" ? product.id === discount.scopeId || product.slug === discount.scopeId : product.collectionIds.includes(discount.scopeId ?? "")));
  if (!eligible.length) throw new Error("That code is not valid for the pieces currently in your bag.");
  const eligibleSubtotal = eligible.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const rawAmount = discount.type === "percentage" ? eligibleSubtotal * discount.value / 100 : discount.type === "fixed" ? discount.value : 0;
  return { discount, amount: Math.min(eligibleSubtotal, Math.max(0, Math.round(rawAmount))), shippingFree: discount.type === "shipping" };
}

function hsnForProduct(product: AdminProduct, settings: StoreSettings) {
  const name = product.name.toLowerCase();
  if (name.includes("earring") || name.includes("hoop") || name.includes("drop")) return settings.billing.earringHsn;
  if (name.includes("bracelet") || name.includes("bangle")) return settings.billing.braceletHsn;
  return settings.billing.ringHsn;
}

export const adminRepository = {
  list: entityList,
  get: entityGet,
  upsert<K extends EntityName>(kind: K, value: EntityMap[K]) {
    const db = database();
    const previousReview = kind === "reviews" ? entityGet("reviews", value.id) : undefined;
    db.transaction(() => {
      put(db, kind, value);
      if (kind === "products") synchronizeProductSeo(value as AdminProduct);
      if (kind === "collections") synchronizeCollection(value as Collection);
      if (kind === "seoPages") synchronizeProductFieldsFromSeo(value as SeoPage);
      if (kind === "reviews") {
        const review = value as Review;
        synchronizeProductReviewSummary(review.productId);
        if (previousReview && previousReview.productId !== review.productId) synchronizeProductReviewSummary(previousReview.productId);
      }
    })();
    return value;
  },
  remove(kind: EntityName, id: string) {
    const db = database();
    const removedReview = kind === "reviews" ? entityGet("reviews", id) : undefined;
    db.transaction(() => {
      db.prepare("DELETE FROM entity_store WHERE kind=? AND id=?").run(kind, id);
      if (removedReview) synchronizeProductReviewSummary(removedReview.productId);
      if (kind === "products") {
        db.prepare("DELETE FROM entity_store WHERE kind='seoPages' AND id=?").run(`seo-${id}`);
        db.prepare("DELETE FROM entity_store WHERE kind='reviews' AND json_extract(json, '$.productId')=?").run(id);
        entityList("collections").forEach(collection => {
          if (collection.productIds.includes(id)) put(db, "collections", { ...collection, productIds: collection.productIds.filter(productId => productId !== id), megaProductId: collection.megaProductId === id ? undefined : collection.megaProductId });
        });
      }
      if (kind === "collections") {
        db.prepare("DELETE FROM entity_store WHERE kind='seoPages' AND id=?").run(`seo-collection-${id}`);
        entityList("products").forEach(product => {
          if (product.collectionIds.includes(id)) put(db, "products", { ...product, collectionIds: product.collectionIds.filter(collectionId => collectionId !== id) });
        });
      }
    })();
  },
  listProducts() { return entityList("products"); },
  getProduct(slug: string) { return entityList("products").find(product => product.slug === slug); },
  listOrders() { return entityList("orders").sort((a, b) => b.createdAt.localeCompare(a.createdAt)); },
  listCustomers() { return entityList("customers").sort((a, b) => b.totalSpent - a.totalSpent); },
  listInvoices() { return entityList("invoices").sort((a, b) => b.issuedAt.localeCompare(a.issuedAt)); },
  getSettings() { return currentSettings(); },
  updateSettings(patch: Partial<StoreSettings>) { const current = currentSettings(); return setMeta("settings", { ...current, ...patch, billing: patch.billing ? { ...current.billing, ...patch.billing } : current.billing, bankDetails: patch.bankDetails ? { ...current.bankDetails, ...patch.bankDetails } : current.bankDetails, igi: patch.igi ? { ...current.igi, ...patch.igi } : current.igi }); },
  getSeoSite() { return getMeta<SeoSite>("seo-site"); },
  updateSeoSite(patch: Partial<SeoSite>) { return setMeta("seo-site", { ...getMeta<SeoSite>("seo-site"), ...patch }); },
  getSeoAnalytics() { return getMeta<SeoAnalytics>("seo-analytics"); },
  findSeoPage(slug: string) { return entityList("seoPages").find(page => page.slug === slug); },
  quoteStorefrontDiscount(code: string, items: StorefrontLineInput[]) {
    if (!items.length) throw new Error("Your bag is empty.");
    const quote = discountForSelections(code, selectStorefrontProducts(items));
    if (!quote) throw new Error("Enter a discount code.");
    return { discount: quote.discount, amount: quote.amount, shippingFree: quote.shippingFree };
  },
  createStorefrontOrder(input: { customer: { name: string; email: string; address: string }; items: StorefrontLineInput[]; discountCode?: string }) {
    if (!input.items.length) throw new Error("Your bag is empty.");
    const db = database();
    return db.transaction(() => {
      const settings = currentSettings();
      const paymentCaptured = settings.paymentEnabled;
      const products = selectStorefrontProducts(input.items);
      const discountQuote = discountForSelections(input.discountCode, products);
      const createdAt = new Date().toISOString();
      const subtotal = products.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const discountAmount = discountQuote?.amount ?? 0;
      const taxableSubtotal = Math.max(0, subtotal - discountAmount);
      const gstAmount = Math.round(taxableSubtotal * settings.billing.gstRate / 100);
      const shipping = discountQuote?.shippingFree || taxableSubtotal >= settings.freeShippingThreshold ? 0 : 25;
      const totalAud = taxableSubtotal + gstAmount + shipping;
      const email = input.customer.email.trim().toLowerCase();
      if (!email) throw new Error("An email address is required to create your order.");
      const customerName = input.customer.name.trim() || "GEMOIREJEWELSLLP client";
      const existingCustomer = entityList("customers").find(customer => customer.email.toLowerCase() === email);
      const customer: Customer = existingCustomer ? { ...existingCustomer, name: customerName, address: input.customer.address.trim() || existingCustomer.address, totalSpent: existingCustomer.totalSpent + (paymentCaptured ? totalAud : 0), orderCount: existingCustomer.orderCount + 1 } : { id: `cust-${crypto.randomUUID()}`, name: customerName, email, tags: [], totalSpent: paymentCaptured ? totalAud : 0, orderCount: 1, notes: "", address: input.customer.address.trim() || "Address supplied at checkout", createdAt, vasStatus: "None" };
      const orderNumber = Math.max(0, ...entityList("orders").map(order => Number(order.code.split("-").at(-1)) || 0)) + 1;
      const invoiceNumber = Math.max(0, ...entityList("invoices").map(invoice => Number(invoice.number.split("-").at(-1)) || 0)) + 1;
      const order: Order = { id: `order-${crypto.randomUUID()}`, code: `GM-2026-${String(orderNumber).padStart(4, "0")}`, customerId: customer.id, items: products.map(item => ({ productId: item.product.id, variant: item.variant, qty: item.quantity, lineTotal: item.price * item.quantity, hsnCode: hsnForProduct(item.product, settings) })), subtotal, gstRate: settings.billing.gstRate, gstAmount, shipping, totalAud, totalUsd: Math.round(totalAud * .65), status: paymentCaptured ? "Processing" : "Pending", paymentStatus: paymentCaptured ? "Paid" : "Pending", paymentMethod: paymentCaptured ? "Mock card" : "Awaiting manual payment", createdAt, timeline: paymentCaptured ? [{ stage: "Order created", at: createdAt }, { stage: "Payment received", at: createdAt }] : [{ stage: "Order created", at: createdAt }], craftStage: 0, discountCode: discountQuote?.discount.code, discountAmount: discountAmount || undefined };
      const invoice: Invoice | undefined = paymentCaptured ? { id: `invoice-${crypto.randomUUID()}`, number: `${settings.billing.prefix}2026-${String(invoiceNumber).padStart(4, "0")}`, orderId: order.id, customerId: customer.id, issuedAt: createdAt, dueAt: createdAt, lines: order.items.map((item, index) => ({ desc: `${products[index].product.name} · ${item.variant}`, hsn: item.hsnCode, qty: item.qty, rate: Math.round(item.lineTotal / item.qty), amount: item.lineTotal })), subtotal, cgst: settings.billing.splitGst ? Math.floor(gstAmount / 2) : gstAmount, sgst: settings.billing.splitGst ? gstAmount - Math.floor(gstAmount / 2) : 0, shipping, totalAud, totalUsd: order.totalUsd, status: "paid", stampDate: createdAt, method: order.paymentMethod, discountCode: order.discountCode, discountAmount: order.discountAmount, billingSnapshot: invoiceBillingSnapshot(settings) } : undefined;
      put(db, "customers", customer); put(db, "orders", order); if (invoice) put(db, "invoices", invoice);
      products.forEach(item => put(db, "products", { ...item.product, stock: item.product.stock - item.quantity }));
      put(db, "craft", { id: order.id, orderId: order.id, stage: 0, dates: [createdAt], expectedDates: [createdAt, isoDaysAgo(-14), isoDaysAgo(-28), isoDaysAgo(-42)], blocked: false });
      if (discountQuote) put(db, "discounts", { ...discountQuote.discount, usageCount: discountQuote.discount.usageCount + 1 });
      return { order, invoice };
    })();
  },
  markOrderPaid(id: string) {
    const db = database();
    return db.transaction(() => {
      const order = entityGet("orders", id);
      if (!order) throw new Error("Order not found");
      if (order.paymentStatus === "Refunded") throw new Error("A refunded order cannot be marked paid.");
      const existingInvoice = entityList("invoices").find(invoice => invoice.orderId === id);
      const paymentWasCaptured = order.paymentStatus === "Paid";
      if (paymentWasCaptured && existingInvoice && existingInvoice.status !== "due") return { order, invoice: existingInvoice };

      const settings = currentSettings();
      const paidAt = new Date().toISOString();
      const gstAmount = order.gstAmount;
      const paid: Order = paymentWasCaptured ? order : {
        ...order,
        paymentStatus: "Paid",
        paymentMethod: order.paymentMethod === "Awaiting manual payment" ? "Manual payment" : order.paymentMethod,
        status: order.status === "Pending" ? "Processing" : order.status,
        timeline: [...order.timeline, { stage: "Payment received", at: paidAt }]
      };
      const snapshot = { ...invoiceBillingSnapshot(settings), gstRate: order.gstRate };
      let invoice = existingInvoice;
      const appliedSnapshot = invoice?.billingSnapshot ?? snapshot;
      const splitGst = appliedSnapshot.splitGst;
      if (!invoice) {
        const invoiceNumber = Math.max(0, ...entityList("invoices").map(item => Number(item.number.split("-").at(-1)) || 0)) + 1;
        const cgst = splitGst ? Math.floor(gstAmount / 2) : gstAmount;
        const sgst = splitGst ? gstAmount - cgst : 0;
        invoice = {
          id: `invoice-${crypto.randomUUID()}`,
          number: `${settings.billing.prefix}2026-${String(invoiceNumber).padStart(4, "0")}`,
          orderId: id,
          customerId: paid.customerId,
          issuedAt: paidAt,
          dueAt: paidAt,
          lines: paid.items.map(item => ({ desc: `${entityGet("products", item.productId)?.name ?? "GEMOIREJEWELSLLP fine jewellery"} · ${item.variant}`, hsn: item.hsnCode || settings.billing.ringHsn, qty: item.qty, rate: Math.round(item.lineTotal / item.qty), amount: item.lineTotal })),
          subtotal: paid.subtotal,
          cgst,
          sgst,
          shipping: paid.shipping,
          totalAud: paid.totalAud,
          totalUsd: paid.totalUsd,
          status: "paid",
          stampDate: paidAt,
          method: paid.paymentMethod,
          discountCode: paid.discountCode,
          discountAmount: paid.discountAmount,
          billingSnapshot: appliedSnapshot
        };
      } else if (invoice.status === "due") {
        invoice = {
          ...invoice,
          status: "paid",
          stampDate: paidAt,
          method: paid.paymentMethod,
          totalAud: paid.totalAud,
          totalUsd: paid.totalUsd,
          cgst: splitGst ? Math.floor(gstAmount / 2) : gstAmount,
          sgst: splitGst ? gstAmount - Math.floor(gstAmount / 2) : 0,
          discountCode: paid.discountCode,
          discountAmount: paid.discountAmount,
          billingSnapshot: appliedSnapshot
        };
      }

      const customer = entityGet("customers", paid.customerId);
      put(db, "orders", paid);
      if (!paymentWasCaptured && customer) put(db, "customers", { ...customer, totalSpent: customer.totalSpent + paid.totalAud });
      if (invoice) put(db, "invoices", invoice);
      return { order: paid, invoice };
    })();
  },
  markShipped(id: string) { const order = entityGet("orders", id); if (!order) throw new Error("Order not found"); const shippedAt = new Date().toISOString(); const shipped: Order = { ...order, status: "Shipped", trackingCode: order.trackingCode ?? `GMX${Math.floor(10000000 + Math.random() * 89999999)}`, craftStage: 3, timeline: [...order.timeline, { stage: "Shipped", at: shippedAt }] }; const craft = entityGet("craft", id); database().transaction(() => { put(database(), "orders", shipped); put(database(), "craft", craft ? { ...craft, stage: 3, dates: [...craft.dates, shippedAt] } : { id, orderId: id, stage: 3, dates: [shippedAt], expectedDates: [], blocked: false }); })(); return shipped; },
  refundInvoice(id: string) { const invoice = entityGet("invoices", id); if (!invoice) throw new Error("Invoice not found"); if (invoice.status === "refunded") return { invoice, credit: invoice.creditNoteId ? entityGet("creditNotes", invoice.creditNoteId) : undefined, order: entityGet("orders", invoice.orderId) }; const order = entityGet("orders", invoice.orderId); if (!order) throw new Error("Order not found"); if (order.status !== "Cancelled") throw new Error("Only a cancelled order can be refunded."); const refundedAt = new Date().toISOString(); const credit: CreditNote = { id: `credit-${crypto.randomUUID()}`, number: `CN-GM-2026-${String(entityList("creditNotes").length + 1).padStart(4, "0")}`, invoiceId: invoice.id, orderId: invoice.orderId, amount: invoice.totalAud, reason: "Refunded by demo administrator", createdAt: refundedAt }; const refunded: Invoice = { ...invoice, status: "refunded", stampDate: refundedAt, creditNoteId: credit.id }; const refundedOrder: Order = { ...order, status: "Cancelled", paymentStatus: "Refunded", timeline: [...order.timeline, { stage: "Refunded", at: refundedAt }] }; put(database(), "creditNotes", credit); put(database(), "invoices", refunded); put(database(), "orders", refundedOrder); return { invoice: refunded, credit, order: refundedOrder }; },
  resolveRedirect(source: string) { const rule = entityList("redirects").find(item => item.active && item.from === source); if (!rule) return undefined; const changed = { ...rule, hits: rule.hits + 1 }; put(database(), "redirects", changed); return changed; },
  resetDemoData() { const db = database(); db.exec("DELETE FROM entity_store; DELETE FROM meta_store;"); seed(db); synchronizeAllProductReviewSummaries(); }
};

export type StorefrontProduct = {
  slug: string; name: string; collection: "Aaria" | "Kavya" | "Mira"; category: "engagement" | "wedding" | "fine-jewelry";
  setting: string; shape: string; carat: string; clarity: string; color: string;
  metal: "Platinum" | "18ct Yellow Gold" | "18ct Rose Gold" | "18ct White Gold";
  audPrice: number; usdPrice: number; rating: number; reviewCount: number; tag?: "New" | "Bestseller";
  image: string; imageAlt: string; images: AdminProduct["images"]; hoverImage?: string;
  description: string; details: string; igeCertNo: string; id: string; stock: number; readyToShip: boolean;
};

export function toStorefrontProduct(product: AdminProduct): StorefrontProduct {
  const collection = product.collectionIds[0] === "kavya" ? "Kavya" : product.collectionIds[0] === "mira" ? "Mira" : "Aaria";
  const category = product.setting === "Three-Stone" || product.setting === "Eternity" ? "wedding" : product.name.includes("Hoop") || product.name.includes("Pendant") ? "fine-jewelry" : "engagement";
  const availableImages = product.images.filter(item => item.src.trim()).slice(0, 8);
  const selectedPrimary = availableImages.find(item => item.isPrimary) ?? availableImages[0] ?? { src: imagePool[0], alt: `Placeholder product photography for ${product.name}`, isPrimary: true };
  const images = [selectedPrimary, ...availableImages.filter(item => item !== selectedPrimary)].map((item, index) => ({ ...item, isPrimary: index === 0 }));
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    collection,
    category,
    setting: product.setting,
    shape: product.shape,
    carat: product.carat,
    clarity: product.clarity,
    color: product.color,
    metal: (product.metal[0] as StorefrontProduct["metal"]) ?? "18ct Yellow Gold",
    audPrice: product.priceAud,
    usdPrice: product.priceUsd,
    rating: product.rating,
    reviewCount: product.reviewCount,
    tag: product.badges.includes("New") ? "New" : product.badges.includes("Bestseller") ? "Bestseller" : undefined,
    image: selectedPrimary.src,
    imageAlt: selectedPrimary.alt,
    images,
    hoverImage: product.hoverImage?.trim() || images[1]?.src,
    description: product.description,
    details: product.details ?? "",
    igeCertNo: product.igeCertNo,
    stock: product.stock,
    readyToShip: product.readyToShip
  };
}
