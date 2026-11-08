"use client";

import Link from "next/link";
import { diamondShapes, type DiamondShape } from "@/lib/product-options";

function ShapeIcon({ shape }: { shape: DiamondShape }) {
  const outlines: Partial<Record<DiamondShape, string>> = {
    Emerald: "M11 3h10l5 5v16l-5 5H11l-5-5V8Z M12 7h8l2 3v12l-2 3h-8l-2-3V10Z M6 8l4 2m16-2-4 2M6 24l4-2m16 2-4-2",
    Pear: "M16 3C13 9 5 15 5 21a11 9 0 0 0 22 0C27 15 19 9 16 3Z M16 8 10 21l6 5 6-5Z",
    Cushion: "M9 4Q4 4 4 9v14q0 5 5 5h14q5 0 5-5V9q0-5-5-5Z M11 9h10l3 7-3 7H11l-3-7Z",
    Marquise: "M16 2C2 12 2 20 16 30 30 20 30 12 16 2Z M16 7l-6 9 6 9 6-9Z",
    Radiant: "M10 3h12l5 5v16l-5 5H10l-5-5V8Z M10 3l6 8 6-8M5 8l11 3 11-3M5 24l11-3 11 3M10 29l6-8 6 8M16 11l-7 5 7 5 7-5Z",
    Princess: "M4 4h24v24H4Z M4 4l12 7L28 4l-7 12 7 12-12-7-12 7 7-12Z M16 11l5 5-5 5-5-5Z",
    Asscher: "M11 3h10l8 8v10l-8 8H11l-8-8V11Z M12 8h8l4 4v8l-4 4h-8l-4-4v-8Z M3 11l5 1m13-9-1 5m9 13-5-1M11 29l1-5",
  };
  return <svg viewBox="0 0 32 32" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    {shape === "Round" ? <><circle cx="16" cy="16" r="13"/><path d="m16 3 9 4 4 9-4 9-9 4-9-4-4-9 4-9Z M16 8l8 8-8 8-8-8Z M16 3v5m13 8h-5m-8 13v-5M3 16h5"/></> : shape === "Oval" ? <><ellipse cx="16" cy="16" rx="10" ry="14"/><path d="m16 6 6 10-6 10-6-10Z M16 2v4m10 10h-4m-6 14v-4M6 16h4"/></> : <path d={outlines[shape]}/>}
  </svg>;
}

export function ShapeSelector({ selected, onSelect }: { selected?: DiamondShape; onSelect?: (shape: DiamondShape) => void }) {
  return <div className="shape-grid" role={onSelect ? "group" : "navigation"} aria-label="Shop by diamond shape">
    {diamondShapes.map(shape => onSelect ? <button type="button" className={`shape-card${selected === shape ? " active" : ""}`} aria-pressed={selected === shape} onClick={() => onSelect(shape)} key={shape}><ShapeIcon shape={shape}/><span>{shape}</span></button> : <Link className="shape-card" href={`/collections/engagement?shape=${shape}`} key={shape}><ShapeIcon shape={shape}/><span>{shape}</span></Link>)}
  </div>;
}
