"use server";

import { randomUUID } from "crypto";
import { hash, verify } from "@node-rs/argon2";
import { prisma } from "@/server/db/client";

export type AuthMessageState = { message?: string; error?: string } | null;

export async function requestPasswordReset(
  _prev: AuthMessageState,
  formData: FormData
): Promise<AuthMessageState> {
  const email = (formData.get("email") as string | null)?.toLowerCase().trim();
  if (!email) return { error: "Enter your email." };

  const user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    const token = randomUUID();
    const hashed = await hash(token);

    await prisma.verificationToken.deleteMany({
      where: { identifier: `reset:${email}` },
    });

    await prisma.verificationToken.create({
      data: {
        identifier: `reset:${email}`,
        token: hashed,
        expires: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001";
    console.log(
      `[CONSOLE EMAIL] Password reset for ${email}:\n${base}/reset-password?token=${token}&email=${encodeURIComponent(email)}`
    );
  }

  return {
    message:
      "If that account exists, a reset link was created. In development it appears in the terminal running pnpm dev.",
  };
}

export async function resetPassword(
  _prev: AuthMessageState,
  formData: FormData
): Promise<AuthMessageState> {
  const token = formData.get("token") as string | null;
  const email = (formData.get("email") as string | null)?.toLowerCase().trim();
  const password = formData.get("password") as string | null;

  if (!token || !email || !password || password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const record = await prisma.verificationToken.findFirst({
    where: { identifier: `reset:${email}` },
  });

  if (!record || record.expires < new Date()) {
    return { error: "Invalid or expired reset link." };
  }

  const tokenOk = await verify(record.token, token);
  if (!tokenOk) return { error: "Invalid or expired reset link." };

  const passwordHash = await hash(password);
  await prisma.user.update({ where: { email }, data: { passwordHash } });
  await prisma.verificationToken.deleteMany({
    where: { identifier: `reset:${email}` },
  });

  return { message: "Password updated. You can now sign in." };
}