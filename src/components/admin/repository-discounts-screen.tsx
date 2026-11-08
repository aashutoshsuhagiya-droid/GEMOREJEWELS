"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import type { AdminProduct, Collection, Discount } from "@/shared/admin-types";
import { useAdminToast } from "./toast";

async function read<T>(resource: string): Promise<T[]> {
  const response = await fetch(`/api/admin/${resource}`, { credentials: "same-origin" });
  if (!response.ok) throw new Error(`Unable to load ${resource}.`);
  return response.json() as Promise<T[]>;
}

async function save<T>(resource: string, value: T): Promise<T> {
  const response = await fetch(`/api/admin/${resource}`, { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ value }) });
  if (!response.ok) throw new Error((await response.json() as { error?: string }).error || "Save failed.");
  return response.json() as Promise<T>;
}

export function RepositoryDiscountsScreen() {
  const { notify } = useAdminToast();
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [code, setCode] = useState("GEMOIRE-10");
  const [type, setType] = useState<Discount["type"]>("percentage");
  const [value, setValue] = useState("10");
  const [scope, setScope] = useState<Discount["scope"]>("sitewide");
  const [scopeId, setScopeId] = useState("");
  const [expiry, setExpiry] = useState("2027-12-31");
  const [cap, setCap] = useState("100");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [nextDiscounts, nextProducts, nextCollections] = await Promise.all([read<Discount>("discounts"), read<AdminProduct>("products"), read<Collection>("collections")]);
      setDiscounts(nextDiscounts.sort((a, b) => a.expiresAt.localeCompare(b.expiresAt)));
      setProducts(nextProducts);
      setCollections(nextCollections);
    } catch (error) {
      notify(error instanceof Error ? error.message : "Discounts could not load.", "error");
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => { void load(); }, [load]);

  const scopeOptions = useMemo(() => scope === "category" ? collections.map(item => ({ id: item.id, label: item.name })) : products.map(item => ({ id: item.id, label: item.name })), [collections, products, scope]);
  const preview = code.trim() || `GEMOIRE-${type === "percentage" ? value || "10" : type === "shipping" ? "SHIP" : value || "100"}`;

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedCode = preview.toUpperCase().replace(/\s+/g, "-");
    const numericValue = type === "shipping" ? 0 : Math.max(0, Number(value) || 0);
    const usageCap = Math.max(1, Math.floor(Number(cap) || 1));
    if (!normalizedCode || !expiry || (scope !== "sitewide" && !scopeId) || (type !== "shipping" && numericValue <= 0)) {
      notify("Complete the code, value, scope and expiry before saving.", "error");
      return;
    }
    if (discounts.some(item => item.code.toUpperCase() === normalizedCode)) {
      notify("That code already exists. Choose a unique code.", "error");
      return;
    }
    const discount: Discount = { id: `discount-${Date.now()}`, code: normalizedCode, type, value: numericValue, scope, scopeId: scope === "sitewide" ? undefined : scopeId, expiresAt: expiry, usageCount: 0, usageCap, status: new Date(`${expiry}T23:59:59`).getTime() < Date.now() ? "expired" : "active" };
    setSaving(true);
    try {
      const saved = await save("discounts", discount);
      setDiscounts(current => [...current, saved].sort((a, b) => a.expiresAt.localeCompare(b.expiresAt)));
      setCode(""); setValue(type === "shipping" ? "0" : "10"); setScope("sitewide"); setScopeId("");
      notify(`${saved.code} is live on the storefront cart.`);
    } catch (error) {
      notify(error instanceof Error ? error.message : "Discount could not be created.", "error");
    } finally {
      setSaving(false);
    }
  }

  async function copy(item: Discount) {
    try { await navigator.clipboard.writeText(item.code); notify(`${item.code} copied to clipboard.`); }
    catch { notify(`Copy ${item.code} from the table.`, "error"); }
  }

  function scopeLabel(item: Discount) {
    if (item.scope === "sitewide") return "Site-wide";
    const source = item.scope === "category" ? collections : products;
    return `${item.scope === "category" ? "Collection" : "Product"}: ${source.find(value => value.id === item.scopeId)?.name ?? item.scopeId ?? "Not set"}`;
  }

  return <main className="mx-auto max-w-[1320px] p-5 md:p-7"><p className="text-[10px] font-semibold uppercase tracking-[.18em] text-[#737373]">Marketing</p><h1 className="mt-1 font-serif text-3xl text-[#253e2b]">Discounts</h1><p className="mt-1 text-sm text-[#737373]">Create codes that the shared storefront cart validates against this repository.</p><div className="mt-6 grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]"><form onSubmit={event => void create(event)} className="h-fit rounded-md border border-[#e3e0dc] bg-white p-5 xl:sticky xl:top-5"><h2 className="font-serif text-2xl text-[#253e2b]">New discount</h2><label className="mt-4 block text-xs font-medium">Code<input value={code} onChange={event => setCode(event.target.value.toUpperCase())} placeholder="GEMOIRE-10" className="mt-1 w-full rounded-md border border-[#d4d0cc] px-3 py-2 text-sm"/></label><p className="mt-1 text-[11px] text-[#737373]">Preview: <span className="font-mono text-[#253e2b]">{preview.toUpperCase().replace(/\s+/g, "-")}</span></p><div className="mt-4 flex flex-wrap gap-2">{(["percentage", "fixed", "shipping"] as const).map(item => <button type="button" key={item} onClick={() => { setType(item); if (item === "shipping") setValue("0"); }} className={`rounded-full px-3 py-2 text-xs ${type === item ? "bg-[#236339] text-white" : "border border-[#d4d0cc]"}`}>{item === "shipping" ? "Free shipping" : item}</button>)}</div>{type !== "shipping" ? <label className="mt-4 block text-xs font-medium">{type === "percentage" ? "Percentage" : "AUD value"}<input type="number" min="0" max={type === "percentage" ? 100 : undefined} value={value} onChange={event => setValue(event.target.value)} className="mt-1 w-full rounded-md border border-[#d4d0cc] px-3 py-2 text-sm"/></label> : <p className="mt-4 rounded-md bg-[#faf6ef] p-3 text-xs text-[#5f5a55]">This code removes any delivery charge at checkout.</p>}<label className="mt-4 block text-xs font-medium">Scope<select value={scope} onChange={event => { setScope(event.target.value as Discount["scope"]); setScopeId(""); }} className="mt-1 w-full rounded-md border border-[#d4d0cc] bg-white px-3 py-2 text-sm"><option value="sitewide">Site-wide</option><option value="category">Collection</option><option value="product">Product</option></select></label>{scope !== "sitewide" ? <label className="mt-3 block text-xs font-medium">{scope === "category" ? "Collection" : "Product"}<select value={scopeId} onChange={event => setScopeId(event.target.value)} className="mt-1 w-full rounded-md border border-[#d4d0cc] bg-white px-3 py-2 text-sm"><option value="">Choose one</option>{scopeOptions.map(option => <option value={option.id} key={option.id}>{option.label}</option>)}</select></label> : null}<div className="mt-4 grid grid-cols-2 gap-3"><label className="text-xs font-medium">Expiry<input type="date" value={expiry} onChange={event => setExpiry(event.target.value)} className="mt-1 w-full rounded-md border border-[#d4d0cc] px-3 py-2 text-sm"/></label><label className="text-xs font-medium">Usage cap<input type="number" min="1" value={cap} onChange={event => setCap(event.target.value)} className="mt-1 w-full rounded-md border border-[#d4d0cc] px-3 py-2 text-sm"/></label></div><button disabled={saving} className="mt-5 rounded-full bg-[#236339] px-4 py-2 text-xs text-white disabled:opacity-15">{saving ? "Saving…" : "Create discount"}</button></form><section className="overflow-hidden rounded-md border border-[#e3e0dc] bg-white"><div className="overflow-x-auto"><table className="min-w-[800px] w-full text-left text-sm"><thead className="bg-[#faf6ef] text-[10px] uppercase tracking-[.1em] text-[#737373]"><tr><th className="p-4">Code</th><th className="p-4">Type</th><th className="p-4">Scope</th><th className="p-4">Expiry</th><th className="p-4">Usage</th><th className="p-4">Status</th><th className="p-4"/></tr></thead><tbody>{loading ? Array.from({ length: 6 }, (_, index) => <tr key={index} className="border-t"><td colSpan={7} className="p-4"><div className="h-5 animate-pulse rounded bg-[#f4efe9]"/></td></tr>) : discounts.map(item => <tr key={item.id} className="border-t border-[#eeeae5]"><td className="p-4 font-mono text-xs font-medium">{item.code}</td><td className="p-4">{item.type === "percentage" ? `${item.value}%` : item.type === "fixed" ? `AUD ${item.value}` : "Free shipping"}</td><td className="p-4 text-xs text-[#5f5a55]">{scopeLabel(item)}</td><td className="p-4 text-xs">{item.expiresAt}</td><td className="p-4"><div className="min-w-28"><span className="text-xs">{item.usageCount}/{item.usageCap}</span><div className="mt-1 h-1.5 overflow-hidden rounded bg-[#eeeae5]"><span className="block h-full bg-[#c9a962]" style={{ width: `${Math.min(100, item.usageCount / item.usageCap * 100)}%` }}/></div></div></td><td className="p-4"><span className={`rounded-full px-2 py-1 text-[10px] ${item.status === "active" ? "bg-[#eaf5ee] text-[#236339]" : item.status === "expired" ? "bg-red-50 text-red-700" : "bg-[#f8f1df] text-[#80631c]"}`}>{item.status}</span></td><td className="p-4 text-right"><button onClick={() => void copy(item)} className="text-xs text-[#236339] underline">Copy</button></td></tr>)}</tbody></table></div>{!loading && !discounts.length ? <p className="p-12 text-center text-sm text-[#737373]">No discounts yet. Create the first storefront code.</p> : null}</section></div></main>;
}
