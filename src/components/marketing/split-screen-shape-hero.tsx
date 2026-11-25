"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ringImages, type ShapeWithArtwork } from "@/lib/product-options";

/* ─── Inline SVG outline for unselected shapes ─── */
function DiamondOutline({ shape, size = 30 }: { shape: ShapeWithArtwork; size?: number }) {
  const c = "#9A9A9A";
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke={c} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {shape === "Round" && <circle cx="16" cy="16" r="12" />}
      {shape === "Oval" && <ellipse cx="16" cy="16" rx="9" ry="13" />}
      {shape === "Emerald" && <rect x="6" y="6" width="20" height="20" rx="1" />}
      {shape === "Pear" && <path d="M16 3.5C12.5 9 5 14 5 20.5a11 9 0 0 0 22 0C27 14 19.5 9 16 3.5Z" />}
      {shape === "Cushion" && <rect x="6" y="6" width="20" height="20" rx="5" />}
      {shape === "Marquise" && <path d="M16 2.5C2.5 12.5 2.5 19.5 16 29.5 29.5 19.5 29.5 12.5 16 2.5Z" />}
      {shape === "Radiant" && <rect x="6" y="6" width="20" height="20" rx="1" />}
      {shape === "Princess" && <rect x="6" y="6" width="20" height="20" />}
      {shape === "Asscher" && <rect x="6" y="6" width="20" height="20" />}
    </svg>
  );
}

const SHAPES: ShapeWithArtwork[] = [
  "Round", "Oval", "Emerald",
  "Pear", "Cushion", "Marquise",
  "Radiant", "Princess", "Asscher",
];

const imgSwap = {
  enter: { opacity: 0, scale: 1.03 },
  center: { opacity: 1, scale: 1, transition: { duration: 0.35, ease: "easeOut" as const } },
  exit: { opacity: 0, scale: 0.98, transition: { duration: 0.2, ease: "easeIn" as const } },
};

/* ════════════════════════════════════════════════════ */
export function SplitScreenShapeHero() {
  const [active, setActive] = useState<ShapeWithArtwork>("Pear");
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  const ringSrc = ringImages[active];

  return (
    <section className="ssh-section" aria-labelledby="ssh-h">
      <div className="ssh-shell">
        <div className="ssh-layout">

          {/* ── LEFT: Ring showcase ── */}
          <div className="ssh-showcase">
            <div className="ssh-showcase-inner">
              <p className="ssh-eyebrow">FIND YOUR SILHOUETTE</p>
              <h2 id="ssh-h" className="ssh-heading">Shop by diamond shape</h2>
              <p className="ssh-subtitle">Discover the shape that feels like you.</p>

              <div className="ssh-image-stage">
                <div className="ssh-image-frame">
                  <AnimatePresence mode="popLayout">
                    <motion.div key={active} className="ssh-image-wrap" variants={imgSwap} initial="enter" animate="center" exit="exit">
                      <Image src={ringSrc} alt={`${active} cut diamond engagement ring`} fill priority sizes="(max-width:767px) 70vw, 340px" className="ssh-ring-img" />
                      <div className="ssh-ring-shadow" aria-hidden="true" />
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.p key={active} className="ssh-shape-label" initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-6}} transition={{duration:.25}} aria-live="polite" aria-atomic="true">
                  {active.toUpperCase()} CUT · {active === "Round" ? "THE CLASSIC BRILLIANT" : "ON YOUR RING"}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>

          {/* ── RIGHT: Diamond shape grid with real PNG images ── */}
          <div className="ssh-picker">
            <div className="ssh-grid" role="listbox" aria-label="Diamond shape options">
              {SHAPES.map((s) => {
                const on = active === s;
                return (
                  <div key={s} role="option" aria-selected={on} className={`ssh-grid-item${on ? " ssh-grid-item--active" : ""}`}>
                    <Link href={`/collections/engagement?shape=${encodeURIComponent(s)}`} className="ssh-shape-btn" onMouseEnter={() => setActive(s)} onFocus={() => setActive(s)} onTouchStart={() => setActive(s)} aria-label={`${s} cut diamond shape`}>
                      <span className={`ssh-circle${on ? " ssh-circle--active" : ""}`}>
                        {on ? (
                          <Image src={`/images/diamonds/${s.toLowerCase()}.png`} alt={`${s} cut diamond`} width={52} height={52} className="ssh-diamond-img" />
                        ) : (
                          <DiamondOutline shape={s} size={30} />
                        )}
                        {on && (
                          <motion.span className="ssh-active-ring" layoutId="sshRing" transition={{type:"spring",stiffness:380,damping:30}} />
                        )}
                      </span>
                      <span className="ssh-shape-name">{s.toUpperCase()}</span>
                    </Link>
                  </div>
                );
              })}
            </div>

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
