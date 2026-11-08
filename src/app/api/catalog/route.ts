import { NextResponse } from "next/server";
import { adminRepository, toStorefrontProduct } from "@/lib/admin-repository";
export const dynamic = "force-dynamic";
export async function GET() { return NextResponse.json(adminRepository.listProducts().filter(product => product.status === "active").map(toStorefrontProduct)); }
