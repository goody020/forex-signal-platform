import { requireUser } from "@/server/auth/guards";
import { prisma } from "@/server/db/client";
import { computeStats } from "@/server/services/performance";
import { formatPrice } from "@/lib/utils/format";
import { startOfWeek, endOfWeek } from "date-fns";

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requireUser();
  const sp = await searchParams;
  const outcomeFilter = sp.outcome ?? "ALL";

  const rows = await prisma.signal.findMany({
    where: { result: { isNot: null } },
    include: { symbol: true, result: true },
    orderBy: { closedAt: "desc" },
  });

  const statRows = rows.map((row) => ({
    outcome: row.result!.outcome,
    realizedR: row.result!.realizedR,
    closedAt: row.closedAt,
  }));

  const allTime = computeStats(statRows);

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
  const weekRows = statRows.filter(
    (row) => row.closedAt && row.closedAt >= weekStart && row.closedAt <= weekEnd
  );
  const week = computeStats(weekRows);

  const filtered =
    outcomeFilter === "ALL"
      ? rows
      : rows.filter((row) => row.result!.outcome === outcomeFilter);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Trade History</h1>
        <p className="text-sm text-zinc-500">
          Transparent performance. Wins and losses are both shown.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
          <p className="text-sm text-zinc-500">This Week</p>
          <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
            <div>
              <p className="text-zinc-500">Signals</p>
              <p className="text-lg text-zinc-100">{week.decided + week.cancelled}</p>
            </div>
            <div>
              <p className="text-zinc-500">Wins</p>
              <p className="text-lg text-emerald-400">{week.wins}</p>
            </div>
            <div>
              <p className="text-zinc-500">Losses</p>
              <p className="text-lg text-red-400">{week.losses}</p>
            </div>
            <div>
              <p className="text-zinc-500">Win Rate</p>
              <p className="text-lg text-zinc-100">{week.winRate.toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-zinc-500">Total R</p>
              <p className="text-lg text-zinc-100">
                {week.totalR >= 0 ? "+" : ""}
                {week.totalR.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
          <p className="text-sm text-zinc-500">All Time</p>
          <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
            <div>
              <p className="text-zinc-500">Signals</p>
              <p className="text-lg text-zinc-100">{allTime.decided + allTime.cancelled}</p>
            </div>
            <div>
              <p className="text-zinc-500">Wins</p>
              <p className="text-lg text-emerald-400">{allTime.wins}</p>
            </div>
            <div>
              <p className="text-zinc-500">Losses</p>
              <p className="text-lg text-red-400">{allTime.losses}</p>
            </div>
            <div>
              <p className="text-zinc-500">Win Rate</p>
              <p className="text-lg text-zinc-100">{allTime.winRate.toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-zinc-500">Total R</p>
              <p className="text-lg text-zinc-100">
                {allTime.totalR >= 0 ? "+" : ""}
                {allTime.totalR.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <form method="GET" className="flex gap-2">
        <select
          name="outcome"
          defaultValue={outcomeFilter}
          className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none"
        >
          <option value="ALL">All results</option>
          <option value="WIN">Wins</option>
          <option value="LOSS">Losses</option>
          <option value="BREAKEVEN">Breakeven</option>
        </select>
        <button
          type="submit"
          className="rounded-lg bg-zinc-800 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-700"
        >
          Filter
        </button>
      </form>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
          <p className="text-sm text-zinc-400">No closed trades yet.</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-2xl border border-zinc-800 md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-900 text-zinc-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Pair</th>
                  <th className="px-4 py-3 font-medium">Direction</th>
                  <th className="px-4 py-3 font-medium">Entry</th>
                  <th className="px-4 py-3 font-medium">SL</th>
                  <th className="px-4 py-3 font-medium">TP1</th>
                  <th className="px-4 py-3 font-medium">Result</th>
                  <th className="px-4 py-3 font-medium">R</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr key={row.id} className="border-t border-zinc-800 bg-zinc-950/40">
                    <td className="px-4 py-3 text-zinc-200">{row.symbol.displayName}</td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          row.direction === "BUY"
                            ? "text-emerald-400"
                            : "text-red-400"
                        }
                      >
                        {row.direction}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-300">
                      {formatPrice(row.entryPrice, row.symbol.priceDecimals)}
                    </td>
                    <td className="px-4 py-3 text-red-300">
                      {formatPrice(row.stopLossPrice, row.symbol.priceDecimals)}
                    </td>
                    <td className="px-4 py-3 text-emerald-300">
                      {formatPrice(row.tp1Price, row.symbol.priceDecimals)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          row.result!.outcome === "WIN"
                            ? "rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400"
                            : row.result!.outcome === "LOSS"
                              ? "rounded-full bg-red-500/10 px-3 py-1 text-xs text-red-400"
                              : "rounded-full bg-zinc-500/10 px-3 py-1 text-xs text-zinc-300"
                        }
                      >
                        {row.result!.outcome}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-200">
                      {Number(row.result!.realizedR ?? 0) >= 0 ? "+" : ""}
                      {Number(row.result!.realizedR ?? 0).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {filtered.map((row) => (
              <div
                key={row.id}
                className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4"
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{row.symbol.displayName}</p>
                  <span
                    className={
                      row.result!.outcome === "WIN"
                        ? "rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400"
                        : row.result!.outcome === "LOSS"
                          ? "rounded-full bg-red-500/10 px-3 py-1 text-xs text-red-400"
                          : "rounded-full bg-zinc-500/10 px-3 py-1 text-xs text-zinc-300"
                    }
                  >
                    {row.result!.outcome}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <p className="text-zinc-500">
                    Direction:{" "}
                    <span className="text-zinc-200">{row.direction}</span>
                  </p>
                  <p className="text-zinc-500">
                    R:{" "}
                    <span className="text-zinc-200">
                      {Number(row.result!.realizedR ?? 0) >= 0 ? "+" : ""}
                      {Number(row.result!.realizedR ?? 0).toFixed(2)}
                    </span>
                  </p>
                  <p className="text-zinc-500">
                    Entry:{" "}
                    <span className="text-zinc-200">
                      {formatPrice(row.entryPrice, row.symbol.priceDecimals)}
                    </span>
                  </p>
                  <p className="text-zinc-500">
                    SL:{" "}
                    <span className="text-zinc-200">
                      {formatPrice(row.stopLossPrice, row.symbol.priceDecimals)}
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
        <p className="text-sm leading-6 text-amber-100/80">
          Historical performance does not guarantee future results. All
          statistics shown are based on closed signals only.
        </p>
      </div>
    </div>
  );
}