"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/server/db/client";
import { requireAdmin, requireUser } from "@/server/auth/guards";

export async function requestPremium(): Promise<void> {
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
}

export async function setSubscriptionStatus(formData: FormData): Promise<void> {
  await requireAdmin();

  const subscriptionId = formData.get("subscriptionId") as string | null;
  const status = formData.get("status") as string | null;

  if (!subscriptionId || (status !== "ACTIVE" && status !== "CANCELLED")) return;

  await prisma.subscription.update({
    where: { id: subscriptionId },
    data: { status },
  });

  revalidatePath("/admin/users");
  revalidatePath("/upgrade");
  revalidatePath("/signals");
}

export async function setUserStatus(formData: FormData): Promise<void> {
  await requireAdmin();

  const userId = formData.get("userId") as string | null;
  const status = formData.get("status") as "ACTIVE" | "SUSPENDED" | null;

  if (!userId || !status) return;

  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target || target.role === "ADMIN") return;

  await prisma.user.update({
    where: { id: userId },
    data: { status },
  });

  revalidatePath("/admin/users");
}