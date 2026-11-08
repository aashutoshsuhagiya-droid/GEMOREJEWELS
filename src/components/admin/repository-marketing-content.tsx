"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type DragEvent,
  type FormEvent,
  type ReactNode
} from "react";
import type { AdminProduct, BlogPost, InstagramItem, Subscriber } from "@/shared/admin-types";
import { downloadAdminCsv } from "./data-table";
import { useAdminToast } from "./toast";

type ResourceName = "subscribers" | "instagram" | "products" | "blog" | "storefront-config";
type StorefrontConfig = { quizPublished: boolean; instagramHandle: string; arEnabled: boolean; arNote: string };

async function responseError(response: Response, fallback: string) {
  const payload = await response.json().catch(() => null) as { error?: string } | null;
  return payload?.error || fallback;
}

async function readResource<T>(resource: ResourceName): Promise<T> {
  const response = await fetch(`/api/admin/${resource}`, { credentials: "same-origin" });
  if (!response.ok) throw new Error(await responseError(response, `Unable to load ${resource}.`));
  return response.json() as Promise<T>;
}

async function saveResource<T>(resource: ResourceName, value: T): Promise<T> {
  const response = await fetch(`/api/admin/${resource}`, {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ value })
  });
  if (!response.ok) throw new Error(await responseError(response, `Unable to save ${resource}.`));
  return response.json() as Promise<T>;
}

