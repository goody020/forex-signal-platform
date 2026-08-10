import { NextResponse } from "next/server";
import { z } from "zod";
import { hash } from "@node-rs/argon2";
import { prisma } from "@/server/db/client";

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

  await prisma.user.create({
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

  return NextResponse.json({ ok: true });
}