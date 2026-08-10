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
  const q = sp.q ?? "";

  const users = await prisma.user.findMany({
    where: q
      ? {
          OR: [
            { email: { contains: q, mode: "insensitive" } },
            { profile: { displayName: { contains: q, mode: "insensitive" } } },
          ],
        }
      : undefined,
    include: { profile: true, subscriptions: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Users</h1>

      <form method="GET" className="flex gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search by email or name"
          className="w-full max-w-sm rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-emerald-500"
        />
        <button
          type="submit"
          className="rounded-lg bg-zinc-800 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-700"
        >
          Search
        </button>
      </form>

      <div className="space-y-4">
        {users.map((user) => {
          const latestSub = user.subscriptions[0];
          return (
            <div
              key={user.id}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5"
            >
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-lg font-semibold">{user.email}</p>
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
                {latestSub && (
                  <span className="rounded-full bg-sky-500/10 px-3 py-1 text-xs text-sky-300">
                    {latestSub.plan}: {latestSub.status}
                  </span>
                )}
              </div>

              <p className="mt-2 text-sm text-zinc-500">
                {user.profile?.displayName ?? "No display name"}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {latestSub?.status === "PENDING" && (
                  <>
                    <form action={setSubscriptionStatus}>
                      <input type="hidden" name="subscriptionId" value={latestSub.id} />
                      <input type="hidden" name="status" value="ACTIVE" />
                      <button className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs text-white hover:bg-emerald-500">
                        Approve Premium
                      </button>
                    </form>
                    <form action={setSubscriptionStatus}>
                      <input type="hidden" name="subscriptionId" value={latestSub.id} />
                      <input type="hidden" name="status" value="CANCELLED" />
                      <button className="rounded-lg bg-zinc-800 px-3 py-1.5 text-xs text-zinc-200 hover:bg-zinc-700">
                        Reject
                      </button>
                    </form>
                  </>
                )}

                {user.role !== "ADMIN" &&
                  (user.status === "ACTIVE" ? (
                    <form action={setUserStatus}>
                      <input type="hidden" name="userId" value={user.id} />
                      <input type="hidden" name="status" value="SUSPENDED" />
                      <button className="rounded-lg border border-red-500/40 px-3 py-1.5 text-xs text-red-300 hover:bg-red-500/10">
                        Suspend
                      </button>
                    </form>
                  ) : (
                    <form action={setUserStatus}>
                      <input type="hidden" name="userId" value={user.id} />
                      <input type="hidden" name="status" value="ACTIVE" />
                      <button className="rounded-lg border border-emerald-500/40 px-3 py-1.5 text-xs text-emerald-300 hover:bg-emerald-500/10">
                        Reactivate
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