async function deleteResource(resource: ResourceName, id: string) {
  const response = await fetch(`/api/admin/${resource}`, {
    method: "DELETE",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id })
  });
  if (!response.ok) throw new Error(await responseError(response, `Unable to delete ${resource}.`));
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function formatDate(value: string) {
  const date = new Date(value.length === 10 ? `${value}T00:00:00` : value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-AU", { day: "numeric", month: "short", year: "numeric" }).format(date);
}

function ScreenHeading({ eyebrow, title, body, action }: { eyebrow: string; title: string; body: string; action?: ReactNode }) {
  return <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-[.18em] text-[#737373]">{eyebrow}</p><h1 className="mt-1 font-[family-name:var(--font-cormorant)] text-4xl leading-none text-[#253e2b]">{title}</h1><p className="mt-2 max-w-2xl text-sm text-[#737373]">{body}</p></div>{action ? <div className="shrink-0">{action}</div> : null}</div>;
}

function PrimaryButton({ children, onClick, disabled = false, type = "button" }: { children: ReactNode; onClick?: () => void; disabled?: boolean; type?: "button" | "submit" }) {
  return <button type={type} onClick={onClick} disabled={disabled} className="inline-flex min-h-10 items-center justify-center rounded-full bg-[#236339] px-4 text-xs font-medium text-white transition hover:bg-[#1b4f2e] disabled:cursor-not-allowed disabled:opacity-35">{children}</button>;
}

function SecondaryButton({ children, onClick, disabled = false, className = "" }: { children: ReactNode; onClick?: () => void; disabled?: boolean; className?: string }) {
  return <button type="button" onClick={onClick} disabled={disabled} className={`inline-flex min-h-9 items-center justify-center rounded-full border border-[#d4d0cc] bg-white px-3 text-xs text-[#253e2b] transition hover:border-[#236339] disabled:cursor-not-allowed disabled:opacity-35 ${className}`}>{children}</button>;
}

function FilterButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return <button type="button" aria-pressed={active} onClick={onClick} className={`whitespace-nowrap rounded-full px-3 py-2 text-xs ${active ? "bg-[#236339] text-white" : "border border-[#d4d0cc] bg-white text-[#5f5a55] hover:border-[#236339]"}`}>{children}</button>;
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return <div className="rounded-md border border-dashed border-[#d4d0cc] bg-white px-5 py-14 text-center"><h2 className="font-[family-name:var(--font-cormorant)] text-3xl text-[#253e2b]">{title}</h2><p className="mx-auto mt-2 max-w-md text-sm text-[#737373]">{body}</p></div>;
}

export function RepositoryNewsletterScreen() {
  const { notify } = useAdminToast();
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | "subscribed" | "unsubscribed">("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<10 | 25 | 50>(10);
  const [winners, setWinners] = useState<string[]>([]);
  const [drawIndex, setDrawIndex] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const values = await readResource<Subscriber[]>("subscribers");
      setSubscribers(values.sort((a, b) => b.addedAt.localeCompare(a.addedAt)));
      setWinners(values.filter((item) => !item.unsubscribed).sort((a, b) => a.email.localeCompare(b.email)).slice(-3).reverse().map((item) => item.email));
    } catch (error) {
      notify(error instanceof Error ? error.message : "Subscribers could not load.", "error");
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => { void load(); }, [load]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return subscribers.filter((subscriber) => {
      const matchesQuery = !needle || `${subscriber.email} ${subscriber.source}`.toLowerCase().includes(needle);
      const matchesStatus = status === "all" || (status === "unsubscribed" ? subscriber.unsubscribed : !subscriber.unsubscribed);
      return matchesQuery && matchesStatus;
    });
  }, [query, status, subscribers]);

  useEffect(() => { setPage(1); }, [query, status, pageSize]);

  const pageCount = Math.max(1, Math.ceil(visible.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pageRows = visible.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  async function toggleSubscription(subscriber: Subscriber) {
    const next = { ...subscriber, unsubscribed: !subscriber.unsubscribed };
    setBusyId(subscriber.id);
    try {
      const saved = await saveResource("subscribers", next);
      setSubscribers((current) => current.map((item) => item.id === saved.id ? saved : item));
      notify(`${saved.email} ${saved.unsubscribed ? "unsubscribed" : "resubscribed"}.`);
    } catch (error) {
      notify(error instanceof Error ? error.message : "Subscription status could not be saved.", "error");
    } finally {
      setBusyId(null);
    }
  }

  function exportSubscribers() {
    downloadAdminCsv("gemoire-newsletter-subscribers.csv", ["Email", "Added", "Source", "Status"], visible.map((subscriber) => [subscriber.email, subscriber.addedAt, subscriber.source, subscriber.unsubscribed ? "Unsubscribed" : "Subscribed"]));
    notify(`${visible.length} subscriber${visible.length === 1 ? "" : "s"} exported as CSV.`);
  }

  function drawWinner() {
    const eligible = subscribers.filter((subscriber) => !subscriber.unsubscribed).sort((a, b) => a.email.localeCompare(b.email));
    if (!eligible.length) {
      notify("There are no active subscribers in the draw.", "error");
      return;
    }
    const winner = eligible[drawIndex % eligible.length];
    setDrawIndex((current) => current + 1);
    setWinners((current) => [winner.email, ...current.filter((email) => email !== winner.email)].slice(0, 3));
    notify(`${winner.email} was selected as the voucher winner.`);
  }

  const activeCount = subscribers.filter((subscriber) => !subscriber.unsubscribed).length;
  const inactiveCount = subscribers.length - activeCount;

  return <section className="mx-auto w-full max-w-[1440px]">
    <ScreenHeading eyebrow="Marketing" title="Newsletter" body="Manage the shared subscriber list and run a deterministic, demo-safe voucher draw." action={<SecondaryButton onClick={exportSubscribers} disabled={loading || !visible.length}>Export CSV</SecondaryButton>} />
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="min-w-0">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
          <label className="min-w-0 flex-1 lg:max-w-md"><span className="sr-only">Search subscribers</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search email or source…" className="h-10 w-full rounded-md border border-[#d4d0cc] bg-white px-3 text-sm outline-none focus:border-[#236339] focus:ring-2 focus:ring-[#236339]/15" /></label>
          <div className="flex max-w-full gap-1 overflow-x-auto pb-1">
            <FilterButton active={status === "all"} onClick={() => setStatus("all")}>All {subscribers.length}</FilterButton>
            <FilterButton active={status === "subscribed"} onClick={() => setStatus("subscribed")}>Subscribed {activeCount}</FilterButton>
            <FilterButton active={status === "unsubscribed"} onClick={() => setStatus("unsubscribed")}>Unsubscribed {inactiveCount}</FilterButton>
          </div>
        </div>
        <div className="overflow-hidden rounded-md border border-[#e3e0dc] bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-[680px] w-full text-left text-sm">
              <thead className="bg-[#faf6ef] text-[10px] font-semibold uppercase tracking-[.1em] text-[#737373]"><tr><th className="px-4 py-3">Email</th><th className="px-4 py-3">Added</th><th className="px-4 py-3">Source</th><th className="px-4 py-3">Status</th><th className="px-4 py-3"><span className="sr-only">Actions</span></th></tr></thead>
              <tbody className="divide-y divide-[#eeeae5]">
                {loading ? Array.from({ length: 7 }, (_, index) => <tr key={index}><td colSpan={5} className="px-4 py-4"><div className="h-6 animate-pulse rounded bg-[#f1eee9]" /></td></tr>) : pageRows.map((subscriber) => <tr key={subscriber.id}>
                  <td className="px-4 py-3 font-medium text-[#253e2b]">{subscriber.email}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-[#5f5a55]">{formatDate(subscriber.addedAt)}</td>
                  <td className="px-4 py-3 text-xs text-[#5f5a55]">{subscriber.source}</td>
                  <td className="px-4 py-3"><span className={`inline-flex rounded-full px-2 py-1 text-[10px] font-medium ${subscriber.unsubscribed ? "bg-[#f3f1ee] text-[#5f5a55]" : "bg-[#eaf5ee] text-[#236339]"}`}>{subscriber.unsubscribed ? "Unsubscribed" : "Subscribed"}</span></td>
                  <td className="px-4 py-3 text-right"><button type="button" disabled={busyId === subscriber.id} onClick={() => void toggleSubscription(subscriber)} className="whitespace-nowrap text-xs font-medium text-[#236339] underline disabled:opacity-35">{busyId === subscriber.id ? "Saving…" : subscriber.unsubscribed ? "Resubscribe" : "Unsubscribe"}</button></td>
                </tr>)}
              </tbody>
            </table>
          </div>
          {!loading && !visible.length ? <div className="p-8 text-center text-sm text-[#737373]">No subscribers match this view.</div> : null}
          {!loading && visible.length ? <div className="flex flex-col gap-3 border-t border-[#eeeae5] px-4 py-3 text-xs text-[#5f5a55] sm:flex-row sm:items-center sm:justify-between">
            <label className="flex items-center gap-2">Rows per page
              <select value={pageSize} onChange={(event) => setPageSize(Number(event.target.value) as 10 | 25 | 50)} className="rounded border border-[#d4d0cc] bg-white px-2 py-1 outline-none focus:border-[#236339]">
                <option value={10}>10</option><option value={25}>25</option><option value={50}>50</option>
              </select>
            </label>
            <div className="flex items-center justify-between gap-3 sm:justify-end">
              <span>Page {currentPage} of {pageCount} · {visible.length} results</span>
              <div className="flex gap-1">
                <button type="button" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={currentPage === 1} className="rounded border border-[#d4d0cc] px-2 py-1 disabled:opacity-35">Previous</button>
                <button type="button" onClick={() => setPage((value) => Math.min(pageCount, value + 1))} disabled={currentPage === pageCount} className="rounded border border-[#d4d0cc] px-2 py-1 disabled:opacity-35">Next</button>
              </div>
            </div>
          </div> : null}
        </div>
      </div>
      <aside className="h-fit rounded-md border border-[#e3e0dc] bg-white p-5 xl:sticky xl:top-20">
        <p className="text-[10px] font-semibold uppercase tracking-[.14em] text-[#737373]">Voucher draw</p>
        <h2 className="mt-1 font-[family-name:var(--font-cormorant)] text-3xl text-[#253e2b]">A small thank-you</h2>
        <p className="mt-2 text-sm leading-6 text-[#737373]">Each click advances through active subscribers in a stable email-sorted rotation.</p>
        <PrimaryButton onClick={drawWinner} disabled={loading || activeCount === 0}>Draw a winner</PrimaryButton>
        <div className="mt-5 border-t border-[#eeeae5] pt-4"><h3 className="text-xs font-semibold text-[#253e2b]">Latest winners</h3>{winners.length ? <ol className="mt-3 grid gap-2">{winners.map((winner, index) => <li key={winner} className="rounded-md bg-[#faf6ef] px-3 py-2 text-xs text-[#5f5a55]"><span className="mr-2 text-[#c9a962]">{index + 1}.</span>{winner}</li>)}</ol> : <p className="mt-2 text-xs text-[#737373]">No winner has been drawn in this session.</p>}</div>
      </aside>
    </div>
  </section>;
}

function normalizeInstagram(items: InstagramItem[]) {
  return items.map((item, position) => ({ ...item, position }));
}

export function RepositoryInstagramScreen() {
  const { notify } = useAdminToast();
  const [items, setItems] = useState<InstagramItem[]>([]);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [config, setConfig] = useState<StorefrontConfig | null>(null);
  const [baselineIds, setBaselineIds] = useState<string[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [handle, setHandle] = useState("@gemoirejewels");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [instagramValues, productValues, settingValues] = await Promise.all([
        readResource<InstagramItem[]>("instagram"),
        readResource<AdminProduct[]>("products"),
        readResource<StorefrontConfig>("storefront-config")
      ]);
      const ordered = normalizeInstagram([...instagramValues].sort((a, b) => a.position - b.position).slice(0, 12));
      setItems(ordered);
      setProducts(productValues);
      setConfig(settingValues);
      setHandle(settingValues.instagramHandle || "@gemoirejewels");
      setBaselineIds(ordered.map((item) => item.id));
      setDirty(false);
    } catch (error) {
      notify(error instanceof Error ? error.message : "Instagram feed could not load.", "error");
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => { void load(); }, [load]);

  const productById = useMemo(() => new Map(products.map((product) => [product.id, product])), [products]);
  const usedProductIds = useMemo(
    () => new Set(items.map((item) => item.productId).filter((productId): productId is string => Boolean(productId))),
    [items]
  );
  const availableProducts = products.filter((product) => product.images.length && !usedProductIds.has(product.id));

  function updateItems(next: InstagramItem[]) {
    setItems(normalizeInstagram(next));
    setDirty(true);
  }

  function moveItem(id: string, direction: -1 | 1) {
    const index = items.findIndex((item) => item.id === id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    updateItems(next);
  }

  function moveTo(id: string, targetId: string) {
    if (id === targetId) return;
    const from = items.findIndex((item) => item.id === id);
    const to = items.findIndex((item) => item.id === targetId);
    if (from < 0 || to < 0) return;
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    updateItems(next);
  }

  function addFromLibrary() {
    if (items.length >= 12) {
      notify("The feed can contain at most 12 images.", "error");
      return;
    }
    const product = products.find((item) => item.id === selectedProductId);
    const image = product?.images.find((item) => item.isPrimary) ?? product?.images[0];
    if (!product || !image) {
      notify("Choose a product with an image first.", "error");
      return;
    }
    const id = typeof crypto !== "undefined" && "randomUUID" in crypto ? `ig-${crypto.randomUUID()}` : `ig-${Date.now()}`;
    updateItems([...items, { id, src: image.src, productId: product.id, position: items.length, underReview: true }]);
    setSelectedProductId("");
  }

  function removeItem(id: string) {
    if (items.length <= 8) {
      notify("Keep at least eight images in the storefront feed.", "error");
      return;
    }
    updateItems(items.filter((item) => item.id !== id));
  }

  async function saveFeed() {
    setSaving(true);
    try {
      const next = normalizeInstagram(items);
      const currentIds = new Set(next.map((item) => item.id));
      const removedIds = baselineIds.filter((id) => !currentIds.has(id));
      const savedItems = await Promise.all(next.map((item) => saveResource("instagram", item)));
      await Promise.all(removedIds.map((id) => deleteResource("instagram", id)));
      let savedConfig = config;
      if (config) savedConfig = await saveResource("storefront-config", { ...config, instagramHandle: handle.trim() || "@gemoirejewels" });
      const ordered = normalizeInstagram(savedItems.sort((a, b) => a.position - b.position));
      setItems(ordered);
      setBaselineIds(ordered.map((item) => item.id));
      setConfig(savedConfig);
      setHandle(savedConfig?.instagramHandle || handle.trim() || "@gemoirejewels");
      setDirty(false);
      notify("Instagram feed and account handle saved to the storefront.");
    } catch (error) {
      notify(error instanceof Error ? error.message : "Instagram feed could not be saved.", "error");
    } finally {
      setSaving(false);
    }
  }

  function startDrag(event: DragEvent<HTMLElement>, id: string) {
    setDraggingId(id);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", id);
  }

  return <section className="mx-auto w-full max-w-[1440px]">
    <ScreenHeading eyebrow="Marketing" title="Instagram feed" body="Curate 8–12 product images for the homepage carousel. Drag cards or use the keyboard-friendly move controls." action={<PrimaryButton onClick={() => void saveFeed()} disabled={loading || saving || !dirty}>{saving ? "Saving…" : dirty ? "Save feed" : "Saved"}</PrimaryButton>} />
    <div className="mb-5 grid gap-3 rounded-md border border-[#e3e0dc] bg-white p-4 lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)_auto] lg:items-end">
      <label className="text-xs font-medium text-[#253e2b]">Instagram handle<input value={handle} onChange={(event) => { setHandle(event.target.value); setDirty(true); }} placeholder="@gemoirejewels" className="mt-1 h-10 w-full rounded-md border border-[#d4d0cc] px-3 text-sm outline-none focus:border-[#236339] focus:ring-2 focus:ring-[#236339]/15" /></label>
      <label className="text-xs font-medium text-[#253e2b]">Add from product library<select value={selectedProductId} onChange={(event) => setSelectedProductId(event.target.value)} disabled={loading || items.length >= 12 || !availableProducts.length} className="mt-1 h-10 w-full rounded-md border border-[#d4d0cc] bg-white px-3 text-sm outline-none focus:border-[#236339] focus:ring-2 focus:ring-[#236339]/15 disabled:opacity-50"><option value="">{availableProducts.length ? "Choose a product" : "No unused product images"}</option>{availableProducts.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}</select></label>
      <SecondaryButton onClick={addFromLibrary} disabled={!selectedProductId || items.length >= 12}>Add image</SecondaryButton>
    </div>
    <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-xs text-[#737373]"><span>{items.length} of 8–12 images</span><span>Drag to reorder · Arrow buttons work with keyboard and touch</span></div>
    {loading ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{Array.from({ length: 8 }, (_, index) => <div key={index} className="aspect-[4/5] animate-pulse rounded-md border border-[#e3e0dc] bg-[#f1eee9]" />)}</div> : items.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{items.map((item, index) => {
      const product = item.productId ? productById.get(item.productId) : undefined;
      return <article key={item.id} draggable onDragStart={(event) => startDrag(event, item.id)} onDragEnd={() => setDraggingId(null)} onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = "move"; }} onDrop={(event) => { event.preventDefault(); moveTo(event.dataTransfer.getData("text/plain") || draggingId || "", item.id); setDraggingId(null); }} className={`overflow-hidden rounded-md border bg-white transition ${draggingId === item.id ? "border-[#236339] opacity-55" : "border-[#e3e0dc]"}`}>
        <div className="relative"><img src={item.src} alt={product ? `${product.name} Instagram feed image` : "Curated Instagram feed image"} className="aspect-square w-full object-cover" /><span className="absolute left-3 top-3 rounded-full bg-white/90 px-2 py-1 text-[10px] font-semibold text-[#253e2b]">{index + 1}</span>{item.underReview ? <span className="absolute right-3 top-3 rounded-full bg-[#f8f1df] px-2 py-1 text-[10px] font-medium text-[#80631c]">Under review</span> : null}</div>
        <div className="p-3"><h2 className="truncate text-sm font-medium text-[#253e2b]">{product?.name ?? "Curated image"}</h2><p className="mt-1 text-[11px] text-[#737373]">Drag handle: card surface</p><div className="mt-3 flex flex-wrap items-center gap-1"><SecondaryButton onClick={() => moveItem(item.id, -1)} disabled={index === 0} className="!min-h-8 !px-2"><span aria-hidden="true">←</span><span className="sr-only">Move {product?.name ?? `image ${index + 1}`} earlier</span></SecondaryButton><SecondaryButton onClick={() => moveItem(item.id, 1)} disabled={index === items.length - 1} className="!min-h-8 !px-2"><span aria-hidden="true">→</span><span className="sr-only">Move {product?.name ?? `image ${index + 1}`} later</span></SecondaryButton><button type="button" onClick={() => updateItems(items.map((value) => value.id === item.id ? { ...value, underReview: !value.underReview } : value))} className="ml-auto text-xs text-[#236339] underline">{item.underReview ? "Approve" : "Review"}</button><button type="button" onClick={() => removeItem(item.id)} disabled={items.length <= 8} className="text-xs text-red-700 underline disabled:cursor-not-allowed disabled:opacity-35" aria-label={`Remove ${product?.name ?? `image ${index + 1}`} from feed`}>Remove</button></div></div>
      </article>;
    })}</div> : <EmptyState title="No Instagram images" body="Add at least eight images from the product library to create the homepage feed." />}
  </section>;
}

function AccessibleDrawer({ title, onClose, children, busy = false }: { title: string; onClose: () => void; children: ReactNode; busy?: boolean }) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const keydown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape" && !busy) onClose();
      if (event.key !== "Tab") return;
      const focusable = Array.from(panelRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])') ?? []);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", keydown);
    return () => { document.removeEventListener("keydown", keydown); previous?.focus(); };
  }, [busy, onClose]);

  return <div className="fixed inset-0 z-[75] bg-black/30" role="presentation" onMouseDown={() => { if (!busy) onClose(); }}><div ref={panelRef} role="dialog" aria-modal="true" aria-labelledby={titleId} onMouseDown={(event) => event.stopPropagation()} className="absolute bottom-0 right-0 top-0 flex w-full max-w-2xl flex-col border-l border-[#d4d0cc] bg-white shadow-2xl"><header className="flex min-h-16 items-center justify-between gap-3 border-b border-[#e3e0dc] px-4 sm:px-6"><h2 id={titleId} className="font-[family-name:var(--font-cormorant)] text-2xl text-[#253e2b]">{title}</h2><button ref={closeRef} type="button" disabled={busy} onClick={onClose} aria-label="Close editor" className="rounded p-2 text-[#737373] hover:bg-[#faf6ef] disabled:opacity-35">×</button></header><div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">{children}</div></div></div>;
}

