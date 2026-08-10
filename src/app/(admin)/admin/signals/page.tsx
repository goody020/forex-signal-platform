import { ResultForm } from "@/components/signals/result-form";
import Link from "next/link";
import { requireAdmin } from "@/server/auth/guards";
import { prisma } from "@/server/db/client";
import { UpdateStatusForm } from "@/components/signals/update-status-form";

export default async function AdminSignalsPage() {
  await requireAdmin();

  const signals = await prisma.signal.findMany({
    include: { symbol: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Manage Signals</h1>
        <Link
          href="/admin/signals/new"
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
        >
          + New Signal
        </Link>
      </div>

      {signals.length === 0 ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
          <p className="text-sm text-zinc-400">
            No signals yet. Create your first signal.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {signals.map((signal) => (
            <div
              key={signal.id}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5"
            >
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-lg font-semibold">
                  {signal.symbol.displayName}
                </p>
                <span
                  className={
                    signal.direction === "BUY"
                      ? "rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400"
                      : "rounded-full bg-red-500/10 px-3 py-1 text-xs font-medium text-red-400"
                  }
                >
                  {signal.direction}
                </span>
                <span className="rounded-full bg-zinc-500/10 px-3 py-1 text-xs text-zinc-300">
                  {signal.status}
                </span>
                <span className="rounded-full bg-zinc-500/10 px-3 py-1 text-xs text-zinc-300">
                  {signal.accessTier}
                </span>
                <span className="rounded-full bg-zinc-500/10 px-3 py-1 text-xs text-zinc-300">
                  {signal.qualityLabel ?? "UNSCORED"}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                <div>
                  <p className="text-zinc-500">Entry</p>
                  <p className="text-zinc-200">
                    {Number(signal.entryPrice).toFixed(signal.symbol.priceDecimals)}
                  </p>
                </div>
                <div>
                  <p className="text-zinc-500">Stop Loss</p>
                  <p className="text-red-300">
                    {Number(signal.stopLossPrice).toFixed(signal.symbol.priceDecimals)}
                  </p>
                </div>
                <div>
                  <p className="text-zinc-500">TP1</p>
                  <p className="text-emerald-300">
                    {Number(signal.tp1Price).toFixed(signal.symbol.priceDecimals)}
                  </p>
                </div>
                <div>
                  <p className="text-zinc-500">R:R</p>
                  <p className="text-zinc-200">
                    1:{Number(signal.riskReward ?? 0).toFixed(2)}
                  </p>
                </div>
              </div>

                            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-zinc-500">{signal.signalCode}</p>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <UpdateStatusForm id={signal.id} current={signal.status} />
                  <ResultForm id={signal.id} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}