import Link from "next/link";
import { requireUser } from "@/server/auth/guards";
import { prisma } from "@/server/db/client";
import { isPremiumUser } from "@/server/services/subscription";
import { computeStats } from "@/server/services/performance";
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from "date-fns";
import { RiskCalculator } from "@/components/risk/risk-calculator";

export default async function DashboardPage() {
  const session = await requireUser();
  const premium = await isPremiumUser(session.user.id, session.user.role);

  const activeSignals = await prisma.signal.findMany({
    where: { status: { in: ["ACTIVE", "TP1_HIT", "TP2_HIT"] } },
    include: { symbol: true },
    orderBy: { publishedAt: "desc" },
  });

  const visibleActive = activeSignals.filter(
    (signal) => premium || signal.accessTier === "FREE"
  );

  const closed = await prisma.signal.findMany({
    where: { result: { isNot: null } },
    include: { result: true },
  });

  const statRows = closed.map((row) => ({
    outcome: row.result!.outcome,
    realizedR: row.result!.realizedR,
    closedAt: row.closedAt,
  }));

  const now = new Date();
  const week = computeStats(
    statRows.filter(
      (row) =>
        row.closedAt &&
        row.closedAt >= startOfWeek(now, { weekStartsOn: 1 }) &&
        row.closedAt <= endOfWeek(now, { weekStartsOn: 1 })
    )
  );
  const month = computeStats(
    statRows.filter(
      (row) =>
        row.closedAt &&
        row.closedAt >= startOfMonth(now) &&
        row.closedAt <= endOfMonth(now)
    )
  );
  const allTime = computeStats(statRows);

  return (
    <div className="space-y-6">
           <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-zinc-500">
            {premium ? "Premium member" : "Free member"} — {session.user.email}
          </p>
        </div>

        {session.user.role === "ADMIN" && (
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/signals/new"
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
            >
              + New Signal
            </Link>
            <Link
              href="/admin/signals"
              className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-800"
            >
              Manage Signals
            </Link>
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
          <p className="text-sm text-zinc-500">Active Signals</p>
          <p className="mt-1 text-2xl font-semibold">{visibleActive.length}</p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
          <p className="text-sm text-zinc-500">This Week</p>
          <p className="mt-1 text-2xl font-semibold">
            {week.decided + week.cancelled}
            <span className="ml-2 text-sm font-normal text-zinc-500">
              closed
            </span>
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            {week.wins}W / {week.losses}L • {week.winRate.toFixed(0)}% •{" "}
            {week.totalR >= 0 ? "+" : ""}
            {week.totalR.toFixed(2)}R
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
          <p className="text-sm text-zinc-500">This Month</p>
          <p className="mt-1 text-2xl font-semibold">
            {month.winRate.toFixed(0)}%
            <span className="ml-2 text-sm font-normal text-zinc-500">
              win rate
            </span>
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            {month.totalR >= 0 ? "+" : ""}
            {month.totalR.toFixed(2)}R
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
          <p className="text-sm text-zinc-500">All Time</p>
          <p className="mt-1 text-2xl font-semibold">
            {allTime.totalR >= 0 ? "+" : ""}
            {allTime.totalR.toFixed(2)}R
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            {allTime.decided} decided trades
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Active Signals</h2>
          <Link href="/signals" className="text-sm text-emerald-400">
            View all →
          </Link>
        </div>

        {visibleActive.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-500">
            No high-quality trading opportunities are available right now.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {visibleActive.map((signal) => (
              <Link
                key={signal.id}
                href={`/signals/${signal.id}`}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 hover:border-zinc-600"
              >
                <div className="flex items-center gap-3">
                  <p className="font-semibold">{signal.symbol.displayName}</p>
                  <span
                    className={
                      signal.direction === "BUY"
                        ? "rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400"
                        : "rounded-full bg-red-500/10 px-3 py-1 text-xs text-red-400"
                    }
                  >
                    {signal.direction}
                  </span>
                </div>
                <p className="text-xs text-zinc-500">
                  {signal.timeframe} • {signal.status}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>

      <RiskCalculator />
    </div>
  );
}