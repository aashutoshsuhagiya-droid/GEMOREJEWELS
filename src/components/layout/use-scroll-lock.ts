"use client";

import { useEffect } from "react";

/**
 * Locks page scrolling while an overlay is open. The lock goes on <html> because
 * html/body use `overflow-x: clip`, so the viewport takes its overflow from the root.
 * Pass a media query to lock only while it matches (e.g. mobile-only overlays).
 */
export function useScrollLock(locked: boolean, query?: string) {
  useEffect(() => {
    if (!locked) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    const media = query ? window.matchMedia(query) : null;
    const apply = () => { root.style.overflow = !media || media.matches ? "hidden" : previous; };
    apply();
    media?.addEventListener("change", apply);
    return () => {
      media?.removeEventListener("change", apply);
      root.style.overflow = previous;
    };
  }, [locked, query]);
}
