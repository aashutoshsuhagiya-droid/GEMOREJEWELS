import { notFound, permanentRedirect, redirect } from "next/navigation";
import { adminRepository } from "@/lib/admin-repository";
export const dynamic = "force-dynamic";
export default async function LegacyRedirectPage({ params }: { params: Promise<{ legacy: string[] }> }) { const { legacy } = await params; const source = `/${legacy.join("/")}`; const rule = adminRepository.resolveRedirect(source); if (rule?.type === 301) permanentRedirect(rule.to); if (rule?.type === 302) redirect(rule.to); notFound(); }
