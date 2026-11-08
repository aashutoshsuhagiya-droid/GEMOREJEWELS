"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Metal, Product, StorefrontProductImage } from "@/data/products";
import { formatAud, formatUsd } from "@/data/products";
import { sanitizeLimitedRichText } from "@/lib/safe-rich-text";
import { useDialogFocus } from "@/components/admin/use-dialog-focus";
import { useCart } from "./cart-store";
import { CraftTracker } from "./craft-tracker";
import { MetalSwatches } from "./metal-swatches";
import { productPrice } from "@/lib/product-options";

const needsUnoptimizedImage = (src: string) => src.startsWith("data:") || src.startsWith("blob:") || !src.startsWith("https://images.unsplash.com/");

function RichProductCopy({ value }: { value: string }) {
  if (!value.trim()) return null;
  return <div className="product-rich-copy" dangerouslySetInnerHTML={{ __html: sanitizeLimitedRichText(value) }}/>
}

export function ProductDetail({ product, initialMetal }: { product: Product; initialMetal?: Metal }) {
  const { addItem } = useCart();
  const [metal, setMetal] = useState<Metal>(initialMetal ?? product.metal);
  const [carat, setCarat] = useState(product.carat);
  const [setting, setSetting] = useState(product.setting);
  const [image, setImage] = useState(0);
  const [saved, setSaved] = useState(false);
  const [arOpen, setArOpen] = useState(false);
  const arPanelRef = useRef<HTMLDivElement>(null);
  const [postcode, setPostcode] = useState("");
  const [ar, setAr] = useState({ enabled: true, note: "AR try-on is coming to the GEMOIREJEWELSLLP app." });

  useDialogFocus(arPanelRef, () => setArOpen(false), arOpen);

  useEffect(() => { fetch("/api/storefront/settings").then(response => response.ok ? response.json() : null).then(data => { if (data) setAr({ enabled: Boolean(data.arEnabled), note: String(data.arNote || "AR try-on is coming to the GEMOIREJEWELSLLP app.") }); }).catch(() => undefined); }, []);

  const gallery = useMemo(() => {
    const source = (product.images ?? []).filter((item) => item.src.trim());
    const fallback: StorefrontProductImage = { src: product.image, alt: product.imageAlt, isPrimary: true };
    const primary = source.find((item) => item.isPrimary) ?? source[0] ?? fallback;
    const ordered = [primary, ...source.filter((item) => item !== primary)];
    if (product.hoverImage && !ordered.some((item) => item.src === product.hoverImage)) ordered.push({ src: product.hoverImage, alt: `Alternate view of ${product.name}` });
    return ordered.slice(0, 8);
  }, [product.hoverImage, product.image, product.imageAlt, product.images, product.name]);

  const activeImage = gallery[image] ?? gallery[0];
  const adjusted = productPrice(product, metal, carat);

  return <>
    <main className="shell pdp-grid">
      <section className="pdp-gallery" aria-label={`${product.name} image gallery`}>
        <div className="pdp-primary">
          <Image src={activeImage.src} alt={activeImage.alt || product.imageAlt} width={900} height={900} priority unoptimized={needsUnoptimizedImage(activeImage.src)}/>
          {activeImage.src.includes("images.unsplash.com") ? <span className="placeholder-note">Placeholder asset</span> : null}
        </div>
        {gallery.length > 1 ? <div className="thumbs" aria-label="Choose product image">{gallery.map((item, index) => <button type="button" className={image === index ? "active" : ""} onClick={() => setImage(index)} key={`${item.src}-${index}`} aria-label={`View product image ${index + 1}`} aria-pressed={image === index}><Image src={item.src} alt="" width={130} height={130} unoptimized={needsUnoptimizedImage(item.src)}/></button>)}</div> : null}
      </section>
      <section className="pdp-info">
        <p className="eyebrow">The {product.collection} Collection</p>
        <h1>{product.name}</h1>
        <div className="pdp-price shimmer">from {formatAud(adjusted)}<span>{formatUsd(Math.round(adjusted * .65))}</span></div>
        <p className="pdp-rating"><span className="stars">★★★★★</span> {product.rating} out of 5 · <a href="#reviews">{product.reviewCount} reviews</a></p>
        <div className="spec-quick"><span>Metal<strong>{metal.replace("18ct ", "")}</strong></span><span>Carat<strong>{carat}</strong></span><span>Clarity<strong>{product.clarity}</strong></span><span>Colour<strong>{product.color || "E"}</strong></span><span>Shape<strong>{product.shape}</strong></span></div>
        <div className="variant-block"><span>Metal — <span aria-live="polite">{metal}</span></span><MetalSwatches value={metal} onChange={setMetal} label="Choose precious metal"/></div>
        <div className="variant-block"><span>Diamond</span><div className="variant-choices">{[...new Set([product.carat, "1.50ct", "2.00ct"])].map(option => <button type="button" className={`variant-choice ${carat === option ? "active" : ""}`} onClick={() => setCarat(option)} key={option}>{option} · {option === "2.00ct" ? "VVS1" : product.clarity}</button>)}</div></div>
        <div className="variant-block"><span>Setting</span><div className="variant-choices">{[product.setting, "Solitaire", "Bezel"].filter((item, index, all) => all.indexOf(item) === index).map(option => <button type="button" className={`variant-choice ${setting === option ? "active" : ""}`} onClick={() => setSetting(option)} key={option}>{option}</button>)}</div></div>
        <div className="pdp-buttons"><button type="button" className="button" onClick={() => addItem({ ...product, audPrice: adjusted, usdPrice: Math.round(adjusted * .65), metal, carat, setting })}>Add to cart</button><button type="button" className={`heart-large ${saved ? "saved" : ""}`} aria-label={saved ? `Remove ${product.name} from saved items` : `Save ${product.name} for later`} aria-pressed={saved} onClick={() => setSaved((value) => !value)}>{saved ? "♥" : "♡"}</button></div>
        <button type="button" className="ar-button" disabled={!ar.enabled} onClick={() => setArOpen(true)} aria-haspopup="dialog" aria-expanded={arOpen} aria-controls="pdp-ar-dialog">⌁ &nbsp; View on your hand <span style={{ float: "right" }}>{ar.enabled ? "AR try-on" : "Coming soon"}</span></button>
        <div className="delivery-estimator"><strong>Delivery estimator</strong><input className="postcode" value={postcode} onChange={event => setPostcode(event.target.value)} placeholder="Enter postcode"/><p>{postcode ? "Express: arrives Jan 12 · Standard: Jan 25" : "Enter a postcode for estimated delivery"}</p></div>
        <div className="detail-accordions">
          <details open><summary>The Details</summary><RichProductCopy value={product.description}/><div className="details-table"><span>Setting</span><b>{setting}</b><span>Diamond</span><b>{carat} {product.shape}</b><span>Clarity / colour</span><b>{product.clarity} / {product.color || "E"}</b><span>Metal</span><b>{metal}</b></div></details>
          {product.details?.trim() ? <details><summary>Care & provenance</summary><RichProductCopy value={product.details}/></details> : null}
          <details><summary>Certification</summary><p>IGI certificate no. {product.igeCertNo || "pending"} is included with your order. Download becomes available after purchase.</p></details>
          <details><summary>Shipping & Returns</summary><p>Insured delivery is complimentary. You have ten days from arrival to begin a return on unworn ready-to-ship pieces.</p></details>
          <details><summary>Our promise</summary><p>Your ring includes our lifetime manufacturing warranty and ongoing care from our client team.</p></details>
        </div>
        <CraftTracker current={1}/>
      </section>
    </main>
    {arOpen && <div className="modal-backdrop" role="presentation" onMouseDown={() => setArOpen(false)}><div ref={arPanelRef} id="pdp-ar-dialog" className="modal" role="dialog" aria-modal="true" aria-labelledby="pdp-ar-title" aria-describedby="pdp-ar-description" onMouseDown={event => event.stopPropagation()}><h2 id="pdp-ar-title">Try it on, soon</h2><p id="pdp-ar-description">{ar.note} Until then, upload a hand photo and our specialists will prepare a considered scale preview.</p><input data-autofocus type="file" accept="image/*" aria-label="Upload a hand photo"/><button type="button" className="button" style={{ marginTop: 16 }} onClick={() => setArOpen(false)}>Continue</button></div></div>}
  </>;
}
