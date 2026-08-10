import { requireAdmin } from "@/server/auth/guards";
import { prisma } from "@/server/db/client";
import { NewSignalForm } from "@/components/signals/new-signal-form";

export default async function NewSignalPage() {
  await requireAdmin();

  const symbols = await prisma.symbol.findMany({
    where: { isActive: true },
    orderBy: { symbol: "asc" },
    select: { id: true, displayName: true },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">New Signal</h1>
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
        <NewSignalForm symbols={symbols} />
      </div>
    </div>
  );
}