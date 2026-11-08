import { NextRequest, NextResponse } from "next/server";
import { adminRepository } from "@/lib/admin-repository";
import { decodeStorefrontAccess, encodeStorefrontAccess, storefrontAccessCookie } from "@/lib/storefront-access";

type CheckoutBody = {
  customer?: { name?: string; email?: string; address?: string };
  items?: Array<{ slug?: string; quantity?: number; audPrice?: number; metal?: string; carat?: string; setting?: string }>;
  discountCode?: string;
};

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({})) as CheckoutBody;
  const customer = body.customer;
  const items = body.items;
  if (!customer?.email || !Array.isArray(items) || !items.length || items.some(item => !item.slug)) {
    return NextResponse.json({ error: "Please provide contact details and at least one piece." }, { status: 400 });
  }
  try {
    const result = adminRepository.createStorefrontOrder({
      customer: { name: customer.name ?? "", email: customer.email, address: customer.address ?? "" },
      items: items.map(item => ({ slug: item.slug!, quantity: item.quantity ?? 1, audPrice: item.audPrice, metal: item.metal, carat: item.carat, setting: item.setting })),
      discountCode: body.discountCode
    });
    const existing = decodeStorefrontAccess(request.cookies.get(storefrontAccessCookie)?.value)?.orderIds ?? [];
    const response = NextResponse.json({ ...result, paymentRequired: result.order.paymentStatus === "Pending" }, { status: 201 });
    response.cookies.set(storefrontAccessCookie, encodeStorefrontAccess([...existing, result.order.id]), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 90 });
    return response;
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to place this mock order." }, { status: 400 });
  }
}
