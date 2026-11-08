import { notFound } from "next/navigation";
import { ConnectedProductEditor } from "@/components/admin/connected-product-editor";
import { adminRepository } from "@/lib/admin-repository";
export const dynamic = "force-dynamic";
export default async function AdminProductEditorPage({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const product = adminRepository.getProduct(slug); if (!product) notFound(); return <ConnectedProductEditor initial={product}/>; }
