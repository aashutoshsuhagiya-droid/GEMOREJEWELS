"use client";

import { useEffect, useRef, type RefObject } from "react";

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

export function useDialogFocus(container: RefObject<HTMLElement | null>, onClose: () => void, enabled = true, allowEscape = true) {
  const closeRef = useRef(onClose);
  const escapeRef = useRef(allowEscape);
  closeRef.current = onClose;
  escapeRef.current = allowEscape;

  useEffect(() => {
    if (!enabled) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const focusFirst = () => {
      const panel = container.current;
      const target = panel?.querySelector<HTMLElement>("[data-autofocus]") ?? panel?.querySelector<HTMLElement>(focusableSelector);
      target?.focus();
    };
    const frame = window.requestAnimationFrame(focusFirst);
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape" && escapeRef.current) {
        event.preventDefault();
        closeRef.current();
        return;
      }
      if (event.key !== "Tab" || !container.current) return;
      const targets = [...container.current.querySelectorAll<HTMLElement>(focusableSelector)].filter(target => target.offsetParent !== null);
      if (!targets.length) {
        event.preventDefault();
        return;
      }
      const first = targets[0];
      const last = targets[targets.length - 1];
      if (event.shiftKey && (document.activeElement === first || !container.current.contains(document.activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !container.current.contains(document.activeElement))) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKeyDown);
      window.requestAnimationFrame(() => previous?.focus());
    };
  }, [container, enabled]);
}
