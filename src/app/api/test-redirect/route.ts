import { NextResponse } from "next/server";
import { adminRepository } from "@/lib/admin-repository";
export async function GET(request: Request) { const path = new URL(request.url).searchParams.get("from"); if (!path) return NextResponse.json({ error: "Provide a source path" }, { status: 400 }); const redirect = adminRepository.resolveRedirect(path); return redirect ? NextResponse.json(redirect) : NextResponse.json({ error: "No redirect found" }, { status: 404 }); }
