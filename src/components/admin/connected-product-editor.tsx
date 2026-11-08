"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { ProductCard } from "@/components/commerce/product-card";
import type { AdminProduct, Collection, ProductImage, SeoPage } from "@/shared/admin-types";
import { siteUrl } from "@/shared/site-config";

const placeholder = "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1200&q=85";
const slugify = (text: string) => text.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const fieldClass = "mt-1 w-full rounded-md border border-[#d4d0cc] bg-white px-3 py-2 text-sm outline-none focus:border-[#236339] focus:ring-2 focus:ring-[#236339]/20";
const secondaryButtonClass = "rounded-full border border-[#d4d0cc] bg-white px-3 py-2 text-xs font-medium text-[#253e2b] hover:border-[#236339] disabled:cursor-not-allowed disabled:opacity-35";
type RichTextCommand = "bold" | "italic" | "link" | "heading";

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const body = await response.json().catch(() => ({})) as T & { error?: string };
  if (!response.ok) throw new Error(body.error || "The repository request could not be completed.");
  return body;
}

function ensureImages(product?: AdminProduct): ProductImage[] {
  const images = (product?.images ?? []).filter((image) => image.src.trim()).slice(0, 8);
  if (!images.length) return [{ src: placeholder, alt: "Product image", isPrimary: true }];
  if (!images.some((image) => image.isPrimary)) return images.map((image, index) => ({ ...image, isPrimary: index === 0 }));
  let primaryFound = false;
  return images.map((image) => {
    const isPrimary = image.isPrimary && !primaryFound;
    if (isPrimary) primaryFound = true;
    return { ...image, isPrimary };
  });
}

function plainText(value: string) {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function RichTextField({ id, label, value, onChange, rows = 5 }: { id: string; label: string; value: string; onChange: (value: string) => void; rows?: number }) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function format(command: RichTextCommand) {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.slice(start, end);
    const formats: Record<RichTextCommand, [string, string, string]> = {
      bold: ["<strong>", "</strong>", "bold text"],
      italic: ["<em>", "</em>", "italic text"],
      link: ["<a href=\"https://\">", "</a>", "link text"],
      heading: ["<h3>", "</h3>", "Section heading"]
    };
    const [before, after, fallback] = formats[command];
    const content = selected || fallback;
    const next = `${value.slice(0, start)}${before}${content}${after}${value.slice(end)}`;
    onChange(next);
    window.requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + content.length);
    });
  }

  return <div>
    <label htmlFor={id} className="text-xs font-medium">{label}</label>
    <div role="toolbar" aria-label={`${label} formatting`} className="mt-1 flex flex-wrap gap-1 rounded-t-md border border-b-0 border-[#d4d0cc] bg-[#faf6ef] p-2">
      <button type="button" aria-label="Bold selected text" aria-controls={id} onClick={() => format("bold")} className={secondaryButtonClass}><strong>B</strong></button>
      <button type="button" aria-label="Italicise selected text" aria-controls={id} onClick={() => format("italic")} className={secondaryButtonClass}><em>I</em></button>
      <button type="button" aria-label="Add link to selected text" aria-controls={id} onClick={() => format("link")} className={secondaryButtonClass}>Link</button>
      <button type="button" aria-label="Format selected text as heading level 3" aria-controls={id} onClick={() => format("heading")} className={secondaryButtonClass}>H3</button>
    </div>
    <textarea ref={textareaRef} id={id} rows={rows} value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-b-md border border-[#d4d0cc] bg-white px-3 py-2 font-mono text-sm leading-6 outline-none focus:border-[#236339] focus:ring-2 focus:ring-[#236339]/20" />
    <p className="mt-1 text-[11px] text-[#737373]">Select text, then apply a formatting control. Stored markup remains editable.</p>
  </div>;
}

