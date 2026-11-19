"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useCurrency } from "@/components/commerce/currency-store";
import { currencyOptions, currencySymbol, type CurrencyCode } from "@/lib/currency";

export function CurrencySelector({ mobile = false }: { mobile?: boolean }) {
  const { currency, setCurrency } = useCurrency();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const listId = useId();
  const optionsWithSymbols = useMemo(() => currencyOptions.map(option => ({ ...option, symbol: currencySymbol(option.code) })), []);
  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return term ? optionsWithSymbols.filter(option => `${option.country} ${option.code} ${option.symbol}`.toLowerCase().includes(term)) : optionsWithSymbols;
  }, [optionsWithSymbols, query]);

  useEffect(() => {
    if (!open) return;
    searchRef.current?.focus();
    const closeFromOutside = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeFromKeyboard = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
    };
    document.addEventListener("pointerdown", closeFromOutside);
    document.addEventListener("keydown", closeFromKeyboard);
    return () => {
      document.removeEventListener("pointerdown", closeFromOutside);
      document.removeEventListener("keydown", closeFromKeyboard);
    };
  }, [open]);

  function choose(next: CurrencyCode) {
    setCurrency(next);
    setQuery("");
    setOpen(false);
    triggerRef.current?.focus();
  }

  function focusOption(index: number) {
    if (!filtered.length) return;
    const normalized = (index + filtered.length) % filtered.length;
    const option = optionRefs.current[normalized];
    option?.focus({ preventScroll: true });
    option?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "instant" });
  }

  function navigateOptions(event: React.KeyboardEvent, index = -1) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      focusOption(index + 1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      focusOption(index < 0 ? filtered.length - 1 : index - 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      focusOption(0);
    } else if (event.key === "End") {
      event.preventDefault();
      focusOption(filtered.length - 1);
    }
  }

  return <div className={`currency-selector${mobile ? " currency-selector-mobile" : ""}`} ref={rootRef} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}>
    <button ref={triggerRef} type="button" className="currency-trigger" aria-label={`Choose currency, currently ${currency}`} aria-haspopup="listbox" aria-expanded={open} aria-controls={listId} onClick={() => setOpen(value => !value)}>
      {mobile ? <span>Currency</span> : null}<strong>{currency}</strong><svg className={open ? "open" : ""} width="9" height="6" viewBox="0 0 9 6" aria-hidden="true"><path d="M4.5 0 9 6H0z" fill="currentColor"/></svg>
    </button>
    {open ? <div className="currency-popover">
      <label className="currency-search-wrap"><span className="sr-only">Search country, code or symbol</span><input ref={searchRef} className="currency-search" value={query} onChange={event => setQuery(event.target.value)} onKeyDown={event => navigateOptions(event)} placeholder="Search" autoComplete="off" spellCheck={false} aria-controls={listId}/></label>
      <div className="currency-list" id={listId} role="listbox" aria-label="Available currencies">
        {filtered.map((option, index) => <button ref={node => { optionRefs.current[index] = node; }} type="button" role="option" aria-label={`${option.country}, ${option.code}, ${option.symbol}`} aria-selected={currency === option.code} className={`currency-option${currency === option.code ? " active" : ""}`} onKeyDown={event => navigateOptions(event, index)} onClick={() => choose(option.code)} key={option.code}><span className="currency-country">{option.country}</span><span className="currency-check" aria-hidden="true">{currency === option.code ? <svg viewBox="0 0 16 16"><path d="m3 8.5 3 3 7-7"/></svg> : null}</span></button>)}
      </div>
      {!filtered.length ? <p className="currency-empty" role="status">No matching currency found.</p> : null}
    </div> : null}
  </div>;
}
