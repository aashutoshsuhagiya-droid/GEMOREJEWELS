"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type DragEvent } from "react";
import { QuizBand } from "@/components/marketing/quiz-band";
import type { AdminProduct, Collection, QuizOutcome, QuizQuestion } from "@/shared/admin-types";
import { AdminButton, AdminCard, AdminField, AdminSelect } from "./catalog/admin-ui";
import { AdminDataTable, AdminPagination, TableSkeleton, downloadAdminCsv, type AdminTableColumn } from "./data-table";
import { AdminDrawer, EmptyAdminState, PageHeading } from "./orders";
import { useAdminToast } from "./toast";
import { useDialogFocus } from "./use-dialog-focus";

type StorefrontConfig = { quizPublished: boolean; instagramHandle: string; arEnabled: boolean; arNote: string };

async function readResource<T>(resource: string): Promise<T> {
  const response = await fetch(`/api/admin/${resource}`, { credentials: "same-origin" });
  if (!response.ok) throw new Error(`Unable to load ${resource}.`);
  return response.json() as Promise<T>;
}

async function saveResource<T>(resource: string, value: T): Promise<T> {
  const response = await fetch(`/api/admin/${resource}`, {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ value })
  });
  if (!response.ok) {
    const result = await response.json().catch(() => ({})) as { error?: string };
    throw new Error(result.error || `Unable to save ${resource}.`);
  }
  return response.json() as Promise<T>;
}

