"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/server/db/client";
import { requireAdmin } from "@/server/auth/guards";

export async function setSubscriptionStatus(formData: FormData): Promise<void> {
  await requireAdmin();

  const subscriptionId = formData.get("subscriptionId") as string | null;
  const status = formData.get("status") as string | null;

  if (!subscriptionId || (status !== "ACTIVE" && status !== "CANCELLED"))
    return;

  await prisma.subscription.update({
    where: { id: subscriptionId },
    data: {
      status,
      currentPeriodEndsAt:
        status === "ACTIVE"
          ? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
          : null,
    },
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