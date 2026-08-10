"use client";

import { useActionState } from "react";
import {
  requestPasswordReset,
  type AuthMessageState,
} from "@/server/actions/auth";

export default function ForgotPasswordPage() {
  const [state, formAction, pending] = useActionState<
    AuthMessageState,
    FormData
  >(requestPasswordReset, null);

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
        <h1 className="text-xl font-semibold">Forgot Password</h1>

        {state?.message && (
          <p className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
            {state.message}
          </p>
        )}
        {state?.error && (
          <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {state.error}
          </p>
        )}

        <form action={formAction} className="mt-6 space-y-4">
          <div>
            <label className="text-sm text-zinc-300">Email</label>
            <input
              type="email"
              name="email"
              required
              className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-emerald-500"
            />
          </div>
          <button
            disabled={pending}
            className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
          >
            {pending ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-zinc-400">
          <a href="/login" className="text-emerald-400">
            Back to sign in
          </a>
        </p>
      </div>
    </main>
  );
}