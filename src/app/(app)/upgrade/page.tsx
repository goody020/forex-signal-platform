import { requireUser } from "@/server/auth/guards";
import { prisma } from "@/server/db/client";
import { isPremiumUser } from "@/server/services/subscription";
import { requestPremium } from "@/server/actions/admin";

export default async function UpgradePage() {
  const session = await requireUser();
  const premium = await isPremiumUser(session.user.id, session.user.role);

  const subscription = await prisma.subscription.findFirst({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Upgrade</h1>

      {premium ? (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6">
          <p className="text-lg font-medium text-emerald-300">
            You are a Premium member.
          </p>
          <p className="mt-2 text-sm text-emerald-100/80">
            All signals, full analysis, and complete history are unlocked.
          </p>
        </div>
      ) : subscription?.status === "PENDING" ? (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6">
          <p className="text-lg font-medium text-amber-300">
            Your Premium request is awaiting approval.
          </p>
          <p className="mt-2 text-sm text-amber-100/80">
            You will get full access as soon as your subscription is approved.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
          <p className="text-lg font-medium">Premium Plan</p>
          <ul className="mt-4 space-y-2 text-sm text-zinc-300">
            <li>• All weekly signals (free members see previews only)</li>
            <li>• Full entry, stop loss, and take profit levels</li>
            <li>• Complete technical analysis and reasoning</li>
            <li>• Full trade history and performance stats</li>
          </ul>
          <form action={requestPremium} className="mt-6">
            <button
              type="submit"
              className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-500"
            >
              Request Premium
            </button>
          </form>
          <p className="mt-3 text-xs text-zinc-500">
            Payment options arrive soon. Requests are approved manually for
            now.
          </p>
        </div>
      )}
    </div>
  );
}