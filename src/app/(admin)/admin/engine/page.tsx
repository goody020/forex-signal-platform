import { requireAdmin } from "@/server/auth/guards";
import { prisma } from "@/server/db/client";
import {
  approveCandidate,
  discardCandidate,
  runEngineAction,
} from "@/server/actions/engine";
import { DEMO_DATA_LABEL } from "@/lib/constants/app";

export default async function AdminEnginePage() {
  await requireAdmin();

  const latestRun = await prisma.signalEngineRun.findFirst({
    orderBy: { startedAt: "desc" },
    include: { candidates: { include: { symbol: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Signal Engine</h1>
          <p className="mt-1 inline-block rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-300">
            {DEMO_DATA_LABEL} — not live market data
          </p>
        </div>
        <form action={runEngineAction}>
          <button className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500">
            Run Engine
          </button>
        </form>
      </div>

      {!latestRun ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
          <p className="text-sm text-zinc-400">
            No engine runs yet. Press “Run Engine” to analyze all pairs with
            demo data.
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
              <p className="text-sm text-zinc-500">Status</p>
              <p className="mt-1 text-lg">{latestRun.status}</p>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
              <p className="text-sm text-zinc-500">Candidates</p>
              <p className="mt-1 text-lg">{latestRun.candidatesCount}</p>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
              <p className="text-sm text-zinc-500">No-Trade Calls</p>
              <p className="mt-1 text-lg">{latestRun.noTradeCount}</p>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
              <p className="text-sm text-zinc-500">Started</p>
              <p className="mt-1 text-lg">
                {latestRun.startedAt
                  .toISOString()
                  .slice(0, 16)
                  .replace("T", " ")}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {latestRun.candidates.map((candidate) => {
              const reasons = Array.isArray(candidate.rejectionReasons)
                ? (candidate.rejectionReasons as unknown as string[])
                : [];

              return (
                <div
                  key={candidate.id}
                  className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5"
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-lg font-semibold">
                      {candidate.symbol.displayName}
                    </p>
                    <span
                      className={
                        candidate.direction === "BUY"
                          ? "rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400"
                          : "rounded-full bg-red-500/10 px-3 py-1 text-xs text-red-400"
                      }
                    >
                      {candidate.direction}
                    </span>
                    <span className="rounded-full bg-zinc-500/10 px-3 py-1 text-xs text-zinc-300">
                      Score {candidate.qualityScore}/100
                    </span>
                    <span className="rounded-full bg-sky-500/10 px-3 py-1 text-xs text-sky-300">
                      {candidate.qualityLabel.replace("_", " ")}
                    </span>
                    <span
                      className={
                        candidate.status === "PENDING_REVIEW"
                          ? "rounded-full bg-amber-500/10 px-3 py-1 text-xs text-amber-300"
                          : "rounded-full bg-zinc-500/10 px-3 py-1 text-xs text-zinc-400"
                      }
                    >
                      {candidate.status.replace("_", " ")}
                    </span>
                  </div>

                  {reasons.length > 0 && (
                    <p className="mt-3 text-xs text-red-300">
                      Rejected: {reasons.join(" • ")}
                    </p>
                  )}

                  {candidate.status === "PENDING_REVIEW" && (
                    <div className="mt-4 flex gap-2">
                      <form action={approveCandidate}>
                        <input type="hidden" name="id" value={candidate.id} />
                        <button className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs text-white hover:bg-emerald-500">
                          Approve → Draft Signal
                        </button>
                      </form>
                      <form action={discardCandidate}>
                        <input type="hidden" name="id" value={candidate.id} />
                        <button className="rounded-lg bg-zinc-800 px-3 py-1.5 text-xs text-zinc-200 hover:bg-zinc-700">
                          Discard
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}