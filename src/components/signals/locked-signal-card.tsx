import type { Signal, Symbol as SymbolModel } from "@prisma/client";

export function LockedSignalCard({
  signal,
}: {
  signal: Signal & { symbol: SymbolModel };
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
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
        <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-300">
          PREMIUM
        </span>
        <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
          Confidence 8+/10
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        {["Entry", "Stop Loss", "TP1", "R:R"].map((label) => (
          <div key={label}>
            <p className="text-zinc-500">{label}</p>
            <p className="select-none blur-sm text-zinc-400">1.00000</p>
          </div>
        ))}
      </div>

      <p className="mt-4 text-xs text-amber-200/80">
        Premium setup.{" "}
        <a href="/upgrade" className="text-amber-300 underline">
          Upgrade
        </a>{" "}
        to view entry, stop loss, take profits, and full analysis.
      </p>
    </div>
  );
}