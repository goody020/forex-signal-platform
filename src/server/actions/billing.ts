"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/server/db/client";
import { requireUser } from "@/server/auth/guards";

export async function requestManualTransfer(): Promise<void> {
  const session = await requireUser();
  if (session.user.role === "ADMIN") return;

  const existing = await prisma.subscription.findFirst({
    where: {
      userId: session.user.id,
      status: { in: ["ACTIVE", "PENDING"] },
    },
  });

  if (existing) return;

  await prisma.subscription.create({
    data: {
      userId: session.user.id,
      plan: "PREMIUM",
      status: "PENDING",
    },
  });

  revalidatePath("/upgrade");
  revalidatePath("/admin/users");
}