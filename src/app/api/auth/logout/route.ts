import { NextResponse } from "next/server";
import { adminSessionCookie } from "@/lib/admin-auth";
export async function POST() { const response = NextResponse.json({ ok: true }); response.cookies.set(adminSessionCookie, "", { httpOnly: true, path: "/", maxAge: 0 }); return response; }
