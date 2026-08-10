import Link from "next/link";
import type { Session } from "next-auth";
import { LogoutButton } from "@/components/layout/logout-button";
import { prisma } from "@/server/db/client";

export async function AppShell({
  session,
  children,
}: {
  session: Session;
  children: React.ReactNode;
}) {
  const isAdmin = session.user.role === "ADMIN";

  const unread = await prisma.notification.count({
    where: { userId: session.user.id, readAt: null },
  });

    const navItems = [
    { href: "/dashboard", label: "Dashboard", badge: 0 },
    { href: "/signals", label: "Signals", badge: 0 },
    { href: "/history", label: "History", badge: 0 },
    { href: "/education", label: "Learn", badge: 0 },
    { href: "/notifications", label: "Alerts", badge: unread },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r border-zinc-800 bg-zinc-900/60 p-4 md:flex">
        <p className="px-2 text-sm font-semibold tracking-widest text-emerald-400">
          FOREX SIGNALS
        </p>

        <nav className="mt-6 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white"
            >
              {item.label}
              {item.badge > 0 && (
                <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-300">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
          {isAdmin && (
            <Link
              href="/admin"
              className="block rounded-lg px-3 py-2 text-sm font-medium text-amber-300 hover:bg-zinc-800 hover:text-amber-200"
            >
              Admin Panel
            </Link>
          )}
          {!isAdmin && (
            <Link
              href="/upgrade"
              className="block rounded-lg px-3 py-2 text-sm font-medium text-emerald-300 hover:bg-zinc-800 hover:text-emerald-200"
            >
              Upgrade
            </Link>
          )}
        </nav>

        <div className="mt-auto space-y-2">
          <Link
            href="/settings"
            className="block px-2 text-xs text-zinc-500 hover:text-zinc-300"
          >
            Settings
          </Link>
          <p className="truncate px-2 text-xs text-zinc-500">
            {session.user.email}
          </p>
          <LogoutButton />
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-800 bg-zinc-950/90 px-4 py-3 backdrop-blur md:hidden">
        <p className="text-sm font-semibold tracking-widest text-emerald-400">
          FOREX SIGNALS
        </p>
        <LogoutButton compact />
      </header>

      {/* Main content */}
      <main className="px-4 py-6 pb-24 md:py-8 md:pb-8 md:pl-64 md:pr-8">
        {children}
      </main>

      {/* Mobile bottom navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-10 flex border-t border-zinc-800 bg-zinc-950/95 backdrop-blur md:hidden">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex-1 py-3 text-center text-xs text-zinc-400 hover:text-white"
          >
            {item.label}
            {item.badge > 0 && (
              <span className="ml-1 rounded-full bg-emerald-500/20 px-1.5 text-[10px] text-emerald-300">
                {item.badge}
              </span>
            )}
          </Link>
        ))}
        {isAdmin && (
          <Link
            href="/admin"
            className="flex-1 py-3 text-center text-xs text-amber-300 hover:text-amber-200"
          >
            Admin
          </Link>
        )}
        {!isAdmin && (
          <Link
            href="/upgrade"
            className="flex-1 py-3 text-center text-xs text-emerald-300 hover:text-emerald-200"
          >
            Upgrade
          </Link>
        )}
      </nav>
    </div>
  );
}