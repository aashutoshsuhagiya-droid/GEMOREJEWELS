import assert from "node:assert/strict";
import postcss from "postcss";

const origin = "http://localhost:3000";
const decode = value => value.replaceAll("&amp;", "&").replaceAll("&#x27;", "'").replaceAll("&quot;", '"');
const documentOnly = html => html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, "").replace(/<!--[\s\S]*?-->/g, "");
let requests = 0;

async function get(path, expected = 200) {
  const response = await fetch(new URL(path, origin), { redirect: "manual", signal: AbortSignal.timeout(30000) });
  assert.equal(response.status, expected, `${path}: HTTP ${response.status}`);
  requests += 1;
  return response;
}

const home = documentOnly(await (await get("/")).text());
const catalog = await (await get("/api/catalog")).json();
assert.ok(catalog.length > 0, "catalogue must contain active pieces");

const navigation = [
  ["Sale", "/collections/sale"],
  ["Ready-to-Ship", "/collections/ready-to-ship"],
  ["Engagement Rings", "/collections/engagement"],
  ["Wedding Rings", "/collections/wedding"],
  ["Jewelry", "/collections/fine-jewelry"],
  ["Loose Stones", "/collections/loose-stones"],
  ["Gifts", "/collections/gifts"],
];
const desktopNav = home.match(/<div class="desktop-nav desktop-only">([\s\S]*?)<\/div>/)?.[1];
assert.ok(desktopNav, "desktop navigation must render");
assert.deepEqual([...desktopNav.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([^<]+)<\/a>/g)].map(([, href, label]) => [label, href]), navigation);
assert.deepEqual([...desktopNav.matchAll(/<a\b[^>]*class="nav-button"[^>]*>([^<]+)<\/a>/g)].map(([, label]) => label), ["Engagement Rings", "Wedding Rings", "Jewelry"]);
const mobileMenu = home.match(/<aside\b[^>]*class="mobile-menu[^"]*"[^>]*>([\s\S]*?)<\/aside>/)?.[1];
assert.ok(mobileMenu, "mobile navigation must render");
assert.deepEqual([...mobileMenu.matchAll(/<summary>([^<]+)<\/summary>/g)].map(([, label]) => label), [...navigation.map(([label]) => label), "Client care"]);
for (const [label, href] of navigation) assert.ok(mobileMenu.includes(`href="${href}">Shop ${label}</a>`));
assert.match(mobileMenu, /href="\/faq">FAQs<\/a>/);
assert.match(mobileMenu, /href="\/showroom">Showroom appointments<\/a>/);
assert.doesNotMatch(mobileMenu, /Explore the guide/);
const footer = home.match(/<footer\b[^>]*>([\s\S]*?)<\/footer>/)?.[1];
assert.match(footer, /href="\/faq"/);
assert.match(footer, /href="\/showroom"/);

const cardSlugs = html => [...html.matchAll(/<article class="product-card[^>]*>[\s\S]*?<\/article>/g)]
  .map(([card]) => card.match(/href="\/products\/([^?"/]+)/)[1]);