function BlogEditor({ post, isNew, saving, onSave, onDelete }: { post: BlogPost; isNew: boolean; saving: boolean; onSave: (post: BlogPost) => Promise<void>; onDelete: () => Promise<void> }) {
  const [draft, setDraft] = useState(post);
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const bodyId = useId();
  const valid = Boolean(draft.title.trim() && draft.slug.trim() && draft.cover.trim() && draft.body.trim() && draft.category.trim() && draft.publishDate && draft.excerpt.trim());
  const update = <K extends keyof BlogPost,>(key: K, value: BlogPost[K]) =>
    setDraft((current) => ({ ...current, [key]: value }));
  const insertMarkup = (markup: string) => update("body", `${draft.body}${draft.body ? "\n\n" : ""}${markup}`);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!valid) return;
    await onSave({ ...draft, title: draft.title.trim(), slug: slugify(draft.slug), category: draft.category.trim(), excerpt: draft.excerpt.trim() });
  }

  const field = "mt-1 w-full rounded-md border border-[#d4d0cc] bg-white px-3 py-2 text-sm outline-none focus:border-[#236339] focus:ring-2 focus:ring-[#236339]/15";
  return <form onSubmit={(event) => void submit(event)} className="space-y-5">
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="text-xs font-medium text-[#253e2b] sm:col-span-2">Title<input required value={draft.title} onChange={(event) => { const title = event.target.value; setDraft((current) => ({ ...current, title, slug: slugTouched ? current.slug : slugify(title) })); }} className={field} /></label>
      <label className="text-xs font-medium text-[#253e2b]">Slug<input required value={draft.slug} onChange={(event) => { setSlugTouched(true); update("slug", slugify(event.target.value)); }} className={field} /></label>
      <label className="text-xs font-medium text-[#253e2b]">Category<input required value={draft.category} onChange={(event) => update("category", event.target.value)} className={field} /></label>
      <label className="text-xs font-medium text-[#253e2b]">Publish date<input required type="date" value={draft.publishDate.slice(0, 10)} onChange={(event) => update("publishDate", event.target.value)} className={field} /></label>
      <label className="text-xs font-medium text-[#253e2b]">Status<select value={draft.status} onChange={(event) => update("status", event.target.value as BlogPost["status"])} className={field}><option value="draft">Draft</option><option value="published">Published</option></select></label>
      <label className="text-xs font-medium text-[#253e2b] sm:col-span-2">Cover image URL<input required type="url" value={draft.cover} onChange={(event) => update("cover", event.target.value)} className={field} /></label>
      <label className="text-xs font-medium text-[#253e2b] sm:col-span-2">Excerpt<textarea required value={draft.excerpt} onChange={(event) => update("excerpt", event.target.value)} className={`${field} min-h-24 resize-y`} /></label>
      <div className="sm:col-span-2">
        <label htmlFor={bodyId} className="text-xs font-medium text-[#253e2b]">Article body</label>
        <div role="toolbar" className="mt-2 flex flex-wrap gap-1 rounded-t-md border border-b-0 border-[#d4d0cc] bg-[#faf6ef] p-2" aria-label="Rich text controls">
          <button type="button" onClick={() => insertMarkup("<strong>Bold text</strong>")} className="rounded border bg-white px-2 py-1 font-bold" aria-label="Insert bold text">B</button>
          <button type="button" onClick={() => insertMarkup("<em>Italic text</em>")} className="rounded border bg-white px-2 py-1 italic" aria-label="Insert italic text">I</button>
          <button type="button" onClick={() => insertMarkup('<a href="https://">Link text</a>')} className="rounded border bg-white px-2 py-1 underline" aria-label="Insert link">Link</button>
          <button type="button" onClick={() => insertMarkup("<h3>Section heading</h3>")} className="rounded border bg-white px-2 py-1" aria-label="Insert level three heading">H3</button>
        </div>
        <textarea id={bodyId} required value={draft.body} onChange={(event) => update("body", event.target.value)} className={`${field} mt-0 min-h-56 rounded-t-none resize-y leading-6`} />
      </div>
    </div>
    {draft.cover ? <div className="overflow-hidden rounded-md border border-[#e3e0dc]"><img src={draft.cover} alt="Blog cover preview" className="aspect-video w-full object-cover" /></div> : null}
    <div className="sticky bottom-0 flex flex-wrap items-center justify-between gap-3 border-t border-[#e3e0dc] bg-white py-3"><div>{!isNew ? <button type="button" disabled={saving} onClick={() => void onDelete()} className="text-xs font-medium text-red-700 underline disabled:opacity-35">Delete story</button> : null}</div><div className="flex gap-2">{isNew ? <span className="inline-flex min-h-10 items-center rounded-full border border-[#d4d0cc] px-4 text-xs text-[#737373]" title="Save this story before previewing it">Save to preview</span> : <Link href={`/blog/${draft.slug}?preview=1`} target="_blank" className="inline-flex min-h-10 items-center rounded-full border border-[#d4d0cc] px-4 text-xs text-[#236339]">Preview ↗</Link>}<PrimaryButton type="submit" disabled={!valid || saving}>{saving ? "Saving…" : draft.status === "published" ? "Publish story" : "Save draft"}</PrimaryButton></div></div>
  </form>;
}

