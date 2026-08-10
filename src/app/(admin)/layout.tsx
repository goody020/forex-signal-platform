import { requireAdmin } from "@/server/auth/guards";
import { AdminShell } from "@/components/layout/admin-shell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();
  return <AdminShell session={session}>{children}</AdminShell>;
}