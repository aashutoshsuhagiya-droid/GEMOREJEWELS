"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { AdminProduct, BlogPost, CraftStage, Discount, Faq, Order, RedirectRule, SeoAnalytics, SeoPage, SeoSite, StoreSettings } from "@/shared/admin-types";
import { siteUrl } from "@/shared/site-config";

function useResource<T>(resource: string) { const [data, setData] = useState<T[]>([]); const [loading, setLoading] = useState(true); const reload = useCallback(async () => { setLoading(true); const response = await fetch(`/api/admin/${resource}`); if (response.ok) setData(await response.json() as T[]); setLoading(false); }, [resource]); useEffect(() => { void reload(); }, [reload]); return { data, setData, loading, reload }; }
function useSingleResource<T>(resource: string) { const [data, setData] = useState<T | null>(null); const reload = useCallback(async () => { const response = await fetch(`/api/admin/${resource}`); if (response.ok) setData(await response.json() as T); }, [resource]); useEffect(() => { void reload(); }, [reload]); return { data, setData, reload }; }
async function save(resource: string, value: unknown) { const response = await fetch(`/api/admin/${resource}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ value }) }); if (!response.ok) throw new Error((await response.json()).error || "Save failed"); return response.json(); }
const money = (value: number) => `AUD $${value.toLocaleString("en-AU")}`;
function Notice({ value }: { value: string }) { return value ? <p className="mt-3 text-sm text-[#236339]">✓ {value}</p> : null; }

export function ConnectedProductsScreen() { const { data: products, setData, loading, reload } = useResource<AdminProduct>("products"); const [query, setQuery] = useState(""); const [selected, setSelected] = useState<string[]>([]); const [notice, setNotice] = useState(""); const visible = useMemo(() => products.filter(product => `${product.name} ${product.sku} ${product.collectionIds.join(" ")}`.toLowerCase().includes(query.toLowerCase())), [products, query]); async function update(product: AdminProduct, patch: Partial<AdminProduct>) { const next = { ...product, ...patch }; await save("products", next); setData(current => current.map(item => item.id === next.id ? next : item)); setNotice(`${next.name} updated`); } async function removeSelected() { if (!confirm(`Delete ${selected.length} product(s)?`)) return; await Promise.all(selected.map(id => fetch("/api/admin/products", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) }))); setData(current => current.filter(item => !selected.includes(item.id))); setSelected([]); setNotice("Selected products deleted"); } function exportCsv() { const rows = ["Name,SKU,Stock,Status,AUD,USD", ...visible.map(product => [product.name, product.sku, product.stock, product.status, product.priceAud, product.priceUsd].map(value => `"${String(value).replaceAll('"', '""')}"`).join(","))]; const blob = new Blob([rows.join("\n")], { type: "text/csv" }); const anchor = document.createElement("a"); anchor.href = URL.createObjectURL(blob); anchor.download = "gemoire-products.csv"; anchor.click(); URL.revokeObjectURL(anchor.href); setNotice("Product CSV downloaded"); } return <main className="mx-auto w-full max-w-[1440px] p-5 md:p-7"><div className="mb-6 flex flex-wrap items-end justify-between gap-3"><div><p className="text-[10px] font-semibold uppercase tracking-[.18em] text-[#737373]">Catalog</p><h1 className="mt-1 font-serif text-3xl text-[#253e2b]">Products</h1><p className="mt-1 text-sm text-[#737373]">{products.length} shared catalogue records, live on the storefront when published.</p></div><Link href="/admin/products/new" className="rounded-full bg-[#236339] px-4 py-2 text-xs font-medium text-white">New product</Link></div><div className="mb-4 flex flex-wrap gap-3"><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search name, collection or SKU" className="min-w-[240px] flex-1 rounded-full border border-[#d4d0cc] bg-white px-4 py-2 text-sm outline-none"/><button onClick={exportCsv} className="rounded-full border border-[#d4d0cc] bg-white px-4 py-2 text-xs">Export CSV</button><button onClick={reload} className="rounded-full border border-[#d4d0cc] bg-white px-4 py-2 text-xs">Refresh</button>{selected.length > 0 && <><button onClick={() => Promise.all(products.filter(product => selected.includes(product.id)).map(product => update(product, { status: "archived" })))} className="rounded-full border border-[#d4d0cc] px-4 py-2 text-xs">Archive</button><button onClick={removeSelected} className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-xs text-red-700">Delete</button></>}</div><section className="overflow-hidden rounded-md border border-[#e3e0dc] bg-white"><div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left text-sm"><thead className="bg-[#faf6ef] text-[10px] uppercase tracking-[.1em] text-[#737373]"><tr><th className="px-4 py-3"><input type="checkbox" checked={visible.length > 0 && visible.every(product => selected.includes(product.id))} onChange={event => setSelected(event.target.checked ? visible.map(product => product.id) : [])}/></th><th className="px-3 py-3">Product</th><th className="px-3 py-3">SKU</th><th className="px-3 py-3">Stock</th><th className="px-3 py-3">Price</th><th className="px-3 py-3">Rating</th><th className="px-3 py-3">Status</th><th className="px-4 py-3"/></tr></thead><tbody>{loading ? Array.from({ length: 6 }, (_, index) => <tr key={index} className="border-t border-[#eeeae5]"><td colSpan={8} className="p-4"><div className="h-5 animate-pulse rounded bg-[#f4efe9]"/></td></tr>) : visible.map(product => <tr key={product.id} className="border-t border-[#eeeae5] hover:bg-[#fcfbf9]"><td className="px-4 py-3"><input type="checkbox" checked={selected.includes(product.id)} onChange={() => setSelected(current => current.includes(product.id) ? current.filter(id => id !== product.id) : [...current, product.id])}/></td><td className="px-3 py-3"><div className="flex items-center gap-3"><img src={product.images[0]?.src} alt="" className="h-11 w-11 rounded-md object-cover"/><span><strong className="block text-[#253e2b]">{product.name}</strong><small className="text-[#737373]">{product.collectionIds.join(", ")}</small></span></div></td><td className="px-3 py-3 font-mono text-xs">{product.sku}</td><td className={`px-3 py-3 ${product.stock < 5 ? "text-red-600" : ""}`}><button onClick={() => update(product, { stock: Math.max(0, product.stock - 1) })} className="mr-2 rounded border px-1">−</button>{product.stock}<button onClick={() => update(product, { stock: product.stock + 1 })} className="ml-2 rounded border px-1">+</button>{product.stock < 5 && <small className="ml-2 rounded-full bg-red-50 px-2 py-1 text-[10px]">Low</small>}</td><td className="px-3 py-3"><span className="block">{money(product.priceAud)}</span><small className="text-[#737373]">USD ${product.priceUsd.toLocaleString()}</small></td><td className="px-3 py-3 text-[#c9a962]">★★★★★ <small className="text-[#737373]">{product.rating}</small></td><td className="px-3 py-3"><select value={product.status} onChange={event => update(product, { status: event.target.value as AdminProduct["status"] })} className="rounded-full border border-[#d4d0cc] bg-white px-2 py-1 text-[11px]"><option value="active">Active</option><option value="draft">Draft</option><option value="archived">Archived</option></select></td><td className="px-4 py-3"><Link href={`/admin/products/${product.slug}`} className="text-xs text-[#236339] underline">Edit</Link></td></tr>)}</tbody></table></div></section><Notice value={notice}/></main>; }

export function ConnectedDiscountsScreen() { const { data, setData, reload } = useResource<Discount>("discounts"); const [code, setCode] = useState("GEMOIRE-10"); const [type, setType] = useState<Discount["type"]>("percentage"); const [value, setValue] = useState("10"); const [notice, setNotice] = useState(""); async function create(event: FormEvent) { event.preventDefault(); const discount: Discount = { id: `discount-${Date.now()}`, code: code.toUpperCase(), type, value: Number(value), scope: "sitewide", expiresAt: "2026-12-31", usageCount: 0, usageCap: 100, status: "active" }; await save("discounts", discount); setData(current => [discount, ...current]); setNotice(`${discount.code} is live on the storefront.`); } async function copy(item: Discount) { await navigator.clipboard.writeText(item.code); setNotice(`${item.code} copied to clipboard`); } return <main className="mx-auto max-w-[1280px] p-5 md:p-7"><p className="text-[10px] font-semibold uppercase tracking-[.18em] text-[#737373]">Marketing</p><h1 className="mt-1 font-serif text-3xl text-[#253e2b]">Discounts</h1><div className="mt-6 grid gap-5 lg:grid-cols-[.85fr_1.15fr]"><form onSubmit={create} className="rounded-md border border-[#e3e0dc] bg-white p-5"><h2 className="font-serif text-2xl">New discount</h2><label className="mt-4 block text-xs">Code<input required value={code} onChange={event => setCode(event.target.value.toUpperCase())} className="mt-1 w-full rounded-md border p-2"/></label><div className="mt-4 flex gap-2">{(["percentage", "fixed", "shipping"] as const).map(item => <button key={item} type="button" onClick={() => setType(item)} className={`rounded-full px-3 py-2 text-xs ${type === item ? "bg-[#236339] text-white" : "border"}`}>{item === "shipping" ? "Free shipping" : item}</button>)}</div>{type !== "shipping" && <label className="mt-4 block text-xs">Value<input type="number" value={value} onChange={event => setValue(event.target.value)} className="mt-1 w-full rounded-md border p-2"/></label>}<button className="mt-5 rounded-full bg-[#236339] px-4 py-2 text-xs text-white">Create discount</button></form><section className="overflow-hidden rounded-md border border-[#e3e0dc] bg-white"><table className="w-full text-left text-sm"><thead className="bg-[#faf6ef] text-[10px] uppercase tracking-[.1em] text-[#737373]"><tr><th className="p-3">Code</th><th>Type</th><th>Value</th><th>Usage</th><th/></tr></thead><tbody>{data.map(item => <tr key={item.id} className="border-t"><td className="p-3 font-mono">{item.code}</td><td>{item.type}</td><td>{item.type === "percentage" ? `${item.value}%` : item.type === "fixed" ? money(item.value) : "Free shipping"}</td><td>{item.usageCount}/{item.usageCap}</td><td><button onClick={() => copy(item)} className="text-xs text-[#236339] underline">Copy</button></td></tr>)}</tbody></table><button onClick={reload} className="m-3 text-xs text-[#236339] underline">Refresh</button></section></div><Notice value={notice}/></main>; }

export function ConnectedSettingsScreen() { const { data: settings, setData } = useSingleResource<StoreSettings>("settings"); const [notice, setNotice] = useState(""); const [newCity, setNewCity] = useState(""); if (!settings) return <main className="p-7">Loading settings…</main>; async function persist(next: StoreSettings) { await save("settings", next); setData(next); setNotice("Saved ✓ storefront settings refreshed."); } return <main className="mx-auto max-w-[1000px] p-5 md:p-7"><p className="text-[10px] font-semibold uppercase tracking-[.18em] text-[#737373]">System</p><h1 className="mt-1 font-serif text-3xl text-[#253e2b]">Settings</h1><div className="mt-6 grid gap-5"><section className="rounded-md border border-[#e3e0dc] bg-white p-5"><h2 className="font-serif text-2xl">General & shipping</h2><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="text-xs">Store name<input value={settings.storeName} onChange={event => setData({ ...settings, storeName: event.target.value })} className="mt-1 w-full rounded-md border p-2"/></label><label className="text-xs">Free-ship threshold (AUD)<input type="number" value={settings.freeShippingThreshold} onChange={event => setData({ ...settings, freeShippingThreshold: Number(event.target.value) })} className="mt-1 w-full rounded-md border p-2"/></label><label className="text-xs">Locale<input value={settings.locale} onChange={event => setData({ ...settings, locale: event.target.value })} className="mt-1 w-full rounded-md border p-2"/></label><label className="text-xs">Timezone<input value={settings.timezone} onChange={event => setData({ ...settings, timezone: event.target.value })} className="mt-1 w-full rounded-md border p-2"/></label></div><button onClick={() => persist(settings)} className="mt-5 rounded-full bg-[#236339] px-4 py-2 text-xs text-white">Save settings</button></section><section className="rounded-md border border-[#e3e0dc] bg-white p-5"><h2 className="font-serif text-2xl">Billing</h2><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="text-xs">Invoice prefix<input value={settings.billing.prefix} onChange={event => setData({ ...settings, billing: { ...settings.billing, prefix: event.target.value } })} className="mt-1 w-full rounded-md border p-2"/></label><label className="text-xs">GST rate<input type="number" value={settings.billing.gstRate} onChange={event => setData({ ...settings, billing: { ...settings.billing, gstRate: Number(event.target.value) } })} className="mt-1 w-full rounded-md border p-2"/></label><label className="text-xs">GSTIN<input value={settings.billing.gstin} onChange={event => setData({ ...settings, billing: { ...settings.billing, gstin: event.target.value } })} className="mt-1 w-full rounded-md border p-2"/></label><label className="text-xs">CIN<input value={settings.billing.cin} onChange={event => setData({ ...settings, billing: { ...settings.billing, cin: event.target.value } })} className="mt-1 w-full rounded-md border p-2"/></label></div><label className="mt-4 flex items-center gap-2 text-sm"><input type="checkbox" checked={settings.billing.autoEmail} onChange={event => setData({ ...settings, billing: { ...settings.billing, autoEmail: event.target.checked } })}/> Auto-email invoice on payment</label><button onClick={() => persist(settings)} className="mt-5 rounded-full bg-[#236339] px-4 py-2 text-xs text-white">Save billing</button></section><section className="rounded-md border border-[#e3e0dc] bg-white p-5"><h2 className="font-serif text-2xl">Showrooms & AR try-on</h2><div className="mt-4 space-y-2">{settings.cities.map((city, index) => <div className="flex gap-2" key={`${city}-${index}`}><input value={city} onChange={event => setData({ ...settings, cities: settings.cities.map((item, position) => position === index ? event.target.value : item) })} className="min-w-0 flex-1 rounded-md border p-2"/><button onClick={() => setData({ ...settings, cities: settings.cities.filter((_, position) => position !== index) })} className="rounded border px-3 text-xs text-red-700">Remove</button></div>)}</div><div className="mt-3 flex gap-2"><input value={newCity} onChange={event => setNewCity(event.target.value)} placeholder="Add city" className="min-w-0 flex-1 rounded-md border p-2"/><button onClick={() => { if (newCity.trim()) { setData({ ...settings, cities: [...settings.cities, newCity.trim()] }); setNewCity(""); } }} className="rounded border px-3 text-xs">Add</button></div><label className="mt-4 flex items-center gap-2 text-sm"><input type="checkbox" checked={settings.arEnabled} onChange={event => setData({ ...settings, arEnabled: event.target.checked })}/> Enable PDP AR try-on</label><label className="mt-3 block text-xs">AR waitlist note<textarea value={settings.arNote} onChange={event => setData({ ...settings, arNote: event.target.value })} className="mt-1 w-full rounded-md border p-2"/></label><button onClick={() => persist(settings)} className="mt-5 rounded-full bg-[#236339] px-4 py-2 text-xs text-white">Save storefront extras</button></section></div><Notice value={notice}/></main>; }

export function ConnectedCraftScreen() { const { data: orders, setData: setOrders } = useResource<Order>("orders"); const { data: craft, setData: setCraft } = useResource<CraftStage>("craft"); const [notice, setNotice] = useState(""); async function advance(order: Order) { const current = craft.find(item => item.orderId === order.id) ?? { id: order.id, orderId: order.id, stage: order.craftStage, dates: [], expectedDates: [] }; const stage = Math.min(3, current.stage + 1) as CraftStage["stage"]; const next = { ...current, stage, dates: [...current.dates, new Date().toISOString()] }; const changedOrder = { ...order, craftStage: stage }; await Promise.all([save("craft", next), save("orders", changedOrder)]); setCraft(items => items.some(item => item.orderId === order.id) ? items.map(item => item.orderId === order.id ? next : item) : [...items, next]); setOrders(items => items.map(item => item.id === order.id ? changedOrder : item)); setNotice(`${order.code} advanced to ${["Design", "Crafting", "Certified", "Dispatch"][stage]}. Storefront tracker updated.`); } return <main className="mx-auto max-w-[1320px] p-5 md:p-7"><p className="text-[10px] font-semibold uppercase tracking-[.18em] text-[#737373]">GEMOIRE extras</p><h1 className="mt-1 font-serif text-3xl text-[#253e2b]">Craft Tracker</h1><div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">{([0, 1, 2, 3] as const).map(stage => <section key={stage} className="rounded-md border border-[#e3e0dc] bg-white p-4"><h2 className="font-serif text-xl">{["Designed", "Crafting", "Certified", "Shipped"][stage]}</h2><p className="mt-1 text-xs text-[#737373]">{orders.filter(order => order.craftStage === stage).length} orders</p><div className="mt-4 space-y-2">{orders.filter(order => order.craftStage === stage).slice(0, 8).map(order => <div className="rounded border border-[#e3e0dc] p-3" key={order.id}><strong className="block text-xs">{order.code}</strong><small className="text-[#737373]">Expected {craft.find(item => item.orderId === order.id)?.expectedDates[stage]?.slice(0, 10) ?? "TBC"}</small>{stage < 3 && <button onClick={() => advance(order)} className="mt-2 text-xs text-[#236339] underline">Advance stage</button>}</div>)}</div></section>)}</div><Notice value={notice}/></main>; }

export function ConnectedFaqScreen() { const { data, setData } = useResource<Faq>("faqs"); const [newQuestion, setNewQuestion] = useState(""); const [notice, setNotice] = useState(""); async function persist(item: Faq) { await save("faqs", item); setData(current => current.some(value => value.id === item.id) ? current.map(value => value.id === item.id ? item : value) : [...current, item]); setNotice("FAQ saved to storefront"); } return <main className="mx-auto max-w-[1000px] p-5 md:p-7"><p className="text-[10px] font-semibold uppercase tracking-[.18em] text-[#737373]">Content</p><h1 className="mt-1 font-serif text-3xl text-[#253e2b]">FAQs</h1><div className="mt-6 space-y-3">{data.sort((a, b) => a.position - b.position).map(item => <section className="rounded-md border border-[#e3e0dc] bg-white p-4" key={item.id}><input value={item.question} onChange={event => setData(current => current.map(value => value.id === item.id ? { ...value, question: event.target.value } : value))} className="w-full border-0 text-lg font-medium outline-none"/><textarea value={item.answer} onChange={event => setData(current => current.map(value => value.id === item.id ? { ...value, answer: event.target.value } : value))} className="mt-3 min-h-20 w-full rounded border p-2 text-sm"/><div className="mt-3 flex gap-2"><label className="text-xs"><input type="checkbox" checked={item.published} onChange={event => setData(current => current.map(value => value.id === item.id ? { ...value, published: event.target.checked } : value))}/> Published</label><button onClick={() => persist(item)} className="text-xs text-[#236339] underline">Save</button><button onClick={async () => { await fetch("/api/admin/faqs", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: item.id }) }); setData(current => current.filter(value => value.id !== item.id)); }} className="text-xs text-red-700 underline">Delete</button></div></section>)}</div><div className="mt-5 flex gap-2"><input value={newQuestion} onChange={event => setNewQuestion(event.target.value)} placeholder="New question" className="min-w-0 flex-1 rounded border p-2"/><button onClick={() => { if (!newQuestion.trim()) return; void persist({ id: `faq-${Date.now()}`, question: newQuestion, answer: "Add a clear answer for your clients.", position: data.length, published: true }); setNewQuestion(""); }} className="rounded-full bg-[#236339] px-4 text-xs text-white">Add FAQ</button></div><Notice value={notice}/></main>; }

type SeoTab = "Pages" | "Site-wide" | "Sitemap & Robots" | "Redirects" | "Analytics";

export function ConnectedSeoScreen() {
  const { data: pages, setData: setPages } = useResource<SeoPage>("seoPages");
  const { data: site, setData: setSite } = useSingleResource<SeoSite>("seo-site");
  const { data: redirects, setData: setRedirects } = useResource<RedirectRule>("redirects");
  const { data: blogPosts } = useResource<BlogPost>("blog");
  const { data: products } = useResource<AdminProduct>("products");
  const [selected, setSelected] = useState("");
  const [tab, setTab] = useState<SeoTab>("Pages");
  const [notice, setNotice] = useState("");
  const [sourceOpen, setSourceOpen] = useState(false);
  const [renderedSource, setRenderedSource] = useState("");
  const current = pages.find(page => page.id === selected) ?? pages[0];
  const completePages = pages.filter(page => page.title.length > 0 && page.title.length <= 60 && page.description.length > 0 && page.description.length <= 160 && page.canonical.startsWith("http") && Boolean(page.ogImage));
  const health = pages.length ? Math.round(completePages.length / pages.length * 100) : 0;
  const activeProductSlugs = new Set(products.filter(product => product.status === "active").map(product => product.slug));
  const published = pages.filter(page => page.status === "published" && (page.pageType !== "product" || activeProductSlugs.has(page.slug.replace(/^\/products\//, ""))));
  const publishedPosts = blogPosts.filter(post => post.status === "published");
  const sitemapPaths = [...new Set([...published.map(page => page.slug), ...(publishedPosts.length ? ["/blog"] : []), ...publishedPosts.map(post => `/blog/${post.slug}`)])];
  const invalidSitemapPaths = sitemapPaths.filter(path => !path.startsWith("/"));
  const sitemapXml = ["<?xml version=\"1.0\" encoding=\"UTF-8\"?>", "<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">", ...sitemapPaths.map(path => "  <url><loc>" + siteUrl(path) + "</loc></url>"), "</urlset>"].join("\n");
  const robotsPreview = ["User-agent: *", "Allow: /", "Disallow: /admin", "Disallow: /api", "Sitemap: " + siteUrl("/sitemap.xml")].join("\n");

  function patchCurrent(patch: Partial<SeoPage>) {
    if (!current) return;
    setPages(items => items.map(item => item.id === current.id ? { ...item, ...patch } : item));
  }

  async function savePage() {
    if (!current) return;
    try {
      await save("seoPages", current);
      setNotice("SEO record saved. Refresh the storefront source to verify it.");
    } catch (error) {
      setNotice("Error: " + (error instanceof Error ? error.message : "SEO record could not save."));
    }
  }

  async function saveSite() {
    if (!site) return;
    try {
      await save("seo-site", site);
      setNotice("Site-wide metadata and structured-data toggles saved.");
    } catch (error) {
      setNotice("Error: " + (error instanceof Error ? error.message : "Site settings could not save."));
    }
  }

  async function regenerate() {
    if (!site) return;
    const next = { ...site, lastGenerated: new Date().toISOString() };
    try {
      await save("seo-site", next);
      setSite(next);
      setNotice("Sitemap regenerated from published repository records.");
    } catch (error) {
      setNotice("Error: " + (error instanceof Error ? error.message : "Sitemap could not regenerate."));
    }
  }

  async function toggleRenderedSource() {
    if (sourceOpen) {
      setSourceOpen(false);
      return;
    }
    setSourceOpen(true);
    setRenderedSource("Loading the saved storefront output…");
    const response = await fetch("/api/admin/seo-source?path=" + encodeURIComponent(current?.slug || "/"));
    const result = await response.json().catch(() => ({ error: "Rendered source could not load." })) as { error?: string } & Record<string, unknown>;
    setRenderedSource(response.ok ? JSON.stringify(result, null, 2) : result.error || "Rendered source could not load.");
  }

  async function addRedirect(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const clean = (value: FormDataEntryValue | null) => String(value ?? "").trim().replace(/\/{2,}/g, "/");
    const item: RedirectRule = {
      id: "redirect-" + Date.now(),
      from: clean(form.get("from")),
      to: clean(form.get("to")),
      type: Number(form.get("type")) as 301 | 302,
      hits: 0,
      active: true,
    };
    if (!item.from.startsWith("/") || !item.to.startsWith("/")) {
      setNotice("Error: redirects must use internal paths beginning with /.");
      return;
    }
    if (redirects.some(rule => rule.from === item.from)) {
      setNotice("Error: duplicate source URL. Choose a unique source.");
      return;
    }
    try {
      const saved = await save("redirects", item) as RedirectRule;
      setRedirects(items => [...items, saved]);
      event.currentTarget.reset();
      setNotice("Redirect saved. The Test action now resolves through the live route.");
    } catch (error) {
      setNotice("Error: " + (error instanceof Error ? error.message : "Redirect could not save."));
    }
  }

  async function updateRedirect(rule: RedirectRule, patch: Partial<RedirectRule>) {
    const next = { ...rule, ...patch };
    try {
      const saved = await save("redirects", next) as RedirectRule;
      setRedirects(items => items.map(item => item.id === rule.id ? saved : item));
      setNotice("Redirect updated.");
    } catch (error) {
      setNotice("Error: " + (error instanceof Error ? error.message : "Redirect could not update."));
    }
  }

  async function removeRedirect(rule: RedirectRule) {
    if (!window.confirm("Delete redirect " + rule.from + "?")) return;
    const response = await fetch("/api/admin/redirects", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: rule.id }) });
    if (!response.ok) {
      setNotice("Error: redirect could not be deleted.");
      return;
    }
    setRedirects(items => items.filter(item => item.id !== rule.id));
    setNotice("Redirect deleted.");
  }

  const titleHealthy = Boolean(current && current.title.length > 0 && current.title.length <= 60);
  const descriptionHealthy = Boolean(current && current.description.length > 0 && current.description.length <= 160);
  return <main className="mx-auto max-w-[1250px] p-5 md:p-7">
    <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-[#737373]">Marketing</p>
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div><h1 className="mt-1 font-serif text-3xl text-[#253e2b]">SEO & Analytics</h1><p className="mt-1 text-sm text-[#737373]">Metadata, discovery routes and search health backed by the shared repository.</p></div>
      <div className="min-w-48"><div className="h-2 overflow-hidden rounded bg-[#e3e0dc]"><span className={(health >= 90 ? "bg-[#236339]" : health >= 60 ? "bg-[#c9a962]" : "bg-red-500") + " block h-full"} style={{ width: String(health) + "%" }}/></div><p className="mt-1 text-right text-xs text-[#737373]">SEO health {health}%</p></div>
    </div>

    <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="SEO console sections">
      {(["Pages", "Site-wide", "Sitemap & Robots", "Redirects", "Analytics"] as const).map(item => <button type="button" aria-pressed={tab === item} key={item} onClick={() => setTab(item)} className={"rounded-full px-3 py-2 text-xs " + (tab === item ? "bg-[#236339] text-white" : "border border-[#d4d0cc] bg-white")}>{item}</button>)}
    </div>

    {tab === "Pages" && current ? <section className="mt-5 grid gap-5 lg:grid-cols-[280px_1fr]">
      <aside className="max-h-[720px] overflow-y-auto rounded-md border bg-white p-3" aria-label="SEO pages">
        {pages.map(page => {
          const incomplete = !page.description || page.title.length > 60 || page.description.length > 160;
          return <button type="button" key={page.id} onClick={() => setSelected(page.id)} className={"block w-full rounded px-3 py-2 text-left text-xs " + (current.id === page.id ? "bg-[#eef5ef] text-[#236339]" : "")}>
            <span className="block truncate font-mono">{page.slug}</span>
            <span className="mt-1 flex gap-1">{page.status === "draft" ? <span className="rounded bg-[#f3f1ee] px-1 text-[#737373]">draft</span> : null}{incomplete ? <span className="rounded bg-red-50 px-1 text-red-700">needs attention</span> : null}</span>
          </button>;
        })}
      </aside>
      <div className="rounded-md border bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="font-serif text-2xl text-[#253e2b]">{current.pageType} metadata</h2>{current.pageType === "product" ? <Link href={"/admin/products/" + current.slug.replace(/^\/products\//, "")} className="text-xs text-[#236339] underline">Open product editor</Link> : null}</div>
        <label className={"mt-4 block text-xs " + (titleHealthy ? "text-[#236339]" : "text-red-700")}>Meta title ({current.title.length}/60)<input value={current.title} onChange={event => patchCurrent({ title: event.target.value })} className="mt-1 w-full rounded border border-[#d4d0cc] p-2 text-[#232323]"/></label>
        <label className={"mt-4 block text-xs " + (descriptionHealthy ? "text-[#236339]" : "text-red-700")}>Meta description ({current.description.length}/160)<textarea value={current.description} onChange={event => patchCurrent({ description: event.target.value })} className="mt-1 min-h-24 w-full rounded border border-[#d4d0cc] p-2 text-[#232323]"/></label>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="block text-xs">Canonical URL<input value={current.canonical} onChange={event => patchCurrent({ canonical: event.target.value })} className="mt-1 w-full rounded border border-[#d4d0cc] p-2"/></label>
          <label className="block text-xs">Open Graph image<input value={current.ogImage} onChange={event => patchCurrent({ ogImage: event.target.value })} className="mt-1 w-full rounded border border-[#d4d0cc] p-2"/></label>
          <label className="block text-xs">JSON-LD type<select value={current.jsonLdType} onChange={event => patchCurrent({ jsonLdType: event.target.value as SeoPage["jsonLdType"] })} className="mt-1 w-full rounded border border-[#d4d0cc] bg-white p-2">{(["WebSite", "Product", "FAQPage", "Event", "Article"] as const).map(type => <option key={type}>{type}</option>)}</select></label>
          <label className="block text-xs">Publishing<select value={current.status} onChange={event => patchCurrent({ status: event.target.value as SeoPage["status"] })} className="mt-1 w-full rounded border border-[#d4d0cc] bg-white p-2"><option value="published">Published</option><option value="draft">Draft</option></select></label>
        </div>
        <button type="button" onClick={() => void savePage()} className="mt-5 rounded-full bg-[#236339] px-4 py-2 text-xs text-white">Save page SEO</button>
        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          <article className="rounded-md border border-[#e3e0dc] p-4"><small className="text-[#737373]">Google SERP preview</small><p className="mt-2 truncate text-xs text-[#236339]">{current.canonical}</p><strong className="mt-1 block text-lg font-medium text-[#2455a4]">{current.title || "Untitled page"}</strong><p className="mt-1 text-xs leading-5 text-[#5f5a55]">{current.description || "Add a meta description to complete this search result."}</p></article>
          <article className="overflow-hidden rounded-md border border-[#e3e0dc]"><div className="aspect-[1.91/1] bg-[#253e2b] bg-cover bg-center" style={{ backgroundImage: current.ogImage ? "linear-gradient(0deg,rgba(0,0,0,.62),rgba(0,0,0,.05)),url('" + current.ogImage.replaceAll("'", "%27") + "')" : undefined }}><div className="flex h-full flex-col justify-end p-4 text-white"><small>{site?.defaultOg.siteName}</small><strong className="mt-1 text-lg">{current.title || "Social card title"}</strong><span className="mt-1 line-clamp-2 text-xs text-white/80">{current.description}</span></div></div></article>
        </div>
      </div>
    </section> : null}

    {tab === "Site-wide" && site ? <section className="mt-5 rounded-md border bg-white p-5">
      <h2 className="font-serif text-2xl text-[#253e2b]">Site-wide defaults</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <label className="block text-xs">Title template<input value={site.titleTemplate} onChange={event => setSite({ ...site, titleTemplate: event.target.value })} className="mt-1 w-full rounded border border-[#d4d0cc] p-2"/></label>
        <label className="block text-xs">Default OG image<input value={site.defaultOg.image} onChange={event => setSite({ ...site, defaultOg: { ...site.defaultOg, image: event.target.value } })} className="mt-1 w-full rounded border border-[#d4d0cc] p-2"/></label>
        <label className="block text-xs">Account / site name<input value={site.defaultOg.siteName} onChange={event => setSite({ ...site, defaultOg: { ...site.defaultOg, siteName: event.target.value } })} className="mt-1 w-full rounded border border-[#d4d0cc] p-2"/></label>
        <label className="block text-xs">Social fallback description<textarea value={site.defaultOg.description} onChange={event => setSite({ ...site, defaultOg: { ...site.defaultOg, description: event.target.value } })} className="mt-1 min-h-20 w-full rounded border border-[#d4d0cc] p-2"/></label>
      </div>
      <div className="mt-5 grid gap-2 sm:grid-cols-3">{(["product", "faq", "breadcrumbs"] as const).map(key => <label className="flex items-center gap-2 rounded-md bg-[#faf6ef] p-3 text-sm" key={key}><input type="checkbox" checked={site.structuredData[key]} onChange={event => setSite({ ...site, structuredData: { ...site.structuredData, [key]: event.target.checked } })}/> {key} schema</label>)}</div>
      <div className="mt-5 flex flex-wrap gap-2"><button type="button" onClick={() => void saveSite()} className="rounded-full bg-[#236339] px-4 py-2 text-xs text-white">Save site-wide SEO</button><button type="button" onClick={() => void toggleRenderedSource()} className="rounded-full border border-[#d4d0cc] px-4 py-2 text-xs text-[#236339]">{sourceOpen ? "Hide rendered source" : "View rendered source"}</button></div>
      {sourceOpen ? <pre className="mt-4 max-h-80 overflow-auto rounded-md bg-[#253e2b] p-4 text-xs text-white">{renderedSource}</pre> : null}
    </section> : null}

    {tab === "Sitemap & Robots" ? <section className="mt-5 rounded-md border bg-white p-5">
      <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="font-serif text-2xl text-[#253e2b]">Live discovery routes</h2><p className="mt-1 text-xs text-[#737373]">Last generated {site?.lastGenerated ? new Date(site.lastGenerated).toLocaleString("en-AU") : "not yet"}</p></div><button type="button" onClick={() => void regenerate()} className="rounded-full border border-[#d4d0cc] px-4 py-2 text-xs text-[#236339]">Regenerate</button></div>
      {invalidSitemapPaths.length ? <p className="mt-4 rounded-md bg-red-50 p-3 text-xs text-red-700">{invalidSitemapPaths.length} published route(s) have invalid paths and need correction.</p> : <p className="mt-4 rounded-md bg-[#eef5ef] p-3 text-xs text-[#236339]">All {sitemapPaths.length} published routes have valid sitemap paths.</p>}
      <div className="mt-4 grid gap-4 lg:grid-cols-2"><div><h3 className="text-xs font-semibold uppercase tracking-[.12em] text-[#737373]">/sitemap.xml</h3><pre className="mt-2 max-h-96 overflow-auto rounded bg-[#253e2b] p-4 text-[11px] text-white">{sitemapXml}</pre></div><div><h3 className="text-xs font-semibold uppercase tracking-[.12em] text-[#737373]">/robots.txt</h3><pre className="mt-2 overflow-auto rounded bg-[#253e2b] p-4 text-[11px] text-white">{robotsPreview}</pre></div></div>
    </section> : null}

    {tab === "Redirects" ? <section className="mt-5 grid gap-5 lg:grid-cols-[.8fr_1.2fr]">
      <form onSubmit={addRedirect} className="rounded-md border bg-white p-5"><h2 className="font-serif text-2xl text-[#253e2b]">New redirect</h2><label className="mt-4 block text-xs">Source<input name="from" placeholder="/old-url" required className="mt-1 w-full rounded border border-[#d4d0cc] p-2"/></label><label className="mt-3 block text-xs">Destination<input name="to" placeholder="/new-url" required className="mt-1 w-full rounded border border-[#d4d0cc] p-2"/></label><select name="type" className="mt-3 rounded border border-[#d4d0cc] bg-white p-2 text-xs"><option value="301">301 permanent</option><option value="302">302 temporary</option></select><button type="submit" className="ml-2 rounded-full bg-[#236339] px-4 py-2 text-xs text-white">Add redirect</button></form>
      <div className="overflow-hidden rounded-md border bg-white">{redirects.length ? redirects.map(rule => <div key={rule.id} className="flex flex-wrap items-center justify-between gap-3 border-b p-4 text-sm"><div><span className="block font-mono text-xs">{rule.from} → {rule.to}</span><span className="mt-1 block text-[11px] text-[#737373]">{rule.type} · {rule.hits} hits · {rule.active ? "active" : "paused"}</span></div><div className="flex items-center gap-2"><label className="text-[11px] text-[#737373]"><input type="checkbox" checked={rule.active} onChange={event => void updateRedirect(rule, { active: event.target.checked })}/> Active</label><a href={"/api/test-redirect?from=" + encodeURIComponent(rule.from)} target="_blank" rel="noreferrer" className="text-xs text-[#236339] underline">Test</a><button type="button" onClick={() => void removeRedirect(rule)} className="text-xs text-red-700 underline">Delete</button></div></div>) : <p className="p-8 text-center text-sm text-[#737373]">No redirects yet.</p>}</div>
    </section> : null}

    {tab === "Analytics" ? <SeoAnalyticsPanel health={health} structuredCoverage={site ? Object.values(site.structuredData).filter(Boolean).length / 3 : 0} redirects={redirects}/> : null}
    <Notice value={notice}/>
  </main>;
}

function SeoAnalyticsPanel({ health, structuredCoverage, redirects }: { health: number; structuredCoverage: number; redirects: RedirectRule[] }) {
  const { data: analytics } = useSingleResource<SeoAnalytics>("seo-analytics");
  const score = Math.round(health * .6 + structuredCoverage * 30 + (redirects.some(rule => rule.active) ? 10 : 5));

  function exportCsv() {
    if (!analytics) return;
    const rows = ["Term,Clicks,CTR,Position,Trend", ...analytics.topTerms.map(term => [term.term, term.clicks, term.ctr, term.position, term.trend].map(value => "\"" + String(value).replaceAll("\"", "\"\"") + "\"").join(","))];
    const url = URL.createObjectURL(new Blob([rows.join("\n")], { type: "text/csv" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "gemoire-seo-analytics.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  const vitalPass = (key: keyof SeoAnalytics["vitals"], value: number) => key === "LCP" ? value <= 2.5 : key === "CLS" ? value <= .1 : value <= 200;
  if (!analytics) return <section className="mt-5 grid gap-4 lg:grid-cols-2">{Array.from({ length: 4 }, (_, index) => <div key={index} className="h-40 animate-pulse rounded-md bg-[#f4efe9]"/>)}</section>;

  return <section className="mt-5 grid gap-5 lg:grid-cols-2">
    <div className="rounded-md border bg-white p-5"><div className="flex items-center justify-between"><h2 className="font-serif text-2xl text-[#253e2b]">Top search terms</h2><button type="button" onClick={exportCsv} className="text-xs text-[#236339] underline">Export CSV</button></div><div className="mt-4 overflow-x-auto"><table className="w-full text-left text-xs"><thead className="text-[10px] uppercase tracking-[.1em] text-[#737373]"><tr><th className="py-2">Term</th><th>Clicks</th><th>CTR</th><th>Position</th><th>Trend</th></tr></thead><tbody>{analytics.topTerms.map(term => <tr className="border-t" key={term.term}><td className="py-3">{term.term}</td><td>{term.clicks}</td><td>{term.ctr}%</td><td>{term.position}</td><td className={term.trend === "up" ? "text-[#236339]" : "text-red-700"}>{term.trend === "up" ? "↑" : "↓"}</td></tr>)}</tbody></table></div></div>
    <div className="rounded-md border bg-white p-5"><h2 className="font-serif text-2xl text-[#253e2b]">SEO score</h2><div className="mt-4 flex items-center gap-6"><div className="grid h-32 w-32 shrink-0 place-items-center rounded-full" style={{ background: "conic-gradient(#236339 " + score + "%, #e3e0dc 0)" }}><div className="grid h-24 w-24 place-items-center rounded-full bg-white text-center"><strong className="text-3xl text-[#253e2b]">{score}</strong><small className="block text-[#737373]">of 100</small></div></div><div className="text-xs leading-6 text-[#5f5a55]"><p>Metadata health: {health}%</p><p>Schema coverage: {Math.round(structuredCoverage * 100)}%</p><p>Active redirects: {redirects.filter(rule => rule.active).length}</p></div></div></div>
    <div className="rounded-md border bg-white p-5"><h2 className="font-serif text-2xl text-[#253e2b]">Top landing pages</h2>{analytics.landingPages.map(page => <div className="mt-3 flex items-center justify-between border-b pb-3 text-xs" key={page.page}><span className="font-mono">{page.page}</span><span className="text-[#737373]">{page.clicks} clicks · {page.impressions} impressions</span></div>)}</div>
    <div className="rounded-md border bg-white p-5"><h2 className="font-serif text-2xl text-[#253e2b]">Crawl status</h2><div className="mt-4 grid grid-cols-3 gap-3 text-center"><div className="rounded bg-[#eef5ef] p-3"><strong className="block text-xl text-[#236339]">98%</strong><small>bot coverage</small></div><div className="rounded bg-[#faf6ef] p-3"><strong className="block text-xl text-[#80631c]">{analytics.orphanedPages}</strong><small>orphaned</small></div><div className="rounded bg-red-50 p-3"><strong className="block text-xl text-red-700">{analytics.notFoundClicks}</strong><small>404 clicks</small></div></div></div>
    <div className="rounded-md border bg-white p-5 lg:col-span-2"><h2 className="font-serif text-2xl text-[#253e2b]">Core Web Vitals</h2><div className="mt-4 grid gap-3 sm:grid-cols-3">{(Object.entries(analytics.vitals) as Array<[keyof SeoAnalytics["vitals"], number]>).map(([key, value]) => { const pass = vitalPass(key, value); return <div className={"rounded p-4 text-center " + (pass ? "bg-[#eef5ef]" : "bg-red-50")} key={key}><strong className={"block text-xl " + (pass ? "text-[#236339]" : "text-red-700")}>{value}{key === "CLS" ? "" : key === "LCP" ? "s" : "ms"}</strong><small>{key} · {pass ? "pass" : "needs work"}</small></div>; })}</div></div>
  </section>;
}
