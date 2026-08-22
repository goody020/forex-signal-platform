import { requireAdmin } from "@/server/auth/guards";
import { prisma } from "@/server/db/client";
import { computeWeeklyStats } from "@/server/services/weekly-report";
import { sendWeeklyReportAction } from "@/server/actions/reports";

export default async function AdminReportsPage() {
  await requireAdmin();

  const stats = await computeWeeklyStats();
  const recipients = await prisma.user.count({
    where: {
      status: "ACTIVE",
      notificationPreference: { is: { weeklyReport: true } },
    },
  });

  const cards = [
    { label: "Published (7d)", value: stats.published },
    { label: "Closed (7d)", value: stats.closed },
    { label: "Wins", value: stats.wins },
    { label: "Losses", value: stats.losses },
    { label: "Breakeven", value: stats.breakevens },
    { label: "Win Rate", value: `${stats.winRate}%` },
    { label: "Active Now", value: stats.active },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Weekly Report</h1>
        <p className="text-sm text-zinc-500">
          Preview of what members receive. Sends to {recipients} opted-in
          member{recipients === 1 ? "" : "s"}.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 text-center"
          >
            <p className="text-xl font-semibold text-emerald-400">
              {card.value}
            </p>
            <p className="mt-1 text-xs text-zinc-500">{card.label}</p>
          </div>
        ))}
      </div>

      <form action={sendWeeklyReportAction}>
        <button className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-500">
          Send Weekly Report Now
        </button>
      </form>
    </div>
  );
}