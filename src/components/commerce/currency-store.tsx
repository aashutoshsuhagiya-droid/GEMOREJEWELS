"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { DEFAULT_CURRENCY, STATIC_USD_RATES, STATIC_RATES_UPDATED_AT, currencyOptions, formatCurrencyAmount, isCurrencyCode, type CurrencyCode, type CurrencyRates } from "@/lib/currency";

const STORAGE_KEY = "gemoire_currency";

type CurrencyContextValue = {
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
  rates: CurrencyRates;
  ratesUpdatedAt: string;
  ratesSource: "live" | "fallback";
  formatMoney: (usdValue: number, legacyValue?: number) => string;
};

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

type RatesPayload = {
  base: "USD";
  rates: CurrencyRates;
  updatedAt: string;
  source: "live" | "fallback";
};

let sessionRatesRequest: Promise<RatesPayload> | null = null;

function loadSessionRates() {
  sessionRatesRequest ??= fetch("/api/currency/rates")
    .then(async response => {
      if (!response.ok) throw new Error("Unable to load FX rates");
      return response.json() as Promise<RatesPayload>;
    })
    .then(payload => payload.base === "USD" && payload.rates ? payload : Promise.reject(new Error("Invalid FX response")))
    .catch(() => ({ base: "USD" as const, rates: STATIC_USD_RATES, updatedAt: STATIC_RATES_UPDATED_AT, source: "fallback" as const }));
  return sessionRatesRequest;
}

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>(DEFAULT_CURRENCY);
  const [rates, setRates] = useState<CurrencyRates>(STATIC_USD_RATES);
  const [ratesUpdatedAt, setRatesUpdatedAt] = useState(STATIC_RATES_UPDATED_AT);
  const [ratesSource, setRatesSource] = useState<"live" | "fallback">("fallback");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (isCurrencyCode(saved)) setCurrencyState(saved);
    } catch {
      // Storage can be unavailable in privacy-restricted browsers; USD remains the safe default.
    }
  }, []);

  useEffect(() => {
    let active = true;
    loadSessionRates().then(payload => {
      if (!active) return;
      setRates(payload.rates);
      setRatesUpdatedAt(payload.updatedAt);
      setRatesSource(payload.source);
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    document.documentElement.dataset.currency = currency;
  }, [currency]);

  const setCurrency = useCallback((next: CurrencyCode) => {
    setCurrencyState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // The active session still updates even when persistence is unavailable.
    }
  }, []);

  const formatMoney = useCallback((usdValue: number, _legacyValue?: number) => formatCurrencyAmount(usdValue, currency, rates), [currency, rates]);
  const value = useMemo(() => ({ currency, setCurrency, rates, ratesUpdatedAt, ratesSource, formatMoney }), [currency, formatMoney, rates, ratesSource, ratesUpdatedAt, setCurrency]);

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error("useCurrency must be within CurrencyProvider");
  return context;
}

export function CurrencyRegionLabel() {
  const { currency } = useCurrency();
  const option = currencyOptions.find(item => item.code === currency) ?? currencyOptions[0];
  return <span>{option.country} ({option.code})</span>;
}

export function CurrencyAmount({ usd }: { usd: number }) {
  const { formatMoney } = useCurrency();
  return <>{formatMoney(usd)}</>;
}

function ratesTimeLabel(updatedAt: string) {
  const date = new Date(updatedAt);
  if (Number.isNaN(date.valueOf())) return "recently";
  return new Intl.DateTimeFormat("en-AU", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "UTC", timeZoneName: "short" }).format(date);
}

export function CurrencyRatesIndicator({ compact = false }: { compact?: boolean }) {
  const { ratesSource, ratesUpdatedAt } = useCurrency();
  const status = ratesSource === "live" ? "live FX rates" : "fallback FX rates";
  const label = `Prices converted from USD at ${status}, updated ${ratesTimeLabel(ratesUpdatedAt)}`;
  return <span className={`currency-rates-note${compact ? " compact" : ""}`} title={label} aria-live="polite">{compact ? `${ratesSource === "live" ? "Live" : "Fallback"} rates - ${ratesTimeLabel(ratesUpdatedAt)}` : label}</span>;
}
