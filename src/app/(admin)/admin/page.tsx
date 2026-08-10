import Link from "next/link";
import { requireAdmin } from "@/server/auth/guards";
import { prisma } from "@/server/db/client";

export default async function AdminOverviewPage() {
  await requireAdmin();

  const [totalSignals, activeSignals, totalUsers, pendingSubscriptions] =
    await Promise.all([
      prisma.signal.count(),
      prisma.signal.count({
        where: { status: { in: ["ACTIVE", "TP1_HIT", "TP2_HIT"] } },
      }),
      prisma.user.count(),
      prisma.subscription.count({ where: { status: "PENDING" } }),
    ]);

  const quickLinks = [
    { href: "/admin/signals/new", label: "+ New Signal" },
    { href: "/admin/signals", label: "Manage Signals" },
    { href: "/admin/users", label: "Users & Approvals" },
    { href: "/admin/engine", label: "Signal Engine" },
    { href: "/admin/content", label: "Content" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Admin Overview</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
          <p className="text-sm text-zinc-500">Total Signals</p>
          <p className="mt-1 text-2xl font-semibold">{totalSignals}</p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
          <p className="text-sm text-zinc-500">Active Signals</p>
          <p className="mt-1 text-2xl font-semibold text-emerald-400">
            {activeSignals}
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
          <p className="text-sm text-zinc-500">Members</p>
          <p className="mt-1 text-2xl font-semibold">{totalUsers}</p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
          <p className="text-sm text-zinc-500">Pending Approvals</p>
          <p className="mt-1 text-2xl font-semibold text-amber-300">
            {pendingSubscriptions}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
        <h2 className="text-lg font-medium">Quick Actions</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-800"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}