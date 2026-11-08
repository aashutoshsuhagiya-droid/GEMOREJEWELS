import { NextResponse } from "next/server";
import { adminRepository } from "@/lib/admin-repository";
export const dynamic = "force-dynamic";
export async function GET() { const settings = adminRepository.getSettings(); return NextResponse.json({ freeShippingThreshold: settings.freeShippingThreshold, cities: settings.cities, arEnabled: settings.arEnabled, arNote: settings.arNote, paymentEnabled: settings.paymentEnabled, bankDetails: settings.bankDetails }); }
