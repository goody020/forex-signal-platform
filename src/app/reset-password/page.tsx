import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const token = sp.token ?? "";
  const email = sp.email ?? "";

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
        <h1 className="text-xl font-semibold">Reset Password</h1>
        {!token || !email ? (
          <p className="mt-4 text-sm text-red-300">
            Invalid reset link. Request a new one.
          </p>
        ) : (
          <ResetPasswordForm token={token} email={email} />
        )}
      </div>
    </main>
  );
}