const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export function RepositoryCollectionsScreen() {
  const { notify } = useAdminToast();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [editing, setEditing] = useState<Collection | null>(null);
  const [productQuery, setProductQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dragging, setDragging] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [nextCollections, nextProducts] = await Promise.all([
        readResource<Collection[]>("collections"),
        readResource<AdminProduct[]>("products")
      ]);
      setCollections(nextCollections.sort((a, b) => a.homepageOrder - b.homepageOrder));
      setProducts(nextProducts);
    } catch (error) {
      notify(error instanceof Error ? error.message : "Collections could not load.", "error");
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => { void load(); }, [load]);

  const names = useMemo(() => new Map(products.map((product) => [product.id, product.name])), [products]);

  async function saveCollection() {
    if (!editing || !editing.name.trim() || !editing.slug.trim()) return;
    setSaving(true);
    try {
      const saved = await saveResource<Collection>("collections", editing);
      setCollections((current) => current.map((item) => item.id === saved.id ? saved : item).sort((a, b) => a.homepageOrder - b.homepageOrder));
      setEditing(null);
      setProductQuery("");
      notify(`${saved.name} now powers the storefront collection, homepage and mega menu.`);
    } catch (error) {
      notify(error instanceof Error ? error.message : "Collection could not save.", "error");
    } finally {
      setSaving(false);
    }
  }

  async function reorder(sourceId: string, targetId?: string) {
    if (!targetId || sourceId === targetId) return;
    const ordered = [...collections].sort((a, b) => a.homepageOrder - b.homepageOrder);
    const sourceIndex = ordered.findIndex((item) => item.id === sourceId);
    const targetIndex = ordered.findIndex((item) => item.id === targetId);
    if (sourceIndex < 0 || targetIndex < 0) return;
    const [moved] = ordered.splice(sourceIndex, 1);
    ordered.splice(targetIndex, 0, moved);
    const next = ordered.map((item, index) => ({ ...item, homepageOrder: index }));
    setCollections(next);
    try {
      await Promise.all(next.map((item) => saveResource("collections", item)));
      notify("Homepage collection order saved.");
    } catch (error) {
      notify(error instanceof Error ? error.message : "Collection order could not save.", "error");
      void load();
    }
  }

  const ordered = [...collections].sort((a, b) => a.homepageOrder - b.homepageOrder);
  if (loading) return <section className="mx-auto max-w-[1440px]"><PageHeading eyebrow="Catalog" title="Collections" description="Loading shared collection records…"/><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <div key={index} className="h-72 animate-pulse rounded-md border bg-[#f4efe9]"/>)}</div></section>;

  return <section className="mx-auto max-w-[1440px]">
    <PageHeading eyebrow="Catalog" title="Collections" description="Drag cards to reorder the homepage; every saved field is shared with the storefront."/>
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {ordered.map((collection, index) => <AdminCard key={collection.id} className="overflow-hidden" >
        <div
          draggable
          onDragStart={() => setDragging(collection.id)}
          onDragEnd={() => setDragging(null)}
          onDragOver={(event) => event.preventDefault()}
          onDrop={() => { if (dragging) void reorder(dragging, collection.id); setDragging(null); }}
          className={`cursor-grab ${dragging === collection.id ? "opacity-50" : ""}`}
          aria-label={`Drag ${collection.name} to reorder`}
        >
          <img src={collection.coverImage} alt={`${collection.name} collection cover`} className="aspect-[4/3] w-full object-cover"/>
          <div className="p-4">
            <div className="flex items-start justify-between gap-3"><div><span className="text-[10px] uppercase tracking-[.12em] text-[#737373]">⋮⋮ Homepage {index + 1}</span><h2 className="font-serif text-2xl text-[#253e2b]">{collection.name}</h2></div>{collection.homepage ? <span className="rounded-full bg-[#eaf5ee] px-2 py-1 text-[10px] text-[#236339]">Homepage</span> : null}</div>
            <p className="mt-2 text-xs text-[#737373]">{collection.productIds.length} products · AUD ${collection.revenue30d.toLocaleString("en-AU")} in 30d</p>
            <p className="mt-2 truncate text-[11px] text-[#737373]">Mega tile: {collection.megaProductId ? names.get(collection.megaProductId) ?? "Selected product" : "None"}</p>
            <div className="mt-4 flex gap-2"><AdminButton tone="secondary" onClick={() => { setEditing({ ...collection, productIds: [...collection.productIds] }); setProductQuery(""); }} className="flex-1">Edit</AdminButton><AdminButton tone="quiet" disabled={index === 0} onClick={() => void reorder(collection.id, ordered[index - 1]?.id)} className="!px-2" >↑</AdminButton><AdminButton tone="quiet" disabled={index === ordered.length - 1} onClick={() => void reorder(collection.id, ordered[index + 1]?.id)} className="!px-2">↓</AdminButton></div>
          </div>
        </div>
      </AdminCard>)}
    </div>
    {!collections.length ? <AdminCard><EmptyAdminState title="No collections yet" body="Shared collection records will appear here."/></AdminCard> : null}
    {editing ? <AdminDrawer title={`Edit ${editing.name}`} onClose={() => setEditing(null)} footer={<div className="flex justify-end gap-2"><AdminButton tone="secondary" onClick={() => setEditing(null)}>Cancel</AdminButton><AdminButton disabled={saving || !editing.name.trim() || !editing.slug.trim()} onClick={() => void saveCollection()}>{saving ? "Saving…" : "Save collection"}</AdminButton></div>}>
      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2"><AdminField label="Collection name" value={editing.name} onChange={(name) => setEditing({ ...editing, name })} required/><AdminField label="URL slug" value={editing.slug} onChange={(value) => setEditing({ ...editing, slug: slugify(value) })} required/></div>
        <AdminField label="Description" value={editing.description} onChange={(description) => setEditing({ ...editing, description })} textarea/>
        <AdminField label="Cover image URL" value={editing.coverImage} onChange={(coverImage) => setEditing({ ...editing, coverImage })}/>
        {editing.coverImage ? <img src={editing.coverImage} alt="Collection cover preview" className="aspect-[16/9] w-full rounded-md object-cover"/> : null}
        <label className="flex items-center justify-between rounded-md bg-[#faf6ef] p-4 text-sm"><span><strong className="block text-[#253e2b]">Show on homepage</strong><small className="text-[#737373]">Uses the card order from the collection grid.</small></span><input type="checkbox" checked={editing.homepage} onChange={(event) => setEditing({ ...editing, homepage: event.target.checked })} className="h-5 w-5 accent-[#236339]"/></label>
        <AdminSelect label="Featured mega-menu tile" value={editing.megaProductId ?? ""} onChange={(megaProductId) => setEditing({ ...editing, megaProductId: megaProductId || undefined })} options={[{ value: "", label: "No featured tile" }, ...editing.productIds.map((id) => ({ value: id, label: names.get(id) ?? id }))]}/>
        <div><div className="flex items-end justify-between gap-3"><div><p className="text-sm font-medium text-[#253e2b]">Product membership</p><p className="text-xs text-[#737373]">{editing.productIds.length} selected</p></div><input value={productQuery} onChange={(event) => setProductQuery(event.target.value)} placeholder="Filter products" aria-label="Filter collection products" className="w-44 rounded-md border border-[#d4d0cc] px-3 py-2 text-xs"/></div>
          <div className="mt-3 max-h-80 divide-y divide-[#eeeae5] overflow-y-auto rounded-md border border-[#e3e0dc]">{products.filter((product) => `${product.name} ${product.sku}`.toLowerCase().includes(productQuery.toLowerCase())).map((product) => <label key={product.id} className="flex cursor-pointer items-center gap-3 p-3 hover:bg-[#fcfbf9]"><input type="checkbox" checked={editing.productIds.includes(product.id)} onChange={() => setEditing({ ...editing, productIds: editing.productIds.includes(product.id) ? editing.productIds.filter((id) => id !== product.id) : [...editing.productIds, product.id] })} className="h-4 w-4 accent-[#236339]"/><img src={product.images[0]?.src} alt="" className="h-10 w-10 rounded object-cover"/><span><strong className="block text-xs text-[#253e2b]">{product.name}</strong><small className="font-mono text-[10px] text-[#737373]">{product.sku}</small></span></label>)}</div>
        </div>
      </div>
    </AdminDrawer> : null}
  </section>;
}

