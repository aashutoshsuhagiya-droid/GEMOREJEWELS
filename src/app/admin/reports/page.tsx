import { ConnectedReports } from "@/components/admin/connected-reports";
import { AdminRoleGate } from "@/components/admin/role-gate";
import { getAdminSession } from "@/lib/admin-auth";
export default async function AdminReportsPage() { const session = await getAdminSession(); return session?.role === "Admin" ? <ConnectedReports/> : <AdminRoleGate title="Reports and CSV exports are reserved for Admin users."/>; }
