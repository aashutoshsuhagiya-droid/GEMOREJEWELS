import { LiveSettingsScreen } from "@/components/admin/live-settings-screen";
import { AdminRoleGate } from "@/components/admin/role-gate";
import { getAdminSession } from "@/lib/admin-auth";
export default async function AdminSettingsPage() { const session = await getAdminSession(); return session?.role === "Admin" ? <LiveSettingsScreen/> : <AdminRoleGate title="Settings control billing, shipping and storefront defaults."/>; }
