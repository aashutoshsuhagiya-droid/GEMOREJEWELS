import type { Metal, Product } from "@/data/products";

export type ShowcaseShapeItem = {
  id: string;
  name: string;
  canonicalShape: DiamondShape;
  looseImage: string;
  ringImage: string;
};

export const showcaseShapes: ShowcaseShapeItem[] = [
  { id: "oval", name: "Oval", canonicalShape: "Oval", looseImage: "/images/diamonds/oval.png", ringImage: "/images/shapes/oval.png" },
  { id: "round", name: "Round", canonicalShape: "Round", looseImage: "/images/diamonds/round.png", ringImage: "/images/shapes/round.png" },
  { id: "emerald", name: "Emerald", canonicalShape: "Emerald", looseImage: "/images/diamonds/emerald.png", ringImage: "/images/shapes/emerald.png" },
  { id: "marquise", name: "Marquise", canonicalShape: "Marquise", looseImage: "/images/diamonds/marquise.png", ringImage: "/images/shapes/marquise.png" },
  { id: "radiant", name: "Radiant", canonicalShape: "Radiant", looseImage: "/images/diamonds/radiant.png", ringImage: "/images/shapes/radiant.png" },
  { id: "pear", name: "Pear", canonicalShape: "Pear", looseImage: "/images/diamonds/pear.png", ringImage: "/images/shapes/pear.png" },
  { id: "elongated-cushion", name: "Elongated Cushion", canonicalShape: "Cushion", looseImage: "/images/diamonds/elongated-cushion.png", ringImage: "/images/shapes/elongated-cushion.png" },
  { id: "cushion", name: "Cushion", canonicalShape: "Cushion", looseImage: "/images/diamonds/cushion.png", ringImage: "/images/shapes/cushion.png" },
  { id: "princess", name: "Princess", canonicalShape: "Princess", looseImage: "/images/diamonds/princess.png", ringImage: "/images/shapes/princess.png" },
  { id: "asscher", name: "Asscher", canonicalShape: "Asscher", looseImage: "/images/diamonds/asscher.png", ringImage: "/images/shapes/asscher.png" },
];

export const metalOptions: ReadonlyArray<{ name: Metal; swatch: string }> = [
  { name: "18ct Yellow Gold", swatch: "swatch-yellow" },
  { name: "18ct Rose Gold", swatch: "swatch-rose" },
  { name: "18ct White Gold", swatch: "swatch-white" },
  { name: "Platinum", swatch: "swatch-platinum" },
];

export const diamondShapes = ["Round", "Oval", "Emerald", "Pear", "Cushion", "Marquise", "Radiant", "Princess", "Asscher"] as const;
export type DiamondShape = typeof diamondShapes[number];

// Clean white-background loose diamond per cut (Brilliant Earth CDN) — used in the grid thumbnails.
const beDiamond = (id: string) =>
  `https://cdn.builder.io/api/v1/image/assets%2F9f2a69003c86470ea05deb9ecb9887be%2F${id}`;

export const diamondImages = {
  Round: beDiamond("5eceb83907d944e1a068eafcd691c786"),
  Oval: beDiamond("365788d569694912b79555fcca7b6be8"),
  Emerald: beDiamond("ed7545b61198429891fe8314737ed03d"),
  Pear: beDiamond("157c3412b22442ad8575444b14dd1283"),
  Cushion: beDiamond("16c9dbe62f5a4ba4b4505f604d4af806"),
  Marquise: beDiamond("300ff174910348fa8bb9d14c7281a459"),
  Radiant: beDiamond("ef2b0d623b10430ab58a87b17106aa33"),
  Princess: beDiamond("21423abdc53b4eeb877329a4b99d3cd4"),
  Asscher: beDiamond("03408d331fd448509c64ef71e0bd23b2"),
} satisfies Record<DiamondShape, string>;

// Per-shape engagement ring photos, stored locally so they always load — used in the large left panel.
const shapeRing = (shape: string) => `/images/shapes/${shape}.png`;

export const ringImages = {
  Round: shapeRing("round"),
  Oval: shapeRing("oval"),
  Emerald: shapeRing("emerald"),
  Pear: shapeRing("pear"),
  Cushion: shapeRing("cushion"),
  Marquise: shapeRing("marquise"),
  Radiant: shapeRing("radiant"),
  Princess: shapeRing("princess"),
  Asscher: shapeRing("asscher"),
} satisfies Record<DiamondShape, string>;

export function parseMetal(value: string | string[] | undefined): Metal | undefined {
  const candidate = Array.isArray(value) ? value[0] : value;
  return metalOptions.find(option => option.name === candidate)?.name;
}

export function parseShape(value: string | string[] | undefined): DiamondShape | undefined {
  const candidate = Array.isArray(value) ? value[0] : value;
  if (!candidate) return undefined;
  if (candidate.toLowerCase() === "elongated cushion" || candidate.toLowerCase() === "elongated-cushion") {
    return "Cushion";
  }
  return diamondShapes.find(shape => shape.toLowerCase() === candidate.toLowerCase());
}

// USD is canonical; adjustments preserve the approximate value of the former AUD configurator increments.
export function productPrice(product: Pick<Product, "usdPrice">, metal: Metal, carat: string): number {
  return product.usdPrice + (metal === "Platinum" ? 182 : metal === "18ct Rose Gold" ? 59 : 0) + (carat === "2.00ct" ? 813 : 0);
}

export function productHref(slug: string, metal: Metal): string {
  return `/products/${encodeURIComponent(slug)}?${new URLSearchParams({ metal })}`;
}