export function RepositoryInventoryScreen() {
  const { notify } = useAdminToast();
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "low" | "out">("all");
  const [savingIds, setSavingIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const load = useCallback(async () => {
    setLoading(true);
    try { setProducts(await readResource<AdminProduct[]>("products")); }
    catch (error) { notify(error instanceof Error ? error.message : "Inventory could not load.", "error"); }
    finally { setLoading(false); }
  }, [notify]);
  useEffect(() => { void load(); }, [load]);

  const low = products.filter((product) => product.stock < 5);
  const visible = useMemo(() => products.filter((product) => {
    const statusMatch = filter === "all" || (filter === "low" ? product.stock > 0 && product.stock < 5 : product.stock === 0);
    return statusMatch && `${product.name} ${product.sku}`.toLowerCase().includes(query.toLowerCase());
  }).sort((a, b) => a.stock - b.stock), [filter, products, query]);
  const totalPages = Math.max(1, Math.ceil(visible.length / pageSize));
  const rows = visible.slice((page - 1) * pageSize, page * pageSize);
  useEffect(() => setPage(1), [filter, pageSize, query]);

  async function adjust(product: AdminProduct, change: number) {
    if (savingIds.includes(product.id)) return;
    const next = { ...product, stock: Math.max(0, product.stock + change) };
    setProducts((current) => current.map((item) => item.id === product.id ? next : item));
    setSavingIds((current) => [...current, product.id]);
    try {
      const saved = await saveResource<AdminProduct>("products", next);
      setProducts((current) => current.map((item) => item.id === saved.id ? saved : item));
      notify(`${saved.name} stock updated to ${saved.stock}.`);
    } catch (error) {
      setProducts((current) => current.map((item) => item.id === product.id ? product : item));
      notify(error instanceof Error ? error.message : "Stock could not update.", "error");
    } finally {
      setSavingIds((current) => current.filter((id) => id !== product.id));
    }
  }

  const columns: AdminTableColumn<AdminProduct>[] = [
    { id: "product", label: "Product", className: "min-w-[230px]", render: (product) => <div className="flex items-center gap-3"><img src={product.images[0]?.src} alt="" className="h-11 w-11 rounded-md object-cover"/><span><strong className="block text-xs text-[#253e2b]">{product.name}</strong><small className="font-mono text-[10px] text-[#737373]">{product.sku}</small></span></div> },
    { id: "status", label: "Status", render: (product) => <span className={`rounded-full px-2 py-1 text-[10px] ${product.stock === 0 ? "bg-red-50 text-red-700" : product.stock < 5 ? "bg-[#f8f1df] text-[#80631c]" : "bg-[#eaf5ee] text-[#236339]"}`}>{product.stock === 0 ? "Out of stock" : product.stock < 5 ? "Low" : "Healthy"}</span> },
    { id: "stock", label: "Stock on hand", className: "min-w-[180px]", render: (product) => <div className="flex items-center gap-2"><button type="button" aria-label={`Reduce ${product.name} stock`} disabled={product.stock === 0 || savingIds.includes(product.id)} onClick={() => void adjust(product, -1)} className="h-8 w-8 rounded-full border border-[#d4d0cc] disabled:opacity-30">−</button><output className={`min-w-9 text-center font-medium ${product.stock < 5 ? "text-red-600" : "text-[#253e2b]"}`}>{product.stock}</output><button type="button" aria-label={`Increase ${product.name} stock`} disabled={savingIds.includes(product.id)} onClick={() => void adjust(product, 1)} className="h-8 w-8 rounded-full border border-[#d4d0cc] disabled:opacity-30">+</button></div> },
    { id: "threshold", label: "Low threshold", render: () => <span className="text-xs text-[#737373]">5 units</span> }
  ];

  return <section className="mx-auto max-w-[1440px]"><PageHeading eyebrow="Catalog" title="Inventory" description="Stock edits write to the same products shown on the storefront." action={<button type="button" onClick={() => { downloadAdminCsv("gemoire-inventory.csv", ["SKU", "Product", "Stock", "Status"], visible.map((product) => [product.sku, product.name, product.stock, product.stock === 0 ? "Out" : product.stock < 5 ? "Low" : "Healthy"])); notify("Inventory CSV downloaded."); }} className="rounded-full border border-[#d4d0cc] bg-white px-4 py-2 text-xs text-[#236339]">Export CSV</button>}/>
    {low.length ? <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-4"><strong className="text-sm text-red-800">{low.length} item{low.length === 1 ? "" : "s"} below the five-unit threshold</strong><p className="mt-1 text-xs text-red-700">{low.slice(0, 8).map((product) => `${product.name} (${product.stock})`).join(" · ")}{low.length > 8 ? ` · +${low.length - 8} more` : ""}</p></div> : null}
    <div className="mb-4 flex flex-col gap-3 lg:flex-row"><label className="flex-1 lg:max-w-sm"><span className="sr-only">Search inventory</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search product or SKU" className="h-10 w-full rounded-md border border-[#d4d0cc] bg-white px-3 text-sm"/></label><div className="flex gap-2">{([ ["all", `All ${products.length}`], ["low", `Low ${products.filter((product) => product.stock > 0 && product.stock < 5).length}`], ["out", `Out ${products.filter((product) => product.stock === 0).length}`] ] as const).map(([value, label]) => <button type="button" key={value} onClick={() => setFilter(value)} className={`rounded-full px-3 py-2 text-xs ${filter === value ? "bg-[#236339] text-white" : "border border-[#d4d0cc] bg-white"}`}>{label}</button>)}</div></div>
    {loading ? <TableSkeleton columns={4}/> : <><AdminDataTable columns={columns} rows={rows} empty={<EmptyAdminState title="No inventory found" body="Clear the search or choose another stock filter."/>}/><AdminPagination page={page} totalPages={totalPages} onPageChange={setPage} total={visible.length} pageSize={pageSize} onPageSizeChange={setPageSize}/></>}
  </section>;
}

const settingStyles = ["Solitaire", "Bezel", "Halo", "East-West", "Three-Stone", "Toi et Moi", "Eternity"];

export function RepositoryQuizBuilderScreen() {
  const { notify } = useAdminToast();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [outcomes, setOutcomes] = useState<QuizOutcome[]>([]);
  const [settings, setSettings] = useState<StorefrontConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);
  const [dragging, setDragging] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  useDialogFocus(previewRef, () => setPreview(false), preview);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [nextQuestions, nextOutcomes, nextSettings] = await Promise.all([
        readResource<QuizQuestion[]>("quizQuestions"),
        readResource<QuizOutcome[]>("quizOutcomes"),
        readResource<StorefrontConfig>("storefront-config")
      ]);
      setQuestions(nextQuestions.sort((a, b) => a.position - b.position));
      setOutcomes(nextOutcomes);
      setSettings(nextSettings);
    } catch (error) {
      notify(error instanceof Error ? error.message : "Quiz builder could not load.", "error");
    } finally { setLoading(false); }
  }, [notify]);
  useEffect(() => { void load(); }, [load]);

  function moveQuestion(sourceId: string, targetId?: string) {
    if (!targetId || sourceId === targetId) return;
    const next = [...questions];
    const from = next.findIndex((item) => item.id === sourceId);
    const to = next.findIndex((item) => item.id === targetId);
    if (from < 0 || to < 0) return;
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setQuestions(next.map((item, position) => ({ ...item, position })));
  }

  function outcomeAt(first: number, second: number): QuizOutcome {
    return outcomes.find((item) => item.first === first && item.second === second) ?? { id: `outcome-${first}-${second}`, first, second, styles: ["Solitaire", "Bezel"] };
  }

  function changeOutcome(first: number, second: number, styleIndex: number, value: string) {
    const current = outcomeAt(first, second);
    const styles = [...current.styles];
    styles[styleIndex] = value;
    const next = { ...current, styles: styles.slice(0, 2) };
    setOutcomes((items) => items.some((item) => item.first === first && item.second === second) ? items.map((item) => item.first === first && item.second === second ? next : item) : [...items, next]);
  }

  async function persist(showNotice = true) {
    if (!settings || questions.length !== 3 || questions.some((question) => !question.question.trim() || question.answers.length !== 3 || question.answers.some((answer) => !answer.trim()))) {
      notify("Keep three complete questions with three answers each.", "error");
      return false;
    }
    setSaving(true);
    try {
      const normalizedQuestions = questions.map((question, position) => ({ ...question, position }));
      const normalizedOutcomes = Array.from({ length: 9 }, (_, index) => outcomeAt(Math.floor(index / 3), index % 3));
      await Promise.all([...normalizedQuestions.map((item) => saveResource("quizQuestions", item)), ...normalizedOutcomes.map((item) => saveResource("quizOutcomes", item)), saveResource("storefront-config", settings)]);
      setQuestions(normalizedQuestions);
      setOutcomes(normalizedOutcomes);
      if (showNotice) notify("Quiz questions, recommendations and publish state saved to the storefront.");
      return true;
    } catch (error) {
      notify(error instanceof Error ? error.message : "Quiz could not save.", "error");
      return false;
    } finally { setSaving(false); }
  }

  async function togglePublished() {
    if (!settings) return;
    const next = { ...settings, quizPublished: !(settings.quizPublished ?? true) };
    setSettings(next);
    try {
      const saved = await saveResource<StorefrontConfig>("storefront-config", next);
      setSettings(saved);
      notify(saved.quizPublished === false ? "Quiz is offline on the homepage." : "Quiz is published on the homepage.");
    } catch (error) {
      setSettings(settings);
      notify(error instanceof Error ? error.message : "Publish state could not update.", "error");
    }
  }

  if (loading) return <section className="mx-auto max-w-[1320px]"><PageHeading eyebrow="GEMOIRE extras" title="Quiz Builder" description="Loading the live homepage quiz…"/><div className="h-80 animate-pulse rounded-md border bg-[#f4efe9]"/></section>;
  const first = questions[0]; const second = questions[1];
  return <section className="mx-auto max-w-[1320px]"><PageHeading eyebrow="GEMOIRE extras" title="Quiz Builder" description="Edit the exact questions and 3×3 recommendation matrix returned to the storefront." action={<div className="flex gap-2"><AdminButton tone="secondary" onClick={() => void persist(false).then((ok) => { if (ok) setPreview(true); })}>Preview storefront quiz</AdminButton><AdminButton tone={(settings?.quizPublished ?? true) ? "secondary" : "primary"} onClick={() => void togglePublished()}>{(settings?.quizPublished ?? true) ? "Set offline" : "Publish"}</AdminButton></div>}/>
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_470px]"><div className="space-y-4">{questions.map((question, questionIndex) => <AdminCard key={question.id} className={`p-5 ${dragging === question.id ? "opacity-50" : ""}`}><div draggable onDragStart={() => setDragging(question.id)} onDragEnd={() => setDragging(null)} onDragOver={(event: DragEvent) => event.preventDefault()} onDrop={() => { if (dragging) moveQuestion(dragging, question.id); setDragging(null); }} className="flex gap-3"><span className="cursor-grab pt-2 text-xs text-[#737373]" aria-label={`Drag question ${questionIndex + 1}`}>⋮⋮ Q{questionIndex + 1}</span><div className="min-w-0 flex-1"><input value={question.question} onChange={(event) => setQuestions((items) => items.map((item) => item.id === question.id ? { ...item, question: event.target.value } : item))} aria-label={`Question ${questionIndex + 1}`} className="w-full border-b border-[#d4d0cc] pb-2 font-serif text-2xl text-[#253e2b] outline-none focus:border-[#236339]"/><div className="mt-4 grid gap-3 sm:grid-cols-3">{question.answers.map((answer, answerIndex) => <label key={answerIndex} className="text-xs font-medium">Option {answerIndex + 1}<input value={answer} onChange={(event) => setQuestions((items) => items.map((item) => item.id === question.id ? { ...item, answers: item.answers.map((value, index) => index === answerIndex ? event.target.value : value) } : item))} className="mt-1 w-full rounded-md border border-[#d4d0cc] px-3 py-2 text-sm"/></label>)}</div></div><div className="grid gap-1"><AdminButton tone="quiet" disabled={questionIndex === 0} onClick={() => moveQuestion(question.id, questions[questionIndex - 1]?.id)} className="!min-h-8 !px-2">↑</AdminButton><AdminButton tone="quiet" disabled={questionIndex === questions.length - 1} onClick={() => moveQuestion(question.id, questions[questionIndex + 1]?.id)} className="!min-h-8 !px-2">↓</AdminButton></div></div></AdminCard>)}</div>
      <AdminCard className="h-fit overflow-hidden"><div className="border-b border-[#e3e0dc] p-5"><h2 className="font-serif text-2xl text-[#253e2b]">Outcome matrix</h2><p className="mt-1 text-xs text-[#737373]">Question 1 × Question 2; every cell recommends two settings.</p></div>{first && second ? <div className="overflow-x-auto p-3"><table className="min-w-[430px] text-left text-[10px]"><thead><tr><th className="p-2 text-[#737373]">Q1 \ Q2</th>{second.answers.map((answer) => <th key={answer} className="max-w-24 p-2 text-[#253e2b]">{answer}</th>)}</tr></thead><tbody>{first.answers.map((answer, row) => <tr key={answer} className="border-t"><th className="max-w-24 p-2 text-[#253e2b]">{answer}</th>{second.answers.map((_, column) => { const outcome = outcomeAt(row, column); return <td key={column} className="p-1"><select aria-label={`Primary style for outcome ${row + 1}, ${column + 1}`} value={outcome.styles[0] ?? "Solitaire"} onChange={(event) => changeOutcome(row, column, 0, event.target.value)} className="mb-1 w-full rounded border p-1">{settingStyles.map((style) => <option key={style}>{style}</option>)}</select><select aria-label={`Secondary style for outcome ${row + 1}, ${column + 1}`} value={outcome.styles[1] ?? "Bezel"} onChange={(event) => changeOutcome(row, column, 1, event.target.value)} className="w-full rounded border p-1">{settingStyles.map((style) => <option key={style}>{style}</option>)}</select></td>; })}</tr>)}</tbody></table></div> : null}<div className="border-t p-4"><AdminButton onClick={() => void persist()} disabled={saving} className="w-full">{saving ? "Saving…" : "Save quiz builder"}</AdminButton></div></AdminCard>
    </div>
    {preview ? <div className="fixed inset-0 z-[80] overflow-y-auto bg-black/40 p-4" role="presentation" onMouseDown={() => setPreview(false)}><div ref={previewRef} role="dialog" aria-modal="true" aria-label="Storefront quiz preview" onMouseDown={(event) => event.stopPropagation()} className="mx-auto mt-[6vh] max-w-4xl rounded-md bg-white shadow-2xl"><div className="flex items-center justify-between border-b px-5 py-3"><strong className="text-sm text-[#253e2b]">Actual storefront quiz</strong><button data-autofocus type="button" onClick={() => setPreview(false)} className="rounded px-3 py-2 text-xs text-[#236339]">Close</button></div><QuizBand preview/></div></div> : null}
  </section>;
}

