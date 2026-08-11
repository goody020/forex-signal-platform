import { requireUser } from "@/server/auth/guards";
import { prisma } from "@/server/db/client";
import { isPremiumUser } from "@/server/services/subscription";
import { requestManualTransfer } from "@/server/actions/billing";
import {
  BANK_DETAILS,
  PREMIUM_PRICE_LABEL,
} from "@/lib/constants/billing";

export default async function UpgradePage() {
  const session = await requireUser();
  const premium = await isPremiumUser(session.user.id, session.user.role);

  const subscription = await prisma.subscription.findFirst({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  const isPending = subscription?.status === "PENDING";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Upgrade</h1>

      {premium ? (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6">
          <p className="text-lg font-medium text-emerald-300">
            You are a Premium member.
          </p>
          {subscription?.currentPeriodEndsAt && (
            <p className="mt-2 text-sm text-emerald-100/80">
              Active until{" "}
              {subscription.currentPeriodEndsAt.toISOString().slice(0, 10)}.
            </p>
          )}
        </div>
      ) : isPending ? (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6">
          <p className="text-lg font-medium text-amber-300">
            Awaiting Admin Approval
          </p>
          <p className="mt-2 text-sm text-amber-100/80">
            We are verifying your transfer. Send your receipt on WhatsApp for
            faster approval.
          </p>
          <a
            href={BANK_DETAILS.whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block rounded-lg border border-amber-500/40 px-4 py-2 text-sm text-amber-200 hover:bg-amber-500/10"
          >
            Send Receipt on WhatsApp
          </a>
        </div>
      ) : (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
          <p className="text-lg font-medium">Premium Plan</p>
          <p className="mt-1 text-2xl font-semibold text-emerald-400">
            {PREMIUM_PRICE_LABEL}
          </p>

          <div className="mt-6 rounded-xl border border-zinc-700 bg-zinc-950/60 p-5">
            <p className="text-sm font-medium text-zinc-300">
              Transfer to this account:
            </p>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-500">Bank:</span>
                <span className="font-semibold text-zinc-100">
                  {BANK_DETAILS.bankName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Account Name:</span>
                <span className="font-semibold text-zinc-100">
                  {BANK_DETAILS.accountName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Account Number:</span>
                <span className="font-mono text-lg font-bold text-emerald-400">
                  {BANK_DETAILS.accountNumber}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-950/40 p-5">
            <p className="text-sm font-medium text-zinc-300">
              Why upgrade? Premium unlocks:
            </p>
            <ul className="mt-3 space-y-2 text-sm text-zinc-400">
              <li>
                • 3+ high-confidence signals every week (confidence starts at
                8/10)
              </li>
              <li>• Full entry, stop loss, and take profit levels</li>
              <li>• Complete analysis and reasoning for every setup</li>
              <li>• Email alerts the moment a signal is published</li>
            </ul>
          </div>
          <form action={requestManualTransfer} className="mt-6">
            <button
              type="submit"
              className="w-full rounded-lg bg-emerald-600 px-5 py-3 text-sm font-medium text-white hover:bg-emerald-500"
            >
              I have transferred the funds
            </button>
          </form>

          <p className="mt-3 text-center text-xs text-zinc-500">
            After transferring, send your receipt on{" "}
            <a
              href={BANK_DETAILS.whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 underline"
            >
              WhatsApp
            </a>{" "}
            for faster approval.
          </p>
        </div>
      )}
    </div>
  );
}