export function ConnectedProductEditor({ initial }: { initial?: AdminProduct }) {
  const router = useRouter();
  const [productId] = useState(() => initial?.id ?? `prod-${Date.now()}`);
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(() => Boolean(initial && initial.slug !== slugify(initial.name)));
  const [collections, setCollections] = useState<Collection[]>([]);
  const [collectionsLoading, setCollectionsLoading] = useState(true);
  const [selectedCollectionIds, setSelectedCollectionIds] = useState<string[]>(initial?.collectionIds.length ? initial.collectionIds : ["aaria"]);
  const [customCollectionName, setCustomCollectionName] = useState("");
  const [creatingCollection, setCreatingCollection] = useState(false);
  const [priceAud, setPriceAud] = useState(String(initial?.priceAud ?? ""));
  const [priceUsd, setPriceUsd] = useState(String(initial?.priceUsd ?? ""));
  const [cost, setCost] = useState(String(initial?.cost ?? ""));
  const [stock, setStock] = useState(String(initial?.stock ?? 8));
  const [igeCertNo, setIgeCertNo] = useState(initial?.igeCertNo ?? "IGI-GL-PENDING");
  const [images, setImages] = useState<ProductImage[]>(() => ensureImages(initial));
  const [hoverImage, setHoverImage] = useState(initial?.hoverImage ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [details, setDetails] = useState(initial?.details ?? "");
  const [setting, setSetting] = useState(initial?.setting ?? "Solitaire");
  const [shape, setShape] = useState(initial?.shape ?? "Oval");
  const [carat, setCarat] = useState(initial?.carat ?? "1.20ct");
  const [clarity, setClarity] = useState(initial?.clarity ?? "VVS2");
  const [color, setColor] = useState(initial?.color ?? "E");
  const [metal, setMetal] = useState(initial?.metal ?? ["18ct Yellow Gold"]);
  const [badges, setBadges] = useState(initial?.badges ?? []);
  const [readyToShip, setReadyToShip] = useState(initial?.readyToShip ?? false);
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [metaTitle, setMetaTitle] = useState(initial?.seoTitle ?? initial?.name ?? "");
  const [metaDescription, setMetaDescription] = useState(initial?.seoDescription ?? initial?.description ?? "");
  const [ogImage, setOgImage] = useState(initial?.ogImage ?? initial?.images.find((image) => image.isPrimary)?.src ?? initial?.images[0]?.src ?? placeholder);
  const [jsonLd, setJsonLd] = useState(initial?.jsonLdEnabled ?? true);
  const [view, setView] = useState<"card" | "detail">("card");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function loadRepositoryData() {
      setCollectionsLoading(true);
      try {
        const [collectionValues, seoValues] = await Promise.all([
          requestJson<Collection[]>("/api/admin/collections"),
          requestJson<SeoPage[]>("/api/admin/seoPages")
        ]);
        if (cancelled) return;
        setCollections(collectionValues.sort((a, b) => a.name.localeCompare(b.name)));
        const seo = initial ? seoValues.find((value) => value.id === `seo-${initial.id}`) : undefined;
        if (seo) {
          setMetaTitle(initial?.seoTitle ?? seo.title);
          setMetaDescription(initial?.seoDescription ?? seo.description);
          setOgImage(initial?.ogImage ?? seo.ogImage);
          setJsonLd(initial?.jsonLdEnabled ?? seo.jsonLdType === "Product");
        }
      } catch (error) {
        if (!cancelled) setNotice(error instanceof Error ? error.message : "Collections could not load.");
      } finally {
        if (!cancelled) setCollectionsLoading(false);
      }
    }
    void loadRepositoryData();
    return () => { cancelled = true; };
  }, [initial]);

  const primaryImage = images.find((image) => image.isPrimary) ?? images[0];
  const primaryCollection = selectedCollectionIds[0] ?? "aaria";
  const valid = Boolean(name.trim() && slug.trim() && Number(priceAud) > 0 && primaryImage?.src.trim() && selectedCollectionIds.length && metal.length);
  const preview = useMemo(() => ({
    slug: slug || "preview",
    name: name || "Untitled product",
    collection: primaryCollection === "kavya" ? "Kavya" as const : primaryCollection === "mira" ? "Mira" as const : "Aaria" as const,
    category: "engagement" as const,
    setting,
    shape,
    carat,
    clarity,
    metal: (metal[0] as "Platinum" | "18ct Yellow Gold" | "18ct Rose Gold" | "18ct White Gold") || "18ct Yellow Gold",
    audPrice: Number(priceAud) || 0,
    usdPrice: Number(priceUsd) || 0,
    rating: initial?.rating ?? 4.9,
    reviewCount: initial?.reviewCount ?? 0,
    tag: badges.includes("New") ? "New" as const : badges.includes("Bestseller") ? "Bestseller" as const : undefined,
    image: primaryImage?.src || placeholder,
    imageAlt: primaryImage?.alt || `Preview for ${name}`,
    images: images.filter((item) => item.src.trim()),
    hoverImage: hoverImage.trim() || undefined,
    description: plainText(description),
    details,
    igeCertNo,
    color
  }), [badges, carat, clarity, color, description, details, hoverImage, igeCertNo, images, initial, metal, name, priceAud, priceUsd, primaryCollection, primaryImage, setting, shape, slug]);

  function toggle(list: string[], value: string, set: (items: string[]) => void) {
    set(list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);
  }

  function handleNameChange(nextName: string) {
    setName(nextName);
    if (!slugEdited) setSlug(slugify(nextName));
  }

  function handleSlugChange(nextSlug: string) {
    setSlug(slugify(nextSlug));
    setSlugEdited(true);
  }

  function updateImage(index: number, patch: Partial<ProductImage>) {
    const previous = images[index];
    if (patch.src !== undefined && previous && hoverImage === previous.src) setHoverImage(patch.src);
    setImages((current) => current.map((image, imageIndex) => imageIndex === index ? { ...image, ...patch } : image));
  }

  function choosePrimaryImage(index: number) {
    setImages((current) => current.map((image, imageIndex) => ({ ...image, isPrimary: imageIndex === index })));
  }

  function removeImage(index: number) {
    if (hoverImage && images[index]?.src === hoverImage) setHoverImage("");
    setImages((current) => {
      if (current.length === 1) return current;
      const removedWasPrimary = current[index]?.isPrimary;
      const next = current.filter((_, imageIndex) => imageIndex !== index);
      return removedWasPrimary ? next.map((image, imageIndex) => ({ ...image, isPrimary: imageIndex === 0 })) : next;
    });
  }

  function uploadLocalImage(event: ChangeEvent<HTMLInputElement>, index: number) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setNotice("Choose a PNG, JPEG, WebP or another image file.");
      return;
    }
    if (file.size > 2_000_000) {
      setNotice("Local preview images must be 2 MB or smaller.");
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => setNotice("That local image could not be read.");
    reader.onload = () => {
      if (typeof reader.result !== "string") return;
      const currentAlt = images[index]?.alt.trim();
      updateImage(index, { src: reader.result, alt: currentAlt || file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ") });
      setNotice(`${file.name} is ready to preview and will be stored with this demo product.`);
    };
    reader.readAsDataURL(file);
  }

  function toggleCollection(collectionId: string) {
    setSelectedCollectionIds((current) => current.includes(collectionId) ? current.filter((id) => id !== collectionId) : [...current, collectionId]);
  }

  async function createCollection() {
    const collectionName = customCollectionName.trim();
    if (!collectionName) return;
    const existing = collections.find((collection) => collection.name.toLowerCase() === collectionName.toLowerCase());
    if (existing) {
      setSelectedCollectionIds((current) => current.includes(existing.id) ? current : [...current, existing.id]);
      setCustomCollectionName("");
      setNotice(`${existing.name} is now selected.`);
      return;
    }
    setCreatingCollection(true);
    setNotice("");
    try {
      const baseId = slugify(collectionName) || `collection-${Date.now()}`;
      const id = collections.some((collection) => collection.id === baseId) ? `${baseId}-${String(Date.now()).slice(-4)}` : baseId;
      const value: Collection = {
        id,
        name: collectionName,
        slug: id,
        description: `${collectionName} collection.`,
        coverImage: primaryImage?.src || placeholder,
        productIds: initial ? [productId] : [],
        homepage: false,
        homepageOrder: Math.max(-1, ...collections.map((collection) => collection.homepageOrder)) + 1,
        megaProductId: undefined,
        revenue30d: 0
      };
      const saved = await requestJson<Collection>("/api/admin/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value })
      });
      setCollections((current) => [...current, saved].sort((a, b) => a.name.localeCompare(b.name)));
      setSelectedCollectionIds((current) => current.includes(saved.id) ? current : [...current, saved.id]);
      setCustomCollectionName("");
      setNotice(`${saved.name} was created and selected.`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "The collection could not be created.");
    } finally {
      setCreatingCollection(false);
    }
  }

  function handleCustomCollectionKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter") return;
    event.preventDefault();
    void createCollection();
  }

  async function save(status: "draft" | "active", event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    if (!valid) {
      setNotice("Add a name, slug, price, primary image, metal and at least one collection before saving.");
      return;
    }
    setSaving(true);
    setNotice("Saving product and collection membership…");
    try {
      let foundPrimary = false;
      const normalizedImages = images.filter((image) => image.src.trim()).map((image) => {
        const isPrimary = image.isPrimary && !foundPrimary;
        if (isPrimary) foundPrimary = true;
        return { src: image.src.trim(), alt: image.alt.trim() || `GEMOIREJEWELSLLP ${name}`, isPrimary };
      });
      if (!foundPrimary && normalizedImages[0]) normalizedImages[0].isPrimary = true;
      const normalizedOgImage = ogImage.trim() || normalizedImages.find((image) => image.isPrimary)?.src || placeholder;
      const value: AdminProduct = {
        id: productId,
        slug: slug || slugify(name),
        name: name.trim(),
        collectionIds: selectedCollectionIds,
        metal,
        shape,
        setting,
        carat,
        clarity,
        color: color.trim(),
        priceAud: Number(priceAud),
        priceUsd: Number(priceUsd),
        cost: Number(cost) || 0,
        sku: initial?.sku ?? `GM-${primaryCollection.slice(0, 3).toUpperCase()}-${String(Date.now()).slice(-3)}`,
        stock: Number(stock) || 0,
        igeCertNo: igeCertNo.trim(),
        images: normalizedImages,
        hoverImage: hoverImage.trim() || undefined,
        badges,
        description,
        details,
        seoTitle: metaTitle.trim() || name.trim(),
        seoDescription: metaDescription,
        ogImage: normalizedOgImage,
        jsonLdEnabled: jsonLd,
        readyToShip,
        featured,
        status,
        createdAt: initial?.createdAt ?? new Date().toISOString(),
        rating: initial?.rating ?? 0,
        reviewCount: initial?.reviewCount ?? 0
      };
      await requestJson<AdminProduct>("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value })
      });

      const membershipUpdates = collections.flatMap((collection) => {
        const selected = selectedCollectionIds.includes(collection.id);
        const included = collection.productIds.includes(productId);
        if (selected === included) return [];
        const productIds = selected ? [...collection.productIds, productId] : collection.productIds.filter((id) => id !== productId);
        return [requestJson<Collection>("/api/admin/collections", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ value: { ...collection, productIds } })
        })];
      });
      await Promise.all(membershipUpdates);

      const seoValue: SeoPage = {
        id: `seo-${value.id}`,
        pageType: "product",
        slug: `/products/${value.slug}`,
        title: value.seoTitle || value.name,
        description: value.seoDescription || "",
        canonical: siteUrl(`/products/${value.slug}`),
        ogImage: value.ogImage || normalizedOgImage,
        jsonLdType: value.jsonLdEnabled === false ? "WebSite" : "Product",
        status: status === "active" ? "published" : "draft"
      };
      await requestJson<SeoPage>("/api/admin/seoPages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: seoValue })
      });
      setNotice(status === "active" ? "Published — storefront data is updated." : "Draft saved.");
      window.setTimeout(() => router.push("/admin/products"), 650);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Product could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  return <section className="mx-auto w-full max-w-[1440px] p-5 text-[#232323] md:p-7">
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-[#737373]">Catalog</p>
        <h1 className="mt-1 font-serif text-3xl text-[#253e2b]">{initial ? `Edit ${initial.name}` : "New product"}</h1>
        <p className="mt-1 text-sm text-[#737373]">Product, collection and SEO changes write to the shared repository.</p>
      </div>
      <button type="button" onClick={() => router.push("/admin/products")} className="text-sm text-[#236339] underline">All products</button>
    </div>

    <form onSubmit={(event) => void save("active", event)} className="grid gap-6 xl:grid-cols-[minmax(290px,.78fr)_minmax(0,1.22fr)]">
      <aside className="h-fit rounded-md border border-[#e3e0dc] bg-[#faf6ef] p-5 xl:sticky xl:top-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-serif text-2xl text-[#253e2b]">Live storefront preview</h2>
          <div className="rounded-full border border-[#d4d0cc] bg-white p-0.5" aria-label="Preview mode">
            <button type="button" aria-pressed={view === "card"} onClick={() => setView("card")} className={`rounded-full px-3 py-1 text-[11px] ${view === "card" ? "bg-[#236339] text-white" : ""}`}>Card</button>
            <button type="button" aria-pressed={view === "detail"} onClick={() => setView("detail")} className={`rounded-full px-3 py-1 text-[11px] ${view === "detail" ? "bg-[#236339] text-white" : ""}`}>Detail</button>
          </div>
        </div>
        {view === "card" ? <ProductCard product={preview} /> : <div className="overflow-hidden rounded-md bg-white">
          <img src={preview.image} alt={preview.imageAlt} className="aspect-square w-full object-cover" />
          <div className="p-4">
            <p className="text-[10px] uppercase tracking-[.12em] text-[#c9a962]">The {preview.collection} Collection</p>
            <h3 className="mt-1 text-xl">{preview.name}</h3>
            <p className="mt-2 font-serif text-2xl">AUD ${preview.audPrice.toLocaleString()}</p>
            <p className="mt-2 text-sm text-[#737373]">{preview.description}</p>
          </div>
        </div>}
      </aside>

      <div className="space-y-5">
        <section className="rounded-md border border-[#e3e0dc] bg-white p-5">
          <h2 className="font-serif text-2xl text-[#253e2b]">Product details</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="text-xs font-medium">Product name *<input value={name} onChange={(event) => handleNameChange(event.target.value)} className={fieldClass} /></label>
            <label className="text-xs font-medium">Slug *<input value={slug} onChange={(event) => handleSlugChange(event.target.value)} className={fieldClass} /></label>
            <label className="text-xs font-medium">SKU<input value={initial?.sku ?? `GM-${primaryCollection.slice(0, 3).toUpperCase()}-AUTO`} readOnly className={`${fieldClass} bg-[#faf6ef]`} /></label>
            <label className="text-xs font-medium">Stock<input type="number" min="0" value={stock} onChange={(event) => setStock(event.target.value)} className={fieldClass} /></label>
            <label className="text-xs font-medium">Price AUD *<input type="number" min="0" step="0.01" value={priceAud} onChange={(event) => { setPriceAud(event.target.value); setPriceUsd(String(Math.round(Number(event.target.value || 0) * .65))); }} className={fieldClass} /></label>
            <label className="text-xs font-medium">Price USD<input type="number" min="0" step="0.01" value={priceUsd} onChange={(event) => setPriceUsd(event.target.value)} className={fieldClass} /></label>
            <label className="text-xs font-medium">Cost<input type="number" min="0" step="0.01" value={cost} onChange={(event) => setCost(event.target.value)} className={fieldClass} /></label>
            <label className="text-xs font-medium">Diamond colour<input value={color} onChange={(event) => setColor(event.target.value)} placeholder="E" className={fieldClass} /></label>
            <label className="text-xs font-medium">IGI certificate number<input value={igeCertNo} onChange={(event) => setIgeCertNo(event.target.value)} className={fieldClass} /></label>
            <label className="text-xs font-medium">Shape<input value={shape} onChange={(event) => setShape(event.target.value)} className={fieldClass} /></label>
            <label className="text-xs font-medium">Setting style<input value={setting} onChange={(event) => setSetting(event.target.value)} className={fieldClass} /></label>
            <label className="text-xs font-medium">Carat<input value={carat} onChange={(event) => setCarat(event.target.value)} className={fieldClass} /></label>
            <label className="text-xs font-medium">Clarity<input value={clarity} onChange={(event) => setClarity(event.target.value)} className={fieldClass} /></label>
          </div>
          <fieldset className="mt-4">
            <legend className="text-xs font-medium">Metal swatches *</legend>
            <div className="mt-2 flex flex-wrap gap-2">{["Platinum", "18ct Yellow Gold", "18ct Rose Gold", "18ct White Gold"].map((value) => <button type="button" key={value} aria-pressed={metal.includes(value)} onClick={() => toggle(metal, value, setMetal)} className={`rounded-full border px-3 py-2 text-xs ${metal.includes(value) ? "border-[#236339] bg-[#eef5ef] text-[#236339]" : "border-[#d4d0cc]"}`}>{value}</button>)}</div>
          </fieldset>
        </section>

        <section className="rounded-md border border-[#e3e0dc] bg-white p-5">
          <h2 className="font-serif text-2xl text-[#253e2b]">Collections</h2>
          <p className="mt-1 text-xs text-[#737373]">Choose every collection this product belongs to. Membership is saved on both records.</p>
          {collectionsLoading ? <div className="mt-4 h-16 animate-pulse rounded-md bg-[#f1eee9]" /> : <fieldset className="mt-4">
            <legend className="sr-only">Product collections</legend>
            <div className="grid gap-2 sm:grid-cols-2">{collections.map((collection) => <label key={collection.id} className={`flex cursor-pointer items-center gap-3 rounded-md border px-3 py-3 text-sm ${selectedCollectionIds.includes(collection.id) ? "border-[#236339] bg-[#eef5ef]" : "border-[#d4d0cc]"}`}>
              <input type="checkbox" checked={selectedCollectionIds.includes(collection.id)} onChange={() => toggleCollection(collection.id)} />
              <span><strong className="block text-[#253e2b]">{collection.name}</strong><span className="text-[11px] text-[#737373]">{collection.productIds.length} products</span></span>
            </label>)}</div>
          </fieldset>}
          <div className="mt-4 rounded-md bg-[#faf6ef] p-3">
            <label htmlFor="custom-collection" className="text-xs font-medium">Create a custom collection</label>
            <div className="mt-1 flex flex-col gap-2 sm:flex-row">
              <input id="custom-collection" value={customCollectionName} onChange={(event) => setCustomCollectionName(event.target.value)} onKeyDown={handleCustomCollectionKeyDown} placeholder="Collection name" className="min-w-0 flex-1 rounded-md border border-[#d4d0cc] bg-white px-3 py-2 text-sm outline-none focus:border-[#236339]" />
              <button type="button" onClick={() => void createCollection()} disabled={!customCollectionName.trim() || creatingCollection} className={secondaryButtonClass}>{creatingCollection ? "Creating…" : "Create & select"}</button>
            </div>
          </div>
        </section>

        <section className="rounded-md border border-[#e3e0dc] bg-white p-5">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div><h2 className="font-serif text-2xl text-[#253e2b]">Images & badges</h2><p className="mt-1 text-xs text-[#737373]">Add up to 8 square image URLs and choose one primary image.</p></div>
            <button type="button" onClick={() => setImages((current) => [...current, { src: "", alt: "", isPrimary: false }])} disabled={images.length >= 8} className={secondaryButtonClass}>Add image ({images.length}/8)</button>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">{images.map((image, index) => <div key={index} className="rounded-md border border-[#e3e0dc] p-3">
            <div className="grid grid-cols-[80px_minmax(0,1fr)] gap-3">
              {image.src ? <img src={image.src} alt={image.alt || `Product image ${index + 1}`} className="aspect-square w-20 rounded-md object-cover" /> : <div className="flex aspect-square w-20 items-center justify-center rounded-md bg-[#f1eee9] text-[10px] text-[#737373]">No image</div>}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-medium"><input type="radio" name="primary-product-image" checked={image.isPrimary} onChange={() => choosePrimaryImage(index)} /> Primary image</label>
                <label className="flex items-center gap-2 text-xs font-medium"><input type="radio" name="hover-product-image" checked={Boolean(image.src) && hoverImage === image.src} disabled={!image.src} onChange={() => setHoverImage(image.src)} /> Hover image</label>
                <button type="button" onClick={() => removeImage(index)} disabled={images.length === 1} className="text-xs text-red-700 underline disabled:opacity-35">Remove slot</button>
              </div>
            </div>
            <label className="mt-3 block text-xs font-medium">Image {index + 1} URL<input value={image.src} onChange={(event) => updateImage(index, { src: event.target.value })} className={fieldClass} /></label>
            <label className="mt-2 block text-xs font-medium">Upload local preview<input type="file" accept="image/*" onChange={(event) => uploadLocalImage(event, index)} className="mt-1 block w-full text-[11px] text-[#737373] file:mr-3 file:rounded-full file:border file:border-[#d4d0cc] file:bg-white file:px-3 file:py-2 file:text-xs file:text-[#253e2b]" /></label>
            <label className="mt-2 block text-xs font-medium">Alt text<input value={image.alt} onChange={(event) => updateImage(index, { alt: event.target.value })} className={fieldClass} /></label>
          </div>)}</div>
          <div className="mt-4 flex items-end gap-2"><label className="min-w-0 flex-1 text-xs font-medium">Hover image URL<input value={hoverImage} onChange={(event) => setHoverImage(event.target.value)} placeholder="Choose a slot above or enter a separate URL" className={fieldClass} /></label>{hoverImage ? <button type="button" onClick={() => setHoverImage("")} className={`${secondaryButtonClass} mb-0.5 shrink-0`}>Clear hover</button> : null}</div>
          <p className="mt-2 text-[11px] text-[#737373]">Local files are stored as demo data URLs (2 MB maximum). Product cards use the chosen hover image; PDPs show every populated slot.</p>
          <div className="mt-4 flex flex-wrap gap-2">{["New", "Bestseller", "Sale"].map((value) => <button type="button" key={value} aria-pressed={badges.includes(value)} onClick={() => toggle(badges, value, setBadges)} className={`rounded-full border px-3 py-2 text-xs ${badges.includes(value) ? "border-[#c9a962] bg-[#f8f1df]" : "border-[#d4d0cc]"}`}>{badges.includes(value) ? "✓ " : ""}{value}</button>)}</div>
          <div className="mt-4 grid gap-2">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={readyToShip} onChange={(event) => setReadyToShip(event.target.checked)} /> Ready-to-ship</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={featured} onChange={(event) => setFeatured(event.target.checked)} /> Featured in mega menu</label>
          </div>
        </section>

        <section className="rounded-md border border-[#e3e0dc] bg-white p-5">
          <h2 className="font-serif text-2xl text-[#253e2b]">Description & details</h2>
          <div className="mt-4 grid gap-5">
            <RichTextField id="product-description" label="Product description" value={description} onChange={setDescription} rows={6} />
            <RichTextField id="product-details" label="Product details, care and provenance" value={details} onChange={setDetails} rows={5} />
          </div>
        </section>

        <section className="rounded-md border border-[#e3e0dc] bg-white p-5">
          <h2 className="font-serif text-2xl text-[#253e2b]">Search & social</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="text-xs font-medium">Meta title <span className={metaTitle.length <= 60 ? "text-[#236339]" : "text-red-600"}>{metaTitle.length}/60</span><input value={metaTitle} onChange={(event) => setMetaTitle(event.target.value)} className={fieldClass} /></label>
            <label className="text-xs font-medium">Meta description <span className={metaDescription.length <= 160 ? "text-[#236339]" : "text-red-600"}>{metaDescription.length}/160</span><textarea value={metaDescription} onChange={(event) => setMetaDescription(event.target.value)} className={`${fieldClass} min-h-20`} /></label>
          </div>
          <label className="mt-4 block text-xs font-medium">Open Graph image URL<input value={ogImage} onChange={(event) => setOgImage(event.target.value)} placeholder="Defaults to the primary product image" className={fieldClass} /></label>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-md border border-[#e3e0dc] p-4"><p className="text-xs text-[#737373]">GEMOIREJEWELSLLP</p><strong className="block text-[#236339]">{metaTitle || "Product title"}</strong><p className="mt-1 text-xs text-[#737373]">{metaDescription || "A considered product description will appear here."}</p></div>
            <div className="relative min-h-32 overflow-hidden rounded-md bg-[#253e2b] p-4 text-white"><img src={ogImage || preview.image} alt="Open Graph preview" className="absolute inset-0 h-full w-full object-cover opacity-25" /><div className="relative"><small>Social preview</small><strong className="mt-4 block">{metaTitle || "Product title"}</strong><p className="mt-1 text-xs">{metaDescription}</p></div></div>
          </div>
          <label className="mt-4 flex items-center gap-2 text-sm"><input type="checkbox" checked={jsonLd} onChange={(event) => setJsonLd(event.target.checked)} /> Render Product + Review JSON-LD on PDP</label>
        </section>
      </div>

      <footer className="sticky bottom-3 z-10 flex flex-wrap items-center justify-between gap-3 rounded-md border border-[#d4d0cc] bg-white/95 p-3 shadow-lg backdrop-blur">
        <span role="status" aria-live="polite" className="text-xs text-[#737373]">{notice || (valid ? "Ready to save" : "Required: name, slug, price, image, metal and collection")}</span>
        <div className="flex gap-2">
          <button type="button" onClick={() => void save("draft")} disabled={saving || !valid} className={secondaryButtonClass}>Save draft</button>
          <button type="submit" disabled={!valid || saving} title={!valid ? "Complete all required product fields first" : undefined} className="rounded-full bg-[#236339] px-4 py-2 text-xs text-white disabled:cursor-not-allowed disabled:opacity-35">{saving ? "Saving…" : "Publish"}</button>
        </div>
      </footer>
    </form>
  </section>;
}
