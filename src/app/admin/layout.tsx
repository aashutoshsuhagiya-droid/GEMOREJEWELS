import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/shell";
import { requireAdmin } from "@/lib/admin-auth";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await requireAdmin();
  return <AdminShell session={session}>{children}</AdminShell>;
}
