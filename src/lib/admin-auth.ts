import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type AdminRole = "Admin" | "Staff";
export type AdminSession = { email: string; name: string; role: AdminRole };
const cookieName = "gemoire_admin_session";

function sign(value: string) { return createHmac("sha256", process.env.GEMOIRE_SESSION_SECRET || "gemoire-local-demo-session-secret").update(`admin.${value}`).digest("base64url"); }
export function encodeSession(session: AdminSession) { const payload = Buffer.from(JSON.stringify(session)).toString("base64url"); return `${payload}.${sign(payload)}`; }
export function decodeSession(value?: string): AdminSession | null {
  try {
    if (!value) return null;
    const [payload, supplied] = value.split(".");
    if (!payload || !supplied) return null;
    const expected = sign(payload);
    const actualBytes = Buffer.from(supplied); const expectedBytes = Buffer.from(expected);
    if (actualBytes.length !== expectedBytes.length || !timingSafeEqual(actualBytes, expectedBytes)) return null;
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as Partial<AdminSession>;
    if (typeof parsed.email !== "string" || typeof parsed.name !== "string" || (parsed.role !== "Admin" && parsed.role !== "Staff")) return null;
    return parsed as AdminSession;
  } catch { return null; }
}
export async function getAdminSession() { return decodeSession((await cookies()).get(cookieName)?.value); }
export async function requireAdmin() { const session = await getAdminSession(); if (!session) redirect("/login?next=/admin"); return session; }
export const adminSessionCookie = cookieName;
