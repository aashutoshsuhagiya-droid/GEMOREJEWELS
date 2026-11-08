import { NextResponse } from "next/server";
import { adminRepository } from "@/lib/admin-repository";
type CartLine = { slug?: string; quantity?: number; audPrice?: number; metal?: string; carat?: string; setting?: string };

export async function POST(request: Request) {
  const { code, items = [] } = await request.json().catch(() => ({})) as { code?: string; items?: CartLine[] };
  const selections = items.flatMap(item => item.slug ? [{ slug: item.slug, quantity: item.quantity ?? 1, audPrice: item.audPrice, metal: item.metal, carat: item.carat, setting: item.setting }] : []);
  try {
    return NextResponse.json(adminRepository.quoteStorefrontDiscount(code ?? "", selections));
  } catch (error) {
    const message = error instanceof Error ? error.message : "That code could not be applied.";
    const status = message === "That code is not active." ? 404 : message === "That code has expired." ? 410 : message === "That code has reached its usage limit." ? 409 : message === "That code is not valid for the pieces currently in your bag." ? 422 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
