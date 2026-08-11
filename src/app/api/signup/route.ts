import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { z } from "zod";
import { hash } from "@node-rs/argon2";
import { prisma } from "@/server/db/client";
import { sendEmail } from "@/server/services/email";

const signupSchema = z.object({
  name: z.string().min(2).max(60),
  email: z.string().email().max(255),
  password: z.string().min(8).max(100),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input. Password must be at least 8 characters." },
      { status: 400 }
    );
  }

  const { name, email, password } = parsed.data;
  const normalizedEmail = email.toLowerCase().trim();

  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existing) {
    return NextResponse.json(
      { error: "An account with this email already exists." },
      { status: 409 }
    );
  }

  const passwordHash = await hash(password);

  const user = await prisma.user.create({
    data: {
      email: normalizedEmail,
      passwordHash,
      role: "USER",
      status: "ACTIVE",
      profile: {
        create: {
          displayName: name.trim(),
          timezone: "UTC",
          baseCurrency: "USD",
          defaultRiskPercent: 1,
        },
      },
      notificationPreference: {
        create: {},
      },
    },
  });

  try {
    const token = randomUUID();
    const hashedToken = await hash(token);

    await prisma.verificationToken.create({
      data: {
        identifier: `verify:${normalizedEmail}`,
        token: hashedToken,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001";
    const link = `${base}/verify-email?token=${token}&email=${encodeURIComponent(normalizedEmail)}`;

    await sendEmail({
      to: normalizedEmail,
      subject: "Verify your email",
      html: `<p>Welcome to Forex Signal Platform!</p><p><a href="${link}">Click here to verify your email address</a></p><p>This link expires in 24 hours.</p>`,
    });
  } catch {
    // never block signup because of email issues
  }

  void user;
  return NextResponse.json({ ok: true });
}