const categories = [["Engagement Rings", "engagement"], ["Wedding Rings", "wedding"], ["Earrings", "earrings"], ["Bracelets", "bracelets"], ["Necklaces", "necklaces"]];
const categoryCards = [...home.matchAll(/<a\b[^>]*class="style-card"[^>]*>[\s\S]*?<\/a>/g)].map(([card]) => card);
assert.match(home, /<h2>Shop by Category<\/h2>/);
assert.equal(categoryCards.length, 5);
const categoryPhotos = new Set();
for (const [index, [label, slug]] of categories.entries()) {
  const card = categoryCards[index];
  assert.ok(card.includes(`href="/collections/${slug}"`));
  assert.ok(card.includes(`<h3>${label}</h3>`));
  const image = card.match(/<img\b[^>]*>/)?.[0];
  assert.match(image, /width="700"/);
  assert.match(image, /height="700"/);
  const src = decode(image.match(/src="([^"]+)"/)[1]);
  const photo = new URL(src, origin).searchParams.get("url") ?? src;
  categoryPhotos.add(new URL(photo).pathname);
}
assert.equal(categoryPhotos.size, 5, "each category needs a distinct existing photo");
for (const [slug, type, title] of [["earrings", "earring", "Earrings"], ["bracelets", "bracelet", "Bracelets"], ["necklaces", "necklace", "Necklaces"]]) {
  const page = documentOnly(await (await get(`/collections/${slug}`)).text());
  const expected = catalog.filter(product => product.jewelryType === type);
  assert.ok(page.includes(`<h1>${title}</h1>`));
  assert.deepEqual(cardSlugs(page), expected.slice(0, 8).map(product => product.slug), `${title} must only show its saved jewelry type`);
  if (!expected.length) {
    assert.match(page, /Nothing here yet/);
    assert.match(page, /href="\/showroom">Book a consultation<\/a>/);
  } else {
    assert.ok(page.includes(`role="status">${expected.length} pieces</p>`));
  }
}
for (const [slug, title, expected] of [
  ["sale", "Sale", [...catalog].sort((a, b) => a.usdPrice - b.usdPrice)],
  ["gifts", "Gifts", catalog.filter(product => product.category === "fine-jewelry")],
]) {
  const page = documentOnly(await (await get(`/collections/${slug}`)).text());
  assert.ok(page.includes(`<h1>${title}</h1>`));
  assert.deepEqual(cardSlugs(page), expected.slice(0, 8).map(product => product.slug), `${title} must render the correct products in order`);
  const count = page.match(/<p class="product-spec" role="status">([\s\S]*?)<\/p>/)?.[1].replace(/<!--.*?-->/g, "");
  assert.equal(count, `${expected.length} pieces`, `${title} must include the full matching catalogue`);
  if (slug === "sale") assert.match(page, /<option value="low" selected="">Price: low to high<\/option>/);
}
const looseStones = documentOnly(await (await get("/collections/loose-stones")).text());
assert.match(looseStones, /<h1>Loose Stones<\/h1>/);
assert.match(looseStones, /Certified &amp; ready to set/);
assert.match(looseStones, /Loose lab-grown diamonds for bespoke settings\./);
assert.match(looseStones, /Nothing here yet/);
assert.ok(decode(looseStones).includes("Our loose stones atelier is opening soon. Book a consultation and we'll source your stone."));
assert.match(looseStones, /href="\/showroom">Book a consultation<\/a>/);
assert.deepEqual(cardSlugs(looseStones), []);
assert.doesNotMatch(looseStones, /Clear filters|You have seen the full collection/);
const sitemap = await (await get("/sitemap.xml")).text();
for (const slug of ["sale", "loose-stones", "gifts", "earrings", "bracelets", "necklaces"]) assert.ok(sitemap.includes(`/collections/${slug}</loc>`));
await get("/collections/no-such-collection", 404);

