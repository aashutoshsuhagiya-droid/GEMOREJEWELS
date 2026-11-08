import assert from "node:assert/strict";
import postcss from "postcss";

const origin = "http://localhost:3000";
const decode = value => value.replaceAll("&amp;", "&").replaceAll("&#x27;", "'").replaceAll("&quot;", '"');
const documentOnly = html => html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, "");
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

// Check what the production server actually ships, including the CSS cascade.
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
assert.match(css, /--font-cormorant/);
assert.match(css, /--font-jost/);

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
console.log(`PASS: ${requests} HTTP checks; Cullen CSS, typography, nine shape filters, four metal selections, storefront routes, and admin authentication.`);
