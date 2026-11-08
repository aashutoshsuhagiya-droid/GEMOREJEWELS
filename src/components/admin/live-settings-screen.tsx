"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { ShippingRate, StoreSettings } from "@/shared/admin-types";
import { useAdminToast } from "./toast";
import { useDialogFocus } from "./use-dialog-focus";

const resources = ["products", "orders", "customers", "invoices", "creditNotes", "collections", "discounts", "subscribers", "instagram", "seoPages", "redirects", "faqs", "reviews", "blog", "bookings", "craft", "quizQuestions", "quizOutcomes"];

export function LiveSettingsScreen() {
  const { notify } = useAdminToast();
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [newCity, setNewCity] = useState("");
  const [saving, setSaving] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetBusy, setResetBusy] = useState(false);

  useEffect(() => {
    let active = true;
    void fetch("/api/admin/settings", { credentials: "same-origin" }).then(response => response.ok ? response.json() : Promise.reject(new Error("Settings could not load."))).then(data => { if (active) setSettings(data as StoreSettings); }).catch(error => notify(error instanceof Error ? error.message : "Settings could not load.", "error"));
    return () => { active = false; };
  }, [notify]);

  if (!settings) return <section className="mx-auto max-w-[1080px] p-7"><div className="h-9 w-56 animate-pulse rounded bg-[#f4efe9]"/><div className="mt-6 h-64 animate-pulse rounded-md border bg-[#f4efe9]"/></section>;

  async function persist(next: StoreSettings = settings!) {
    setSaving(true);
    try {
      const response = await fetch("/api/admin/settings", { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ value: next }) });
      if (!response.ok) throw new Error((await response.json() as { error?: string }).error || "Settings could not save.");
      const saved = await response.json() as StoreSettings;
      setSettings(saved);
      setSavedAt(new Intl.DateTimeFormat("en-AU", { hour: "numeric", minute: "2-digit" }).format(new Date()));
      notify("Settings saved. Storefront and future invoices are refreshed.");
      return saved;
    } catch (error) {
      notify(error instanceof Error ? error.message : "Settings could not save.", "error");
      return null;
    } finally { setSaving(false); }
  }

  async function reset() {
    setResetBusy(true);
    try {
      const response = await fetch("/api/admin/settings", { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "reset" }) });
      if (!response.ok) throw new Error("Reset failed.");
      const next = await fetch("/api/admin/settings", { credentials: "same-origin" });
      if (!next.ok) throw new Error("Reset completed, but settings could not reload.");
      setSettings(await next.json() as StoreSettings);
      setResetOpen(false);
      notify("Demo data has been reset to its complete seed.");
    } catch (error) { notify(error instanceof Error ? error.message : "Reset failed.", "error"); }
    finally { setResetBusy(false); }
  }

  async function exportAll() {
    try {
      const entries = await Promise.all(resources.map(async resource => [resource, await fetch(`/api/admin/${resource}`, { credentials: "same-origin" }).then(response => response.ok ? response.json() : [])] as const));
      const payload = JSON.stringify({ settings, ...Object.fromEntries(entries), exportedAt: new Date().toISOString() }, null, 2);
      const url = URL.createObjectURL(new Blob([payload], { type: "application/json" }));
      const link = document.createElement("a"); link.href = url; link.download = "gemoire-admin-export.json"; link.click(); window.setTimeout(() => URL.revokeObjectURL(url), 0);
      notify("Shared data exported as JSON.");
    } catch { notify("Export could not be created.", "error"); }
  }

  function changeRate(zoneIndex: number, rateIndex: number, field: keyof Pick<ShippingRate, "cost" | "minDays" | "maxDays">, value: number) {
    setSettings(current => current ? { ...current, shippingZones: current.shippingZones.map((zone, index) => index === zoneIndex ? { ...zone, rates: zone.rates.map((rate, position) => position === rateIndex ? { ...rate, [field]: Math.max(0, value || 0) } : rate) } : zone) } : current);
  }

  async function connectInstagram() {
    if (!settings) return;
    setConnecting(true);
    const previous = settings;
    const next = { ...settings, instagramConnected: true };
    setSettings(next);
    const saved = await persist(next);
    if (!saved) setSettings(previous);
    setConnecting(false);
  }

  const billing = settings.billing;
  return <section className="mx-auto max-w-[1080px] p-5 md:p-7">
    <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-[#737373]">System</p><h1 className="mt-1 font-serif text-3xl text-[#253e2b]">Settings</h1><p className="mt-1 text-sm text-[#737373]">Controls that write directly to shared storefront, checkout, integration and billing data.</p>
    <div className="mt-6 grid gap-5">
      <SettingsCard title="General"><div className="grid gap-4 md:grid-cols-2"><Field label="Store name" value={settings.storeName} onChange={storeName => setSettings({ ...settings, storeName })}/><Field label="Currency pair" value={settings.currencyPair} onChange={currencyPair => setSettings({ ...settings, currencyPair })}/><Field label="Locale" value={settings.locale} onChange={locale => setSettings({ ...settings, locale })}/><Field label="Timezone" value={settings.timezone} onChange={timezone => setSettings({ ...settings, timezone })}/></div></SettingsCard>

      <SettingsCard title="Shipping"><div className="grid gap-4 md:grid-cols-2"><Field label="Free-shipping threshold (AUD)" type="number" value={String(settings.freeShippingThreshold)} onChange={value => setSettings({ ...settings, freeShippingThreshold: Math.max(0, Number(value) || 0) })}/><div className="rounded-md bg-[#faf6ef] p-3 text-xs leading-5 text-[#5f5a55]"><strong className="block text-[#253e2b]">Live storefront value</strong>The cart progress bar and checkout shipping calculation read this threshold.</div></div><div className="mt-5 grid gap-4">{settings.shippingZones.map((zone, zoneIndex) => <section key={zone.id} className="rounded-md border border-[#e3e0dc] p-4"><div className="flex items-center justify-between gap-3"><input aria-label="Shipping zone name" value={zone.name} onChange={event => setSettings({ ...settings, shippingZones: settings.shippingZones.map((item, index) => index === zoneIndex ? { ...item, name: event.target.value } : item) })} className="border-0 text-sm font-semibold text-[#253e2b] outline-none"/>{settings.shippingZones.length > 1 ? <button type="button" onClick={() => setSettings({ ...settings, shippingZones: settings.shippingZones.filter((_, index) => index !== zoneIndex) })} className="text-[11px] text-red-700 underline">Remove zone</button> : null}</div><div className="mt-3 grid gap-3 md:grid-cols-2">{zone.rates.map((rate, rateIndex) => <div key={rate.id} className="rounded-md bg-[#faf6ef] p-3"><strong className="text-xs text-[#253e2b]">{rate.name}</strong><div className="mt-2 grid grid-cols-3 gap-2"><MiniField label="Cost" value={rate.cost} onChange={value => changeRate(zoneIndex, rateIndex, "cost", value)}/><MiniField label="Min days" value={rate.minDays} onChange={value => changeRate(zoneIndex, rateIndex, "minDays", value)}/><MiniField label="Max days" value={rate.maxDays} onChange={value => changeRate(zoneIndex, rateIndex, "maxDays", value)}/></div></div>)}</div></section>)}<button type="button" onClick={() => setSettings({ ...settings, shippingZones: [...settings.shippingZones, { id: `zone-${Date.now()}`, name: "New zone", rates: [{ id: "express", name: "Express", cost: 25, minDays: 2, maxDays: 5 }, { id: "standard", name: "Standard", cost: 10, minDays: 5, maxDays: 10 }] }] })} className="w-fit rounded-full border border-[#d4d0cc] px-4 py-2 text-xs text-[#236339]">Add shipping zone</button></div></SettingsCard>

      <SettingsCard title="Payment"><label className="flex items-center justify-between rounded-md bg-[#faf6ef] p-4 text-sm"><span><strong className="block text-[#253e2b]">Mock payment gateway</strong><small className="text-[#737373]">When enabled, checkout records a paid demo order.</small></span><input type="checkbox" checked={settings.paymentEnabled} onChange={event => setSettings({ ...settings, paymentEnabled: event.target.checked })} className="h-5 w-5 accent-[#236339]"/></label><div className="mt-4 grid gap-4 md:grid-cols-2"><Field label="Account name" value={settings.bankDetails.accountName} onChange={accountName => setSettings({ ...settings, bankDetails: { ...settings.bankDetails, accountName } })}/><Field label="Bank name" value={settings.bankDetails.bankName} onChange={bankName => setSettings({ ...settings, bankDetails: { ...settings.bankDetails, bankName } })}/><Field label="Account number" value={settings.bankDetails.accountNumber} onChange={accountNumber => setSettings({ ...settings, bankDetails: { ...settings.bankDetails, accountNumber } })}/><Field label="BIC / SWIFT" value={settings.bankDetails.bic} onChange={bic => setSettings({ ...settings, bankDetails: { ...settings.bankDetails, bic } })}/></div></SettingsCard>

      <SettingsCard title="Billing"><div className="grid gap-4 md:grid-cols-2"><Field label="Invoice prefix" value={billing.prefix} onChange={prefix => setSettings({ ...settings, billing: { ...billing, prefix } })}/><Field label="GST rate (%)" type="number" value={String(billing.gstRate)} onChange={value => setSettings({ ...settings, billing: { ...billing, gstRate: Math.max(0, Number(value) || 0) } })}/><Field label="GSTIN" value={billing.gstin} onChange={gstin => setSettings({ ...settings, billing: { ...billing, gstin } })}/><Field label="CIN" value={billing.cin} onChange={cin => setSettings({ ...settings, billing: { ...billing, cin } })}/><Field label="Ring HSN" value={billing.ringHsn} onChange={ringHsn => setSettings({ ...settings, billing: { ...billing, ringHsn } })}/><Field label="Earring HSN" value={billing.earringHsn} onChange={earringHsn => setSettings({ ...settings, billing: { ...billing, earringHsn } })}/><Field label="Bracelet HSN" value={billing.braceletHsn} onChange={braceletHsn => setSettings({ ...settings, billing: { ...billing, braceletHsn } })}/></div><div className="mt-4 flex flex-wrap gap-5"><Check label="Split GST into CGST / SGST" checked={billing.splitGst} onChange={splitGst => setSettings({ ...settings, billing: { ...billing, splitGst } })}/><Check label="Auto-email invoice on payment" checked={billing.autoEmail} onChange={autoEmail => setSettings({ ...settings, billing: { ...billing, autoEmail } })}/></div><label className="mt-4 block text-xs font-medium">Invoice footer<textarea value={billing.footer} onChange={event => setSettings({ ...settings, billing: { ...billing, footer: event.target.value } })} className="mt-1 min-h-20 w-full rounded-md border border-[#d4d0cc] p-3 text-sm"/></label></SettingsCard>

      <SettingsCard title="Showrooms & AR try-on"><div className="space-y-2">{settings.cities.map((city, index) => <div className="flex gap-2" key={`${city}-${index}`}><input value={city} aria-label={`Showroom city ${index + 1}`} onChange={event => setSettings({ ...settings, cities: settings.cities.map((value, position) => position === index ? event.target.value : value) })} className="min-w-0 flex-1 rounded-md border border-[#d4d0cc] px-3 py-2 text-sm"/><button type="button" onClick={() => setSettings({ ...settings, cities: settings.cities.filter((_, position) => position !== index) })} className="rounded border border-red-200 px-3 text-xs text-red-700">Remove</button></div>)}</div><div className="mt-3 flex gap-2"><input value={newCity} onChange={event => setNewCity(event.target.value)} placeholder="Add a city" className="min-w-0 flex-1 rounded-md border border-[#d4d0cc] px-3 py-2 text-sm"/><button type="button" onClick={() => { if (newCity.trim()) { setSettings({ ...settings, cities: [...settings.cities, newCity.trim()] }); setNewCity(""); } }} className="rounded border px-3 text-xs">Add</button></div><Check className="mt-5" label="Enable PDP AR try-on" checked={settings.arEnabled} onChange={arEnabled => setSettings({ ...settings, arEnabled })}/><label className="mt-3 block text-xs font-medium">AR waitlist note<textarea value={settings.arNote} onChange={event => setSettings({ ...settings, arNote: event.target.value })} className="mt-1 min-h-20 w-full rounded-md border border-[#d4d0cc] p-3 text-sm"/></label></SettingsCard>

      <SettingsCard title="Integrations"><div className="grid gap-4 md:grid-cols-2"><Field label="IGI issuer" value={settings.igi.issuer} onChange={issuer => setSettings({ ...settings, igi: { ...settings.igi, issuer } })}/><Field label="IGI verification URL" value={settings.igi.certificateUrl} onChange={certificateUrl => setSettings({ ...settings, igi: { ...settings.igi, certificateUrl } })}/><Field label="Instagram handle" value={settings.instagramHandle} onChange={instagramHandle => setSettings({ ...settings, instagramHandle })}/><div className="rounded-md bg-[#faf6ef] p-3 text-sm"><strong className="block text-[#253e2b]">Instagram connection</strong><small className="text-[#737373]">{settings.instagramConnected ? "Connected to the mock feed manager." : "Connect the mock integration."}</small><button type="button" disabled={connecting || settings.instagramConnected} onClick={() => void connectInstagram()} className="mt-3 block rounded-full border border-[#d4d0cc] bg-white px-3 py-1.5 text-xs disabled:opacity-50">{connecting ? "Connecting…" : settings.instagramConnected ? "Connected ✓" : "Connect"}</button></div></div></SettingsCard>

      <section className="rounded-md border border-red-200 bg-red-50/50 p-5"><h2 className="font-serif text-2xl text-red-900">Danger zone</h2><p className="mt-1 text-sm text-red-800/75">Export is recoverable. Reset restores the complete seeded demonstration dataset.</p><div className="mt-4 flex flex-wrap gap-3"><button type="button" onClick={() => void exportAll()} className="rounded-full border border-red-200 bg-white px-4 py-2 text-xs text-[#253e2b]">Export all data JSON</button><button type="button" onClick={() => setResetOpen(true)} className="rounded-full bg-red-700 px-4 py-2 text-xs text-white">Reset demo data</button></div></section>
    </div>
    <footer className="sticky bottom-3 mt-5 flex items-center justify-end gap-3 rounded-md border border-[#d4d0cc] bg-white/95 p-3 shadow-lg backdrop-blur">{savedAt ? <span className="text-xs text-[#236339]">Saved ✓ at {savedAt}</span> : null}<button type="button" onClick={() => void persist()} disabled={saving} className="rounded-full bg-[#236339] px-5 py-2 text-xs text-white disabled:opacity-15">{saving ? "Saving…" : "Save all settings"}</button></footer>
    {resetOpen ? <ResetDialog busy={resetBusy} onClose={() => setResetOpen(false)} onConfirm={() => void reset()}/> : null}
  </section>;
}

