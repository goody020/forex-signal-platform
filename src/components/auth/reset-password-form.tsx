"use client";

import { useActionState } from "react";
import { resetPassword, type AuthMessageState } from "@/server/actions/auth";

export function ResetPasswordForm({
  token,
  email,
}: {
  token: string;
  email: string;
}) {
  const [state, formAction, pending] = useActionState<
    AuthMessageState,
    FormData
  >(resetPassword, null);

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <input type="hidden" name="token" value={token} />
      <input type="hidden" name="email" value={email} />

      {state?.message && (
        <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
          {state.message}{" "}
          <a href="/login" className="underline">
            Sign in
          </a>
        </p>
      )}
      {state?.error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {state.error}
        </p>
      )}

      <div>
        <label className="text-sm text-zinc-300">New Password</label>
        <input
          type="password"
          name="password"
          required
          className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-emerald-500"
        />
      </div>
      <button
        disabled={pending}
        className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
      >
        {pending ? "Updating..." : "Update Password"}
      </button>
    </form>
  );
}