export function RepositoryBlogScreen() {
  const { notify } = useAdminToast();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | BlogPost["status"]>("all");
  const [editing, setEditing] = useState<{ post: BlogPost; isNew: boolean } | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const values = await readResource<BlogPost[]>("blog");
      setPosts(values.sort((a, b) => b.publishDate.localeCompare(a.publishDate)));
    } catch (error) {
      notify(error instanceof Error ? error.message : "Blog posts could not load.", "error");
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => { void load(); }, [load]);

  const closeEditor = useCallback(() => { if (!saving) setEditing(null); }, [saving]);
  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return posts.filter((post) => (status === "all" || post.status === status) && (!needle || `${post.title} ${post.slug} ${post.category} ${post.excerpt}`.toLowerCase().includes(needle)));
  }, [posts, query, status]);

  function createPost() {
    const id = typeof crypto !== "undefined" && "randomUUID" in crypto ? `blog-${crypto.randomUUID()}` : `blog-${Date.now()}`;
    setEditing({ isNew: true, post: { id, title: "", slug: "", cover: "", body: "", category: "Style", publishDate: new Date().toISOString().slice(0, 10), excerpt: "", status: "draft" } });
  }

  async function savePost(post: BlogPost) {
    setSaving(true);
    try {
      const saved = await saveResource("blog", post);
      setPosts((current) => [saved, ...current.filter((item) => item.id !== saved.id)].sort((a, b) => b.publishDate.localeCompare(a.publishDate)));
      setEditing(null);
      notify(saved.status === "published" ? "Blog story published to the shared repository." : "Blog draft saved.");
    } catch (error) {
      notify(error instanceof Error ? error.message : "Blog story could not be saved.", "error");
    } finally {
      setSaving(false);
    }
  }

  async function deletePost(post: BlogPost) {
    if (!window.confirm(`Delete “${post.title || "this story"}”? This cannot be undone.`)) return;
    setSaving(true);
    try {
      await deleteResource("blog", post.id);
      setPosts((current) => current.filter((item) => item.id !== post.id));
      setEditing(null);
      notify("Blog story deleted.");
    } catch (error) {
      notify(error instanceof Error ? error.message : "Blog story could not be deleted.", "error");
    } finally {
      setSaving(false);
    }
  }

  const publishedCount = posts.filter((post) => post.status === "published").length;
  const draftCount = posts.length - publishedCount;

  return <section className="mx-auto w-full max-w-[1440px]">
    <ScreenHeading eyebrow="Content" title="Blog" body="Draft, preview and publish editorial stories from the shared content repository." action={<PrimaryButton onClick={createPost}>New story</PrimaryButton>} />
    <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center">
      <label className="min-w-0 flex-1 lg:max-w-md"><span className="sr-only">Search blog stories</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search title, category or excerpt…" className="h-10 w-full rounded-md border border-[#d4d0cc] bg-white px-3 text-sm outline-none focus:border-[#236339] focus:ring-2 focus:ring-[#236339]/15" /></label>
      <div className="flex max-w-full gap-1 overflow-x-auto pb-1">
        <FilterButton active={status === "all"} onClick={() => setStatus("all")}>All {posts.length}</FilterButton>
        <FilterButton active={status === "published"} onClick={() => setStatus("published")}>Published {publishedCount}</FilterButton>
        <FilterButton active={status === "draft"} onClick={() => setStatus("draft")}>Drafts {draftCount}</FilterButton>
      </div>
    </div>
    {loading ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }, (_, index) => <div key={index} className="h-80 animate-pulse rounded-md border border-[#e3e0dc] bg-[#f1eee9]" />)}</div> : visible.length ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{visible.map((post) => <article key={post.id} className="overflow-hidden rounded-md border border-[#e3e0dc] bg-white"><img src={post.cover} alt="" className="aspect-video w-full bg-[#faf6ef] object-cover" /><div className="p-4"><div className="flex items-center justify-between gap-3"><span className={`rounded-full px-2 py-1 text-[10px] font-medium ${post.status === "published" ? "bg-[#eaf5ee] text-[#236339]" : "bg-[#f8f1df] text-[#80631c]"}`}>{post.status === "published" ? "Published" : "Draft"}</span><time dateTime={post.publishDate} className="text-[11px] text-[#737373]">{formatDate(post.publishDate)}</time></div><h2 className="mt-3 font-[family-name:var(--font-cormorant)] text-2xl leading-tight text-[#253e2b]">{post.title}</h2><p className="mt-1 text-[10px] font-semibold uppercase tracking-[.1em] text-[#c09a62]">{post.category}</p><p className="mt-3 line-clamp-3 text-sm leading-6 text-[#737373]">{post.excerpt}</p><div className="mt-5 flex flex-wrap items-center gap-3"><button type="button" onClick={() => setEditing({ post, isNew: false })} className="text-xs font-medium text-[#236339] underline">Edit</button><Link href={`/blog/${post.slug}?preview=1`} target="_blank" className="text-xs text-[#236339] underline">Preview storefront ↗</Link><button type="button" onClick={() => void deletePost(post)} className="ml-auto text-xs text-red-700 underline">Delete</button></div></div></article>)}</div> : <EmptyState title="No stories found" body="Clear the search or status filter, or create a new editorial story." />}
    {editing ? <AccessibleDrawer title={editing.isNew ? "New story" : `Edit ${editing.post.title}`} onClose={closeEditor} busy={saving}><BlogEditor post={editing.post} isNew={editing.isNew} saving={saving} onSave={savePost} onDelete={() => deletePost(editing.post)} /></AccessibleDrawer> : null}
  </section>;
}