export function RepositoryArTryOnScreen() {
  const { notify } = useAdminToast();
  const [settings, setSettings] = useState<StorefrontConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [simulating, setSimulating] = useState(false);
  useEffect(() => { void readResource<StorefrontConfig>("storefront-config").then(setSettings).catch((error) => notify(error instanceof Error ? error.message : "AR settings could not load.", "error")); }, [notify]);

  async function persist() {
    if (!settings) return;
    setSaving(true);
    try { setSettings(await saveResource<StorefrontConfig>("storefront-config", settings)); notify("AR try-on state and waitlist note are live on product pages."); }
    catch (error) { notify(error instanceof Error ? error.message : "AR settings could not save.", "error"); }
    finally { setSaving(false); }
  }

  if (!settings) return <section className="mx-auto max-w-[980px]"><PageHeading eyebrow="GEMOIRE extras" title="AR try-on"/><div className="h-64 animate-pulse rounded-md border bg-[#f4efe9]"/></section>;
  return <section className="mx-auto max-w-[980px]"><PageHeading eyebrow="GEMOIRE extras" title="AR try-on" description="This toggle and message are read by the storefront product-page modal."/><div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]"><AdminCard className="p-5"><label className="flex items-center justify-between rounded-md bg-[#faf6ef] p-4 text-sm"><span><strong className="block text-[#253e2b]">Enable AR try-on</strong><small className="text-[#737373]">Show “View on your hand” on product pages.</small></span><input type="checkbox" checked={settings.arEnabled} onChange={(event) => setSettings({ ...settings, arEnabled: event.target.checked })} className="h-5 w-5 accent-[#236339]"/></label><div className="mt-5"><AdminField label="Waitlist / modal note" value={settings.arNote} onChange={(arNote) => setSettings({ ...settings, arNote })} textarea/></div><AdminButton className="mt-5" disabled={saving || !settings.arNote.trim()} onClick={() => void persist()}>{saving ? "Saving…" : "Save AR settings"}</AdminButton></AdminCard><AdminCard className="overflow-hidden"><div className="grid aspect-square place-items-center bg-[#253e2b] p-6 text-center text-white"><div><span className="inline-grid h-14 w-14 place-items-center rounded-full border border-white/50 text-2xl">✧</span><p className="mt-4 font-serif text-3xl">Hand preview</p><p className="mt-2 text-sm text-white/70">{settings.arEnabled ? "Preview mode available" : "AR is currently off"}</p>{simulating ? <div className="mt-5 rounded-full bg-white/15 px-4 py-2 text-xs">Simulated ring position: 82% confidence</div> : null}</div></div><div className="p-4"><AdminButton tone="secondary" disabled={!settings.arEnabled} onClick={() => { setSimulating((value) => !value); notify(simulating ? "AR simulation closed." : "AR simulation started.", "info"); }} className="w-full">{simulating ? "Stop simulation" : "Simulate test mode"}</AdminButton></div></AdminCard></div></section>;
}
