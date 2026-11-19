import { NextResponse } from "next/server";
import { currencyOptions, STATIC_USD_RATES, STATIC_RATES_UPDATED_AT, type CurrencyRates } from "@/lib/currency";
import { persistFxRates, readPersistedFxRates } from "@/lib/fx-rate-store";

export const dynamic = "force-dynamic";

const CACHE_TTL_MS = 15 * 60 * 1000;
const UPSTREAM_TIMEOUT_MS = 8_000;

type FxResponse = {
  base: "USD";
  rates: CurrencyRates;
  updatedAt: string;
  source: "live" | "fallback";
};

let memoryCache: { response: FxResponse; cachedAt: number } | null = null;

function completeRates(candidate: CurrencyRates | undefined): CurrencyRates | null {
  if (!candidate) return null;
  const entries = currencyOptions.map(({ code }) => {
    const value = Number(candidate[code]);
    return [code, Number.isFinite(value) && value > 0 ? value : STATIC_USD_RATES[code]] as const;
  });
  const rates = Object.fromEntries(entries);
  return rates.USD === 1 ? rates : { ...rates, USD: 1 };
}

async function fetchLiveRates(apiKey: string): Promise<FxResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);
  try {
    const response = await fetch(`https://openexchangerates.org/api/latest.json?app_id=${encodeURIComponent(apiKey)}`, {
      cache: "no-store",
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`FX provider returned ${response.status}`);
    const payload = await response.json() as { rates?: CurrencyRates; timestamp?: number };
    const usdRates = payload.rates;
    if (!usdRates || !Number.isFinite(Number(usdRates.USD)) || Number(usdRates.USD) <= 0) throw new Error("FX provider omitted USD");

    const derived = Object.fromEntries(currencyOptions.map(({ code }) => {
      const providerRate = Number(usdRates[code]);
      return [code, Number.isFinite(providerRate) && providerRate > 0 ? providerRate : STATIC_USD_RATES[code]];
    }));
    derived.USD = 1;
    const updatedAt = payload.timestamp ? new Date(payload.timestamp * 1000).toISOString() : new Date().toISOString();
    try {
      persistFxRates(derived, updatedAt);
    } catch {
      // A persistence failure must not discard a valid live response.
    }
    return { base: "USD", rates: derived, updatedAt, source: "live" };
  } finally {
    clearTimeout(timeout);
  }
}

function fallbackResponse(): FxResponse {
  try {
    const persisted = readPersistedFxRates();
    const rates = completeRates(persisted?.rates);
    if (rates && persisted) return { base: "USD", rates, updatedAt: persisted.updatedAt, source: "fallback" };
  } catch {
    // A locked or unavailable database must not prevent storefront pricing.
  }
  return { base: "USD", rates: STATIC_USD_RATES, updatedAt: STATIC_RATES_UPDATED_AT, source: "fallback" };
}

export async function GET() {
  const now = Date.now();
  if (memoryCache && now - memoryCache.cachedAt < CACHE_TTL_MS) {
    return NextResponse.json(memoryCache.response, { headers: { "Cache-Control": "private, max-age=0" } });
  }

  let response: FxResponse;
  const apiKey = process.env.FX_RATES_API_KEY?.trim();
  if (apiKey) {
    try {
      response = await fetchLiveRates(apiKey);
    } catch {
      response = fallbackResponse();
    }
  } else {
    response = fallbackResponse();
  }

  memoryCache = { response, cachedAt: now };
  return NextResponse.json(response, { headers: { "Cache-Control": "private, max-age=0" } });
}
