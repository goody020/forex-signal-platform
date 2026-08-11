import { requireAdmin } from "@/server/auth/guards";
import { prisma } from "@/server/db/client";
import { updateSignalConfidence } from "@/server/actions/confidence";
import { confidenceFromLabel } from "@/lib/utils/confidence";

export default async function AdminConfidencePage() {
  await requireAdmin();

  const signals = await prisma.signal.findMany({
    include: { symbol: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Confidence Levels</h1>
        <p className="text-sm text-zinc-500">
          You decide the confidence (1–10) members see. Free signals: 6–9.
          Premium signals: 8 or higher.
        </p>
      </div>

      <div className="space-y-3">
        {signals.map((signal) => (
          <form
            key={signal.id}
            action={updateSignalConfidence}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4"
          >
            <input type="hidden" name="id" value={signal.id} />
            <div>
              <p className="font-medium">
                {signal.symbol.displayName}{" "}
                <span className="text-xs text-zinc-500">
                  ({signal.direction} • {signal.status.replace(/_/g, " ")})
                </span>
              </p>
              <p className="text-xs text-zinc-500">
                Members see:{" "}
                {signal.confidence ??
                  confidenceFromLabel(signal.qualityLabel ?? "WEAK_SETUP")}
                /10
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={10}
                name="confidence"
                defaultValue={signal.confidence ?? ""}
                placeholder="1-10"
                className="w-20 rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-sm outline-none focus:border-emerald-500"
              />
              <button className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs text-white hover:bg-emerald-500">
                Save
              </button>
            </div>
          </form>
        ))}
      </div>
    </div>
  );
}