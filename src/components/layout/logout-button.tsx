"use client";

import { signOut } from "next-auth/react";

export function LogoutButton({ compact = false }: { compact?: boolean }) {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className={
        compact
          ? "rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800"
          : "w-full rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
      }
    >
      {compact ? "Logout" : "Sign Out"}
    </button>
  );
}