import { requireAdmin } from "@/server/auth/guards";
import { prisma } from "@/server/db/client";
import { updateSignalConfidence } from "@/server/actions/confidence";
import { confidenceFromLabel } from "@/lib/utils/confidence";

export default async function AdminConfidencePage() {
  await requireAdmin();

  // Removed the "take: 50" limit so it shows EVERY signal
  const signals = await prisma.signal.findMany({
    include: { symbol: true },
    orderBy: { createdAt: "desc" },
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

      {signals.length === 0 ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 text-center">
          <p className="text-sm text-zinc-400">
            No signals found yet. Create a signal first to set its confidence.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {signals.map((signal) => (
            <form
              key={signal.id}
              action={updateSignalConfidence}
              className="flex flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <input type="hidden" name="id" value={signal.id} />
              
              <div>
                <p className="font-medium text-zinc-100">
                  {signal.symbol.displayName}{" "}
                  <span className="text-xs text-zinc-500">
                    ({signal.direction} • {signal.status.replace(/_/g, " ")})
                  </span>
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  Members currently see:{" "}
                  <span className="font-bold text-emerald-400">
                    {signal.confidence ??
                      confidenceFromLabel(signal.qualityLabel ?? "WEAK_SETUP")}
                    /10
                  </span>
                </p>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={1}
                  max={10}
                  name="confidence"
                  defaultValue={signal.confidence ?? ""}
                  placeholder="1-10"
                  className="w-24 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                />
                <button className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-medium text-white hover:bg-emerald-500">
                  Save
                </button>
              </div>
            </form>
          ))}
        </div>
      )}
    </div>
  );
}