// Check what localhost actually ships, including the CSS cascade and font files.
const stylesheetPaths = [...home.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*>/g)]
  .map(([tag]) => decode(tag.match(/href="([^"]+)"/)[1]));
assert.ok(stylesheetPaths.length > 0, "page must load its stylesheets");
const css = (await Promise.all(stylesheetPaths.map(async path => (await get(path)).text()))).join("\n");
const sheet = postcss.parse(css);
function declaration(selector, property) {
  let value;
  sheet.walkRules(rule => {
    if (rule.parent.type !== "root" || !rule.selectors.includes(selector)) return;
    rule.walkDecls(property, entry => { value = entry.value; });
  });
  return value;
}
function responsiveDeclaration(selector, property, width) {
  let value;
  sheet.walkRules(rule => {
    if (!rule.selectors.includes(selector)) return;
    for (let parent = rule.parent; parent; parent = parent.parent) {
      if (parent.type !== "atrule" || parent.name !== "media") continue;
      if (!/^\s*\((min|max)-width/.test(parent.params)) return;
      for (const [, bound, pixels] of parent.params.matchAll(/(min|max)-width:\s*(\d+)px/g)) {
        if (bound === "min" ? width < Number(pixels) : width > Number(pixels)) return;
      }
    }
    rule.walkDecls(property, entry => { value = entry.value; });
  });
  return value;
}
for (const [width, gap, spacing] of [[1024, "10px", .04], [1080, "10px", .04], [1280, "12px", .06], [1440, "22px", .08]]) {
  assert.equal(responsiveDeclaration(".desktop-nav", "gap", width), gap, `navigation gap at ${width}px`);
  assert.equal(parseFloat(responsiveDeclaration(".desktop-nav a", "letter-spacing", width)), spacing);
  assert.equal(responsiveDeclaration(".desktop-nav", "flex-wrap", width), "nowrap");
  assert.equal(responsiveDeclaration(".desktop-nav a", "white-space", width), "nowrap");
  assert.notEqual(responsiveDeclaration(".desktop-only", "display", width), "none");
}
assert.equal(responsiveDeclaration(".desktop-only", "display", 1023), "none");
assert.equal(responsiveDeclaration(".mobile-only", "display", 1023), "block");
for (const width of [1440, 1280, 1024, 768, 375]) {
  if (width > 1180) {
    assert.match(responsiveDeclaration(".style-grid", "grid-template-columns", width), /repeat\(5,\s*minmax\(0,\s*1fr\)\)/);
  } else {
    assert.equal(responsiveDeclaration(".style-grid", "grid-template-columns", width), "none");
    assert.equal(responsiveDeclaration(".style-grid", "grid-auto-flow", width), "column");
    assert.equal(responsiveDeclaration(".style-grid", "grid-auto-columns", width), "220px");
    assert.equal(responsiveDeclaration(".style-grid", "grid-template-rows", width), "auto");
    assert.equal(responsiveDeclaration(".style-grid", "overflow-x", width), "auto");
    assert.equal(responsiveDeclaration(".style-grid", "scroll-snap-type", width), "x mandatory");
  }
  assert.ok(["1", "1/1"].includes(responsiveDeclaration(".style-card-image", "aspect-ratio", width).replaceAll(" ", "")));
  assert.equal(responsiveDeclaration(".style-card img", "object-fit", width), "cover");
}
assert.equal(declaration(":root", "--cullen-linen").toUpperCase(), "#FDFBF7");
assert.equal(declaration(":root", "--cullen-forest").toUpperCase(), "#1B382B");
assert.equal(declaration("body", "background-color"), "var(--cullen-linen)");
assert.equal(declaration("body", "font-family"), "var(--sans)");
assert.equal(declaration("h1", "font-family"), "var(--display)");
assert.equal(declaration(".shell", "max-width"), "1320px");
assert.equal(declaration(".button", "border-radius"), "9999px");
assert.equal(declaration(".button", "height"), "52px");
assert.equal(declaration(".button:hover", "transform"), "translateY(-1.5px)");
assert.equal(declaration(".product-card:hover .product-image img", "transform"), "scale(1.04)");
assert.match(declaration(".product-image img", "transition"), /(?:0?\.7s|700ms)/);
assert.equal(declaration(".product-card.has-hover:hover .product-image-hover", "opacity"), "1");
assert.equal(declaration(".shape-card:hover", "transform"), "translateY(-3px)");
assert.equal(declaration(".metal-swatch", "width"), "14px");
assert.equal(declaration(".metal-swatch", "height"), "14px");
assert.equal(declaration(".footer", "background-color"), "var(--cullen-charcoal)");
assert.match(css, /prefers-reduced-motion:\s*reduce/);
assert.match(css, /min-width:\s*1024px/);
assert.match(declaration(":root", "--display"), /var\(--font-editorial\)/);
assert.match(declaration(":root", "--sans"), /var\(--font-ui\)/);
assert.equal(declaration(":root", "--heading-weight"), "350");
assert.equal(declaration(".review-card", "font-family"), "var(--sans)");
assert.equal(declaration(".review-card blockquote", "font-family"), "var(--sans)");
assert.equal(declaration(".review-card cite", "font-family"), "var(--sans)");
assert.doesNotMatch(css, /fonts\.googleapis\.com|fonts\.gstatic\.com|api\.fontshare\.com/);
const fontFiles = new Set();
sheet.walkAtRules("font-face", rule => {
  rule.walkDecls("src", entry => {
    for (const match of entry.value.matchAll(/url\(["']?([^"')]+\.woff2)["']?\)/g)) fontFiles.add(match[1]);
  });
});
assert.equal(fontFiles.size, 2, "exactly two local variable fonts must ship");
const { default: fontkitModule } = await import("next/dist/compiled/@next/font/dist/fontkit/index.js");
const loadFont = fontkitModule.default?.default ?? fontkitModule.default ?? fontkitModule;
const fontFamilies = [];
for (const fontFile of fontFiles) {
  const response = await get(fontFile);
  const bytes = Buffer.from(await response.arrayBuffer());
  assert.equal(bytes.subarray(0, 4).toString(), "wOF2", "font URL must serve a WOFF2 binary");
  const font = loadFont(bytes);
  fontFamilies.push(font.familyName);
  assert.ok(font.variationAxes.wght, "font must expose real variable weights");
}
assert.ok(fontFamilies.includes("Geist"));
assert.ok(fontFamilies.some(name => name.startsWith("Cormorant Garamond")));

const shapeLinks = [...home.matchAll(/<a\b[^>]*class="shape-card"[^>]*>[\s\S]*?<\/a>/g)].map(([tag]) => tag);
assert.equal(shapeLinks.length, 9, "all nine diamond silhouettes must render");
for (const link of shapeLinks) assert.match(link, /<svg\b/, "shape cards must use vector artwork");
const cards = [...home.matchAll(/<article class="product-card[^>]*>[\s\S]*?<\/article>/g)].map(([tag]) => tag);
assert.ok(cards.length > 0);
for (const card of cards) {
  assert.equal([...card.matchAll(/class="metal-swatch /g)].length, 4, "every product card needs four swatches");
  assert.match(card, /class="metal-swatch [^"]* active"/);
  assert.match(card, /\?metal=/);
  if (card.includes("has-hover")) assert.match(card, /class="product-image-hover"/);
}

// Each shape link must actually filter the returned collection, not just the UI.
for (const link of shapeLinks) {
  const href = decode(link.match(/href="([^"]+)"/)[1]);
  const shape = new URL(href, origin).searchParams.get("shape");
  const page = documentOnly(await (await get(href)).text());
  const expected = catalog.filter(product => product.category === "engagement" && product.shape === shape);
  const productCards = [...page.matchAll(/<article class="product-card[^>]*>[\s\S]*?<\/article>/g)].map(([tag]) => tag);
  assert.equal(productCards.length, Math.min(8, expected.length), `${shape} result count`);
  for (const card of productCards) {
    const slug = card.match(/href="\/products\/([^?"/]+)/)[1];
    assert.equal(catalog.find(product => product.slug === slug)?.shape, shape);
  }
  assert.match(page, /class="shape-card active" aria-pressed="true"/);
  if (!expected.length) assert.match(page, /No pieces match those details/);
}

const product = catalog[0];
for (const metal of ["18ct Yellow Gold", "18ct Rose Gold", "18ct White Gold", "Platinum"]) {
  const href = `/products/${product.slug}?${new URLSearchParams({ metal })}`;
  const page = documentOnly(await (await get(href)).text());
  const picker = page.match(/<div class="metal-swatches"[^>]*aria-label="Choose precious metal"[^>]*>([\s\S]*?)<\/div>/)?.[1];
  assert.ok(picker, "product page must render the metal picker");
  const selected = [...picker.matchAll(/<button\b[^>]*>/g)].map(([tag]) => tag).filter(tag => tag.includes('aria-pressed="true"'));
  assert.equal(selected.length, 1);
  assert.ok(selected[0].includes(`aria-label="${metal}"`), `${metal} must stay selected on the product page`);
}

for (const route of ["/collections/engagement", "/collections/wedding", "/collections/fine-jewelry", "/collections/ready-to-ship", "/cart", "/checkout", "/showroom", "/faq", "/blog", "/account", "/login", "/api/storefront/settings", "/api/storefront/navigation"]) await get(route);
const admin = await fetch(`${origin}/admin`, { redirect: "manual", signal: AbortSignal.timeout(30000) });
assert.ok([302, 303, 307, 308].includes(admin.status), "admin must still require sign-in");
assert.match(admin.headers.get("location"), /\/login/);
requests += 1;
console.log(`PASS: ${requests} HTTP checks; seven-item navigation, new collection selection and empty state, sitemap, Cullen CSS, typography, nine shape filters, four metal selections, storefront routes, and admin authentication.`);
