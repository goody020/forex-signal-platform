import Link from "next/link";
import type { Signal, Symbol as SymbolModel } from "@prisma/client";
import { confidenceFromLabel } from "@/lib/utils/confidence";

export function SignalCard({
  signal,
}: {
  signal: Signal & { symbol: SymbolModel };
}) {
  const confidence =
    signal.confidence ??
    confidenceFromLabel(signal.qualityLabel ?? "WEAK_SETUP");  const dp = signal.symbol.priceDecimals;

  return (
    <Link
      href={`/signals/${signal.id}`}
      className="block rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 hover:border-zinc-600"
    >
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-lg font-semibold">{signal.symbol.displayName}</p>
        <span
          className={
            signal.direction === "BUY"
              ? "rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400"
              : "rounded-full bg-red-500/10 px-3 py-1 text-xs font-medium text-red-400"
          }
        >
          {signal.direction}
        </span>
        {signal.accessTier === "PREMIUM" && (
          <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-300">
            PREMIUM
          </span>
        )}
        <span
          className={
            confidence >= 8
              ? "rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300"
              : "rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-300"
          }
        >
          Confidence {confidence}/10
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <div>
          <p className="text-zinc-500">Entry</p>
          <p className="text-zinc-200">{signal.entryPrice.toFixed(dp)}</p>
        </div>
        <div>
          <p className="text-zinc-500">Stop Loss</p>
          <p className="text-red-300">{signal.stopLossPrice.toFixed(dp)}</p>
        </div>
        <div>
          <p className="text-zinc-500">TP1</p>
          <p className="text-emerald-300">{signal.tp1Price.toFixed(dp)}</p>
        </div>
        <div>
          <p className="text-zinc-500">R:R</p>
          <p className="text-zinc-200">
            1:{Number(signal.riskReward).toFixed(2)}
          </p>
        </div>
      </div>

      <p className="mt-4 text-xs text-zinc-500">
        {signal.timeframe} •{" "}
        {(signal.marketSession ?? "GLOBAL").replace(/_/g, " ")} •{" "}
        {signal.status.replace(/_/g, " ")}
      </p>
    </Link>
  );
}