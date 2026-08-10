import { requireUser } from "@/server/auth/guards";
import { AppShell } from "@/components/layout/app-shell";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireUser();
  return <AppShell session={session}>{children}</AppShell>;
}