import { redirect } from "next/navigation";
import { requireUser } from "@/server/auth/guards";
import { prisma } from "@/server/db/client";
import { isPremiumUser } from "@/server/services/subscription";
import { formatPrice } from "@/lib/utils/format";
import type { SignalStatus } from "@prisma/client";

const publishedStatuses: SignalStatus[] = [
  "ACTIVE",
  "TP1_HIT",
  "TP2_HIT",
  "CLOSED_TP",
  "CLOSED_SL",
];

export default async function SignalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireUser();
  const { id } = await params;

  const signal = await prisma.signal.findUnique({
    where: { id },
    include: {
      symbol: true,
      updates: { orderBy: { createdAt: "asc" } },
      result: true,
    },
  });

  if (!signal || !publishedStatuses.includes(signal.status)) {
    redirect("/signals");
  }

  const premium = await isPremiumUser(session.user.id, session.user.role);

  if (!premium && signal.accessTier === "PREMIUM") {
    redirect("/signals");
  }

  const decimals = signal.symbol.priceDecimals;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold">{signal.symbol.displayName}</h1>
        <span
          className={
            signal.direction === "BUY"
              ? "rounded-full bg-emerald-500/10 px-3 py-1 text-sm font-medium text-emerald-400"
              : "rounded-full bg-red-500/10 px-3 py-1 text-sm font-medium text-red-400"
          }
        >
          {signal.direction}
        </span>
        <span className="rounded-full bg-zinc-500/10 px-3 py-1 text-sm text-zinc-300">
          {signal.status}
        </span>
        <span className="rounded-full bg-sky-500/10 px-3 py-1 text-sm text-sky-300">
          {signal.qualityLabel?.replace("_", " ") ?? "UNSCORED"}
        </span>
      </div>

      <div className="grid gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 sm:grid-cols-3">
        <div>
          <p className="text-sm text-zinc-500">Entry</p>
          <p className="text-lg text-zinc-100">
            {formatPrice(signal.entryPrice, decimals)}
          </p>
        </div>
        <div>
          <p className="text-sm text-zinc-500">Stop Loss</p>
          <p className="text-lg text-red-300">
            {formatPrice(signal.stopLossPrice, decimals)}
          </p>
        </div>
        <div>
          <p className="text-sm text-zinc-500">Take Profit 1</p>
          <p className="text-lg text-emerald-300">
            {formatPrice(signal.tp1Price, decimals)}
          </p>
        </div>
        {signal.tp2Price && (
          <div>
            <p className="text-sm text-zinc-500">Take Profit 2</p>
            <p className="text-lg text-emerald-300">
              {formatPrice(signal.tp2Price, decimals)}
            </p>
          </div>
        )}
        {signal.tp3Price && (
          <div>
            <p className="text-sm text-zinc-500">Take Profit 3</p>
            <p className="text-lg text-emerald-300">
              {formatPrice(signal.tp3Price, decimals)}
            </p>
          </div>
        )}
        <div>
          <p className="text-sm text-zinc-500">Risk / Reward</p>
          <p className="text-lg text-zinc-100">
            1:{Number(signal.riskReward ?? 0).toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-sm text-zinc-500">Risk (pips)</p>
          <p className="text-lg text-zinc-100">
            {Number(signal.riskPips ?? 0).toFixed(1)}
          </p>
        </div>
        <div>
          <p className="text-sm text-zinc-500">Reward (pips)</p>
          <p className="text-lg text-zinc-100">
            {Number(signal.rewardPips ?? 0).toFixed(1)}
          </p>
        </div>
        <div>
          <p className="text-sm text-zinc-500">Timeframe / Session</p>
          <p className="text-lg text-zinc-100">
            {signal.timeframe} • {signal.marketSession?.replace("_", " ")}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
        <h2 className="text-lg font-medium">Technical Analysis</h2>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-zinc-300">
          {signal.analysisMd}
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
        <h2 className="text-lg font-medium">Trade Reasoning</h2>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-zinc-300">
          {signal.reasoningMd}
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
        <h2 className="text-lg font-medium">Status Timeline</h2>
        <ul className="mt-4 space-y-2 text-sm text-zinc-400">
          <li>• Signal created ({signal.createdAt.toISOString().slice(0, 16).replace("T", " ")})</li>
          {signal.updates.map((update) => (
            <li key={update.id}>
              • {update.oldStatus ?? "DRAFT"} → {update.newStatus} (
              {update.createdAt.toISOString().slice(0, 16).replace("T", " ")})
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}