"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { Metal, Product } from "@/data/products";
import { formatAud, formatUsd } from "@/data/products";
import { productHref, productPrice } from "@/lib/product-options";
import { MetalSwatches } from "./metal-swatches";

const needsUnoptimizedImage = (src: string) => src.startsWith("data:") || src.startsWith("blob:") || !src.startsWith("https://images.unsplash.com/");

export function ProductCard({ product }: { product: Product }) {
  const [saved, setSaved] = useState(false);
  const [metal, setMetal] = useState<Metal>(product.metal);
  const price = productPrice(product, metal, product.carat);
  const href = productHref(product.slug, metal);
  const hoverImage = product.hoverImage || product.images?.find((item) => !item.isPrimary)?.src;
  const showHover = Boolean(hoverImage && hoverImage !== product.image);

  return <article className={`product-card ${showHover ? "has-hover" : ""}`}>
    <div className="product-image">
      <Link href={href} aria-label={`View ${product.name} in ${metal}`}>
        <Image className="product-image-primary" src={product.image} alt={product.imageAlt} width={650} height={650} unoptimized={needsUnoptimizedImage(product.image)}/>
        {showHover ? <Image className="product-image-hover" src={hoverImage!} alt="" aria-hidden="true" width={650} height={650} unoptimized={needsUnoptimizedImage(hoverImage!)}/> : null}
      </Link>
      {product.tag && <span className="product-tag">{product.tag}</span>}
      <button type="button" className={`wish-button ${saved ? "saved" : ""}`} aria-label={saved ? `Remove ${product.name} from saved items` : `Save ${product.name}`} aria-pressed={saved} onClick={() => setSaved((value) => !value)}>{saved ? "♥" : "♡"}</button>
    </div>
    <div className="product-info">
      <h3><Link href={href}>{product.name}</Link></h3>
      <p className="product-spec" aria-live="polite">{product.carat} {product.setting}, {metal}</p>
      <div className="price-pair"><span>{formatAud(price)}</span><span>{formatUsd(Math.round(price * .65))}</span></div>
      <MetalSwatches value={metal} onChange={setMetal} label={`Choose metal for ${product.name}`}/>
      <span className="card-rating"><span className="stars" aria-hidden="true">★★★★★</span> <span className="text-cullen-muted">{product.rating} ({product.reviewCount})</span></span>
    </div>
  </article>;
}
