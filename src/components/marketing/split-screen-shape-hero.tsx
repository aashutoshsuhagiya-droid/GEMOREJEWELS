"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShapeIcon } from "@/components/commerce/shape-selector";
import { ringImages, type ShapeWithArtwork } from "@/lib/product-options";

const SHAPES: ShapeWithArtwork[] = [
  "Round", "Oval", "Emerald",
  "Pear", "Cushion", "Marquise",
  "Radiant", "Princess", "Asscher",
];

const DEFAULT_SHAPE: ShapeWithArtwork = "Pear";

/* Eight of the ring photos are cut-outs on pure white. oval.png is a photo on #F9F9F9,
   letterboxed inside its white canvas, so it gets a class that lifts its white point
   (see .ssh-ring--lift). Empty this list once that file is replaced with a cut-out. */
const OFF_WHITE_PHOTOS: readonly ShapeWithArtwork[] = ["Oval"];

const previewLabel = (shape: ShapeWithArtwork) =>
  `${shape.toUpperCase()} CUT · ${shape === "Round" ? "THE CLASSIC BRILLIANT" : "ON YOUR RING"}`;

/* Hovering or focusing a shape previews its ring; the link itself goes to the filtered
   collection. The last previewed shape stays selected when the pointer leaves. */
export function SplitScreenShapeHero() {
  const [active, setActive] = useState<ShapeWithArtwork>(DEFAULT_SHAPE);

  return (
    <section className="ssh-section" aria-labelledby="ssh-h">
      <div className="ssh-shell">
        <div className="ssh-layout">

          {/* ── LEFT: ring preview ── */}
          <div className="ssh-showcase">
            <p className="ssh-eyebrow">FIND YOUR SILHOUETTE</p>
            <h2 id="ssh-h" className="ssh-heading">Shop by diamond shape</h2>
            <p className="ssh-subtitle">Discover the shape that feels like you.</p>

            {/* All nine photos stay mounted and stacked; CSS shows the active one by opacity,
                so each is fetched before its first hover and nothing mounts on hover. */}
            <div className="ssh-frame">
              {SHAPES.map((s) => (
                <Image
                  key={s}
                  src={ringImages[s]}
                  alt=""
                  fill
                  sizes="(max-width: 767px) 220px, 260px"
                  loading={s === DEFAULT_SHAPE ? "eager" : "lazy"}
                  className={`ssh-ring${s === active ? " ssh-ring--active" : ""}${OFF_WHITE_PHOTOS.includes(s) ? " ssh-ring--lift" : ""}`}
                />
              ))}
            </div>

            <p className="ssh-shape-label">{previewLabel(active)}</p>
          </div>

          {/* ── RIGHT: shape links ── */}
          <div className="ssh-picker">
            <ul className="ssh-grid">
              {SHAPES.map((s) => (
                <li key={s} className="ssh-grid-item">
                  <Link
                    href={`/collections/engagement?shape=${encodeURIComponent(s)}`}
                    className={`ssh-tile${s === active ? " ssh-tile--active" : ""}`}
                    onMouseEnter={() => setActive(s)}
                    onFocus={() => setActive(s)}
                  >
                    <span className="ssh-circle"><ShapeIcon shape={s} /></span>
                    <span className="ssh-shape-name">{s}</span>
                  </Link>
                </li>
              ))}
            </ul>

            <Link href="/collections/engagement" className="ssh-cta">
              Explore all shapes
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M2.5 7h9M7.5 3.5l3 3-3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}
