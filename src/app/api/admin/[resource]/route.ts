import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { adminRepository } from "@/lib/admin-repository";
import type { EntityName, RedirectRule } from "@/shared/admin-types";

const entities = new Set<EntityName>([
  "products", "orders", "customers", "invoices", "creditNotes", "collections", "discounts", "subscribers",
  "instagram", "seoPages", "redirects", "faqs", "reviews", "blog", "bookings", "craft", "quizQuestions",
  "quizOutcomes",
]);

type AdminBody = { action?: string; id?: string; value?: Record<string, unknown> };
const isRecord = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === "object" && !Array.isArray(value);

async function authorized() {
  return Boolean(await getAdminSession());
}

function mutationError(resource: EntityName, value: Record<string, unknown>) {
  if (typeof value.id !== "string" || !value.id.trim()) return "Every record requires a stable id.";

  const requiredStrings: Partial<Record<EntityName, string[]>> = {
    products: ["slug", "name", "sku", "description", "status"],
    orders: ["code", "customerId", "status", "paymentStatus", "createdAt"],
    customers: ["name", "email"],
    invoices: ["number", "orderId", "customerId", "status"],
    collections: ["name", "slug"],
    discounts: ["code", "type", "scope", "expiresAt", "status"],
    subscribers: ["email", "addedAt"],
    seoPages: ["slug", "title", "canonical", "jsonLdType", "status"],
    redirects: ["from", "to"],
    faqs: ["question", "answer"],
    reviews: ["productId", "customerName", "quote", "status"],
    blog: ["title", "slug", "body", "status"],
    bookings: ["name", "email", "city", "date", "status"],
    craft: ["orderId"],
    quizQuestions: ["question"],
  };

  for (const field of requiredStrings[resource] ?? []) {
    if (typeof value[field] !== "string" || !String(value[field]).trim()) return `${field} is required.`;
  }

  if (resource === "products") {
    if (!Array.isArray(value.images) || !value.images.length) return "Products require at least one image.";
    if (!Array.isArray(value.collectionIds) || !value.collectionIds.length) return "Products require at least one collection.";
    if (typeof value.priceAud !== "number" || value.priceAud <= 0) return "Products require a positive AUD price.";
  }
  if (resource === "discounts" && (typeof value.usageCap !== "number" || value.usageCap < 1)) return "Discount usage cap must be at least 1.";
  if (resource === "seoPages" && !String(value.slug).startsWith("/")) return "SEO page slugs must start with /.";
  return null;
}

