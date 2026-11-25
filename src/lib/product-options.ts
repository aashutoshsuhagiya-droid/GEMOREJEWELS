import type { Metal, Product } from "@/data/products";

export const metalOptions: ReadonlyArray<{ name: Metal; swatch: string }> = [
  { name: "18ct Yellow Gold", swatch: "swatch-yellow" },
  { name: "18ct Rose Gold", swatch: "swatch-rose" },
  { name: "18ct White Gold", swatch: "swatch-white" },
  { name: "Platinum", swatch: "swatch-platinum" },
];

export const diamondShapes = ["Round", "Oval", "Emerald", "Pear", "Cushion", "Marquise", "Radiant", "Princess", "Asscher", "Heart"] as const;
export type DiamondShape = typeof diamondShapes[number];
// Heart is a valid shape filter, but the repo has no heart artwork yet.
export type ShapeWithArtwork = Exclude<DiamondShape, "Heart">;

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
} satisfies Record<ShapeWithArtwork, string>;

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
