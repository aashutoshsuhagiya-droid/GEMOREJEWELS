"use client";

import type { Metal } from "@/data/products";
import { metalOptions } from "@/lib/product-options";

export function MetalSwatches({ value, onChange, label }: { value: Metal; onChange: (metal: Metal) => void; label: string }) {
  return <div className="metal-swatches" role="group" aria-label={label}>
    {metalOptions.map(option => <button
      type="button"
      key={option.name}
      className={`metal-swatch ${option.swatch}${value === option.name ? " active" : ""}`}
      title={option.name}
      aria-label={option.name}
      aria-pressed={value === option.name}
      onClick={() => onChange(option.name)}
    />)}
  </div>;
}
