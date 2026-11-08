import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const storefrontAccessCookie = "gemoire_storefront_access";
type StorefrontAccess = { orderIds: string[]; issuedAt: string };

function secret() {
  return process.env.GEMOIRE_SESSION_SECRET || "gemoire-local-demo-session-secret";
}

function signature(value: string) {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

export function encodeStorefrontAccess(orderIds: string[]) {
  const payload = Buffer.from(JSON.stringify({ orderIds: [...new Set(orderIds)].slice(-20), issuedAt: new Date().toISOString() } satisfies StorefrontAccess)).toString("base64url");
  return `${payload}.${signature(payload)}`;
}

export function decodeStorefrontAccess(value?: string): StorefrontAccess | null {
  try {
    if (!value) return null;
    const [payload, supplied] = value.split(".");
    if (!payload || !supplied) return null;
    const expected = signature(payload);
    const suppliedBytes = Buffer.from(supplied);
    const expectedBytes = Buffer.from(expected);
    if (suppliedBytes.length !== expectedBytes.length || !timingSafeEqual(suppliedBytes, expectedBytes)) return null;
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as Partial<StorefrontAccess>;
    if (!Array.isArray(parsed.orderIds) || !parsed.orderIds.every(id => typeof id === "string")) return null;
    return { orderIds: parsed.orderIds.slice(-20), issuedAt: typeof parsed.issuedAt === "string" ? parsed.issuedAt : "" };
  } catch {
    return null;
  }
}

export async function getStorefrontOrderIds() {
  return decodeStorefrontAccess((await cookies()).get(storefrontAccessCookie)?.value)?.orderIds ?? [];
}