function SettingsCard({ title, children }: { title: string; children: ReactNode }) { return <section className="rounded-md border border-[#e3e0dc] bg-white p-5"><h2 className="font-serif text-2xl text-[#253e2b]">{title}</h2><div className="mt-4">{children}</div></section>; }
function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: "text" | "number" }) { return <label className="block text-xs font-medium text-[#5f5a55]">{label}<input type={type} value={value} onChange={event => onChange(event.target.value)} className="mt-1 w-full rounded-md border border-[#d4d0cc] px-3 py-2 text-sm text-[#232323]"/></label>; }
function MiniField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) { return <label className="text-[10px] text-[#737373]">{label}<input type="number" min="0" value={value} onChange={event => onChange(Number(event.target.value))} className="mt-1 w-full rounded border border-[#d4d0cc] bg-white px-2 py-1 text-xs text-[#232323]"/></label>; }
function Check({ label, checked, onChange, className = "" }: { label: string; checked: boolean; onChange: (checked: boolean) => void; className?: string }) { return <label className={`flex items-center gap-2 text-sm ${className}`}><input type="checkbox" checked={checked} onChange={event => onChange(event.target.checked)} className="accent-[#236339]"/> {label}</label>; }
function ResetDialog({ busy, onClose, onConfirm }: { busy: boolean; onClose: () => void; onConfirm: () => void }) {
  const [value, setValue] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);
  useDialogFocus(panelRef, onClose, true, !busy);
  return <div className="fixed inset-0 z-[85] grid place-items-center bg-black/30 p-4" role="presentation" onMouseDown={() => { if (!busy) onClose(); }}><div ref={panelRef} role="dialog" aria-modal="true" aria-labelledby="reset-title" onMouseDown={event => event.stopPropagation()} className="w-full max-w-md rounded-md bg-white p-5 shadow-2xl"><h2 id="reset-title" className="font-serif text-3xl text-red-900">Reset every demo record?</h2><p className="mt-2 text-sm leading-6 text-[#737373]">This overwrites all shared admin and storefront demo data. Type <strong className="text-[#232323]">RESET</strong> to confirm.</p><input data-autofocus value={value} onChange={event => setValue(event.target.value)} placeholder="Type RESET" className="mt-4 w-full rounded-md border border-red-200 px-3 py-2 text-sm"/><div className="mt-5 flex justify-end gap-2"><button type="button" disabled={busy} onClick={onClose} className="rounded-full border border-[#d4d0cc] px-4 py-2 text-xs">Cancel</button><button type="button" disabled={busy || value !== "RESET"} onClick={onConfirm} className="rounded-full bg-red-700 px-4 py-2 text-xs text-white disabled:opacity-30">{busy ? "Resetting…" : "Reset demo data"}</button></div></div></div>;
}
