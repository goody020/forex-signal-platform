import { requireAdmin } from "@/server/auth/guards";
import { prisma } from "@/server/db/client";
import {
  setSubscriptionStatus,
  setUserStatus,
} from "@/server/actions/admin";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requireAdmin();
  const sp = await searchParams;
  const query = (sp.q ?? "").trim();

  const users = await prisma.user.findMany({
    where: query
      ? {
          OR: [
            { email: { contains: query, mode: "insensitive" } },
            {
              profile: {
                displayName: { contains: query, mode: "insensitive" },
              },
            },
          ],
        }
      : undefined,
    include: {
      profile: true,
      subscriptions: { orderBy: { createdAt: "desc" } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const now = new Date();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Users</h1>
        <form className="flex gap-2">
          <input
            name="q"
            defaultValue={query}
            placeholder="Search email or name"
            className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-emerald-500"
          />
          <button className="rounded-lg bg-zinc-800 px-4 py-2 text-sm hover:bg-zinc-700">
            Search
          </button>
        </form>
      </div>

      <div className="space-y-4">
        {users.map((user) => {
          const latestSub = user.subscriptions[0];
          const premiumActive =
            latestSub?.status === "ACTIVE" &&
            (!latestSub.currentPeriodEndsAt ||
              latestSub.currentPeriodEndsAt > now);

          return (
            <div
              key={user.id}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5"
            >
              <div className="flex flex-wrap items-center gap-3">
                <p className="font-medium">
                  {user.profile?.displayName ?? "Member"}
                </p>
                <p className="text-sm text-zinc-500">{user.email}</p>
                <span className="rounded-full bg-zinc-500/10 px-3 py-1 text-xs text-zinc-300">
                  {user.role}
                </span>
                <span
                  className={
                    user.status === "ACTIVE"
                      ? "rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400"
                      : "rounded-full bg-red-500/10 px-3 py-1 text-xs text-red-400"
                  }
                >
                  {user.status}
                </span>
                {premiumActive && (
                  <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">
                    PREMIUM
                    {latestSub?.currentPeriodEndsAt
                      ? ` until ${latestSub.currentPeriodEndsAt
                          .toISOString()
                          .slice(0, 10)}`
                      : ""}
                  </span>
                )}
                {latestSub?.status === "PENDING" && (
                  <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs text-amber-300">
                    PREMIUM: PENDING
                  </span>
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {latestSub?.status === "PENDING" && (
                  <form action={setSubscriptionStatus}>
                    <input type="hidden" name="subscriptionId" value={latestSub.id} />
                    <input type="hidden" name="status" value="ACTIVE" />
                    <button className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs text-white hover:bg-emerald-500">
                      Approve Premium (14 days)
                    </button>
                  </form>
                )}

                {premiumActive && (
                  <form action={setSubscriptionStatus}>
                    <input type="hidden" name="subscriptionId" value={latestSub.id} />
                    <input type="hidden" name="status" value="CANCELLED" />
                    <button className="rounded-lg bg-red-600/80 px-3 py-1.5 text-xs text-white hover:bg-red-600">
                      End Premium
                    </button>
                  </form>
                )}

                {user.role !== "ADMIN" &&
                  (user.status === "ACTIVE" ? (
                    <form action={setUserStatus}>
                      <input type="hidden" name="userId" value={user.id} />
                      <input type="hidden" name="status" value="SUSPENDED" />
                      <button className="rounded-lg bg-zinc-800 px-3 py-1.5 text-xs text-zinc-200 hover:bg-zinc-700">
                        Suspend User
                      </button>
                    </form>
                  ) : (
                    <form action={setUserStatus}>
                      <input type="hidden" name="userId" value={user.id} />
                      <input type="hidden" name="status" value="ACTIVE" />
                      <button className="rounded-lg bg-zinc-800 px-3 py-1.5 text-xs text-zinc-200 hover:bg-zinc-700">
                        Reactivate User
                      </button>
                    </form>
                  ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}