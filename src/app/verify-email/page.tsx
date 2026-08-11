import { verify } from "@node-rs/argon2";
import { prisma } from "@/server/db/client";

function Shell({ message, ok }: { message: string; ok: boolean }) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div
        className={
          ok
            ? "w-full max-w-sm rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center text-emerald-300"
            : "w-full max-w-sm rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-center text-red-300"
        }
      >
        <p className="text-sm">{message}</p>
        <a href="/login" className="mt-4 inline-block text-sm underline">
          Go to sign in
        </a>
      </div>
    </main>
  );
}

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const token = sp.token ?? "";
  const email = (sp.email ?? "").toLowerCase().trim();

  if (!token || !email) {
    return <Shell message="Invalid verification link." ok={false} />;
  }

  const record = await prisma.verificationToken.findFirst({
    where: { identifier: `verify:${email}` },
  });

  if (!record || record.expires < new Date()) {
    return (
      <Shell message="This link expired or was already used." ok={false} />
    );
  }

  const ok = await verify(record.token, token);
  if (!ok) return <Shell message="Invalid verification link." ok={false} />;

  await prisma.user.update({
    where: { email },
    data: { emailVerified: new Date() },
  });

  await prisma.verificationToken.deleteMany({
    where: { identifier: `verify:${email}` },
  });

  return <Shell message="Email verified. Thank you!" ok={true} />;
}