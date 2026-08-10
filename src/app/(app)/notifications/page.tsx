import { requireUser } from "@/server/auth/guards";
import { prisma } from "@/server/db/client";
import { markAllRead, markRead } from "@/server/actions/notifications";
import Link from "next/link";

export default async function NotificationsPage() {
  const session = await requireUser();

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Notifications</h1>
        <div className="flex gap-2">
          <Link
            href="/settings"
            className="rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
          >
            Preferences
          </Link>
          <form action={markAllRead}>
            <button className="rounded-lg bg-zinc-800 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-700">
              Mark all read
            </button>
          </form>
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
          <p className="text-sm text-zinc-400">No notifications yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={
                notification.readAt
                  ? "rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4"
                  : "rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4"
              }
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-zinc-100">
                    {notification.title}
                  </p>
                  <p className="mt-1 text-sm text-zinc-400">
                    {notification.body}
                  </p>
                  <p className="mt-2 text-xs text-zinc-600">
                    {notification.createdAt
                      .toISOString()
                      .slice(0, 16)
                      .replace("T", " ")}{" "}
                    UTC
                  </p>
                </div>
                {!notification.readAt && (
                  <form action={markRead}>
                    <input type="hidden" name="id" value={notification.id} />
                    <button className="rounded-lg border border-zinc-700 px-2 py-1 text-xs text-zinc-400 hover:bg-zinc-800">
                      Mark read
                    </button>
                  </form>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}