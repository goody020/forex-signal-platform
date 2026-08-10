import Link from "next/link";
import type { Session } from "next-auth";
import { LogoutButton } from "@/components/layout/logout-button";

const adminNav = [
  { href: "/admin", label: "Admin Overview" },
  { href: "/admin/signals", label: "Manage Signals" },
  { href: "/admin/signals/new", label: "New Signal" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/content", label: "Content" },
    { href: "/admin/engine", label: "Engine" },
  { href: "/dashboard", label: "Member View" },
];

export function AdminShell({
  session,
  children,
}: {
  session: Session;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r border-zinc-800 bg-zinc-900/60 p-4 md:flex">
        <p className="px-2 text-sm font-semibold tracking-widest text-amber-400">
          ADMIN PANEL
        </p>

        <nav className="mt-6 space-y-1">
          {adminNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-lg px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto space-y-2">
          <p className="truncate px-2 text-xs text-zinc-500">
            {session.user.email}
          </p>
          <LogoutButton />
        </div>
      </aside>

      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-800 bg-zinc-950/90 px-4 py-3 backdrop-blur md:hidden">
        <p className="text-sm font-semibold tracking-widest text-amber-400">
          ADMIN PANEL
        </p>
        <LogoutButton compact />
      </header>

      <main className="px-4 py-6 pb-24 md:py-8 md:pb-8 md:pl-64 md:pr-8">
        {children}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-10 flex border-t border-zinc-800 bg-zinc-950/95 backdrop-blur md:hidden">
        {adminNav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex-1 py-3 text-center text-[10px] text-zinc-400 hover:text-white"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}