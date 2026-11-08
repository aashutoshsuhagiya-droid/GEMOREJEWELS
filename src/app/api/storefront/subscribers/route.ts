import { NextResponse } from "next/server";
import { adminRepository } from "@/lib/admin-repository";
import type { Subscriber } from "@/shared/admin-types";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({})) as { email?: string };
  const email = body.email?.trim().toLowerCase() ?? "";
  if (!/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });

  const existing = adminRepository.list("subscribers").find(subscriber => subscriber.email.toLowerCase() === email);
  const subscriber: Subscriber = existing
    ? { ...existing, unsubscribed: false, source: existing.source || "Newsletter band" }
    : { id: `sub-${crypto.randomUUID()}`, email, addedAt: new Date().toISOString(), source: "Newsletter band", unsubscribed: false };
  adminRepository.upsert("subscribers", subscriber);
  return NextResponse.json({ subscriber, restored: Boolean(existing?.unsubscribed) }, { status: existing ? 200 : 201 });
}
