import Link from "next/link";
import type { Signal, Symbol as SymbolModel } from "@prisma/client";
import { formatPrice } from "@/lib/utils/format";

export function SignalCard({
  signal,
}: {
  signal: Signal & { symbol: SymbolModel };
}) {
  return (
    <Link
      href={`/signals/${signal.id}`}
      className="block rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 transition hover:border-zinc-600"
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
        <span className="rounded-full bg-zinc-500/10 px-3 py-1 text-xs text-zinc-300">
          {signal.status}
        </span>
        <span className="rounded-full bg-sky-500/10 px-3 py-1 text-xs text-sky-300">
          {signal.qualityLabel?.replace("_", " ") ?? "UNSCORED"}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <div>
          <p className="text-zinc-500">Entry</p>
          <p className="text-zinc-200">
            {formatPrice(signal.entryPrice, signal.symbol.priceDecimals)}
          </p>
        </div>
        <div>
          <p className="text-zinc-500">Stop Loss</p>
          <p className="text-red-300">
            {formatPrice(signal.stopLossPrice, signal.symbol.priceDecimals)}
          </p>
        </div>
        <div>
          <p className="text-zinc-500">TP1</p>
          <p className="text-emerald-300">
            {formatPrice(signal.tp1Price, signal.symbol.priceDecimals)}
          </p>
        </div>
        <div>
          <p className="text-zinc-500">R:R</p>
          <p className="text-zinc-200">
            1:{Number(signal.riskReward ?? 0).toFixed(2)}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500">
        <p>
          {signal.timeframe} • {signal.marketSession?.replace("_", " ")} •{" "}
          {signal.signalCode}
        </p>
        <p className="text-emerald-400">View details →</p>
      </div>
    </Link>
  );
}