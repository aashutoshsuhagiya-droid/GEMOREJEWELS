import { NextResponse } from "next/server";
import { adminRepository } from "@/lib/admin-repository";
import { getStorefrontOrderIds } from "@/lib/storefront-access";

export const dynamic = "force-dynamic";

export async function GET() {
  const allowed = new Set(await getStorefrontOrderIds());
  const invoice = adminRepository.listInvoices().find(item => item.status === "paid" && allowed.has(item.orderId));
  return invoice ? NextResponse.json({ number: invoice.number }) : NextResponse.json({ error: "No paid invoice is available yet." }, { status: 404 });
}
