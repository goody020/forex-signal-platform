import { requireUser } from "@/server/auth/guards";
import { prisma } from "@/server/db/client";
import { isPremiumUser } from "@/server/services/subscription";
import { SignalCard } from "@/components/signals/signal-card";
import { LockedSignalCard } from "@/components/signals/locked-signal-card";
import type { SignalStatus } from "@prisma/client";

const publishedStatuses: SignalStatus[] = [
  "ACTIVE",
  "TP1_HIT",
  "TP2_HIT",
  "CLOSED_TP",
  "CLOSED_SL",
];

export default async function SignalsPage() {
  const session = await requireUser();
  const premium = await isPremiumUser(session.user.id, session.user.role);

  const signals = await prisma.signal.findMany({
    where: { status: { in: publishedStatuses } },
    include: { symbol: true },
    orderBy: { publishedAt: "desc" },
  });

  const visible = signals.filter(
    (signal) => premium || signal.accessTier === "FREE"
  );
  const locked = signals.filter(
    (signal) => !premium && signal.accessTier === "PREMIUM"
  );

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Signals</h1>
        <p className="text-sm text-zinc-500">
          {premium
            ? "Premium member — all signals unlocked."
            : "Free plan — premium setups are locked."}
        </p>
      </div>

      {signals.length === 0 ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
          <p className="text-sm text-zinc-400">
            No high-quality trading opportunities are available right now.
          </p>
          <p className="mt-2 text-sm text-zinc-500">
            Signals appear here when they meet the platform criteria.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {visible.map((signal) => (
            <SignalCard key={signal.id} signal={signal} />
          ))}
          {locked.map((signal) => (
            <LockedSignalCard key={signal.id} signal={signal} />
          ))}
        </div>
      )}
    </div>
  );
}