function normalizeRedirect(value: Record<string, unknown>): RedirectRule {
  const cleanPath = (raw: unknown) => String(raw ?? "").trim().replace(/\/{2,}/g, "/");
  const from = cleanPath(value.from);
  const to = cleanPath(value.to);
  const type = Number(value.type);

  if (!from.startsWith("/") || from === "/" || from.includes("..") || /[\\?#\u0000-\u001f\u007f]/.test(from)) {
    throw new Error("Redirect sources must be internal paths such as /old-page.");
  }
  if (!to.startsWith("/") || to.includes("..") || /[\\?#\u0000-\u001f\u007f]/.test(to)) {
    throw new Error("Redirect destinations must be safe internal paths.");
  }
  if (from === to) throw new Error("A redirect cannot point to itself.");
  if (type !== 301 && type !== 302) throw new Error("Redirect type must be 301 or 302.");

  const id = String(value.id);
  const existing = adminRepository.list("redirects");
  const active = typeof value.active === "boolean" ? value.active : true;
  if (existing.some(rule => rule.id !== id && rule.from === from)) throw new Error("A redirect already uses that source path.");
  if (active) {
    const visited = new Set<string>();
    let cursor = to;
    while (!visited.has(cursor)) {
      if (cursor === from) throw new Error("That redirect would create a loop.");
      visited.add(cursor);
      const next = existing.find(rule => rule.id !== id && rule.active && rule.from === cursor);
      if (!next) break;
      cursor = next.to;
    }
  }

  return {
    id,
    from,
    to,
    type,
    hits: typeof value.hits === "number" && value.hits >= 0 ? Math.floor(value.hits) : 0,
    active,
  };
}

export async function GET(_request: Request, { params }: { params: Promise<{ resource: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { resource } = await params;
  if (resource === "settings") {
    if (session.role !== "Admin") return NextResponse.json({ error: "Admin role required" }, { status: 403 });
    return NextResponse.json(adminRepository.getSettings());
  }
  if (resource === "storefront-config") {
    const { quizPublished, instagramHandle, arEnabled, arNote } = adminRepository.getSettings();
    return NextResponse.json({ quizPublished, instagramHandle, arEnabled, arNote });
  }
  if (resource === "seo-site") return NextResponse.json(adminRepository.getSeoSite());
  if (resource === "seo-analytics") return NextResponse.json(adminRepository.getSeoAnalytics());
  if (!entities.has(resource as EntityName)) return NextResponse.json({ error: "Unknown resource" }, { status: 404 });
  return NextResponse.json(adminRepository.list(resource as EntityName));
}

export async function POST(request: Request, { params }: { params: Promise<{ resource: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { resource } = await params;
  const body = await request.json().catch(() => ({})) as AdminBody;

  try {
    if (resource === "storefront-config" && isRecord(body.value)) {
      const current = adminRepository.getSettings();
      const patch = {
        quizPublished: typeof body.value.quizPublished === "boolean" ? body.value.quizPublished : current.quizPublished,
        instagramHandle: typeof body.value.instagramHandle === "string" ? body.value.instagramHandle : current.instagramHandle,
        arEnabled: typeof body.value.arEnabled === "boolean" ? body.value.arEnabled : current.arEnabled,
        arNote: typeof body.value.arNote === "string" ? body.value.arNote : current.arNote,
      };
      return NextResponse.json(adminRepository.updateSettings(patch));
    }
    if ((resource === "settings" || body.action === "reset") && session.role !== "Admin") {
      return NextResponse.json({ error: "Admin role required" }, { status: 403 });
    }
    if (body.action === "mark-paid" && body.id) return NextResponse.json(adminRepository.markOrderPaid(body.id));
    if (body.action === "mark-shipped" && body.id) return NextResponse.json(adminRepository.markShipped(body.id));
    if (body.action === "refund" && body.id) return NextResponse.json(adminRepository.refundInvoice(body.id));
    if (body.action === "reset" && session.role === "Admin") {
      adminRepository.resetDemoData();
      return NextResponse.json({ ok: true });
    }
    if (resource === "settings" && isRecord(body.value)) return NextResponse.json(adminRepository.updateSettings(body.value));
    if (resource === "seo-site" && isRecord(body.value)) return NextResponse.json(adminRepository.updateSeoSite(body.value));
    if (entities.has(resource as EntityName) && isRecord(body.value)) {
      const entity = resource as EntityName;
      const error = mutationError(entity, body.value);
      if (error) return NextResponse.json({ error }, { status: 400 });
      if (entity === "orders") {
        const existing = adminRepository.get("orders", String(body.value.id));
        if (!existing) return NextResponse.json({ error: "Orders are created through checkout." }, { status: 400 });
        if (body.value.paymentStatus !== existing.paymentStatus) {
          return NextResponse.json({ error: "Use the payment or refund action so linked invoices and customer spend remain consistent." }, { status: 400 });
        }
      }
      const value = entity === "redirects" ? normalizeRedirect(body.value) : body.value;
      return NextResponse.json(adminRepository.upsert(entity, value as never));
    }
    return NextResponse.json({ error: "Invalid admin mutation" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Admin mutation failed" }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ resource: string }> }) {
  if (!await authorized()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { resource } = await params;
  const { id } = await request.json().catch(() => ({})) as { id?: string };
  if (resource === "orders") return NextResponse.json({ error: "Orders cannot be deleted" }, { status: 405 });
  if (!id || !entities.has(resource as EntityName)) return NextResponse.json({ error: "Invalid delete" }, { status: 400 });
  adminRepository.remove(resource as EntityName, id);
  return NextResponse.json({ ok: true });
}
