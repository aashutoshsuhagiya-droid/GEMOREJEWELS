import type { Metal, Product } from "@/data/products";

export const metalOptions: ReadonlyArray<{ name: Metal; swatch: string }> = [
  { name: "18ct Yellow Gold", swatch: "swatch-yellow" },
  { name: "18ct Rose Gold", swatch: "swatch-rose" },
  { name: "18ct White Gold", swatch: "swatch-white" },
  { name: "Platinum", swatch: "swatch-platinum" },
];

export const diamondShapes = ["Round", "Oval", "Emerald", "Pear", "Cushion", "Marquise", "Radiant", "Princess", "Asscher"] as const;
export type DiamondShape = typeof diamondShapes[number];

export function parseMetal(value: string | string[] | undefined): Metal | undefined {
  const candidate = Array.isArray(value) ? value[0] : value;
  return metalOptions.find(option => option.name === candidate)?.name;
}

export function parseShape(value: string | string[] | undefined): DiamondShape | undefined {
  const candidate = Array.isArray(value) ? value[0] : value;
  return diamondShapes.find(shape => shape.toLowerCase() === candidate?.toLowerCase());
}

// Use the existing configurator adjustments on both cards and product pages.
export function productPrice(product: Pick<Product, "audPrice">, metal: Metal, carat: string): number {
  return product.audPrice + (metal === "Platinum" ? 280 : metal === "18ct Rose Gold" ? 90 : 0) + (carat === "2.00ct" ? 1250 : 0);
}

export function productHref(slug: string, metal: Metal): string {
  return `/products/${encodeURIComponent(slug)}?${new URLSearchParams({ metal })}`;
}
