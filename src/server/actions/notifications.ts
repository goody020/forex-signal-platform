"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/server/db/client";
import { requireUser } from "@/server/auth/guards";

export async function markRead(formData: FormData): Promise<void> {
  const session = await requireUser();
  const id = formData.get("id") as string | null;
  if (!id) return;

  await prisma.notification.updateMany({
    where: { id, userId: session.user.id },
    data: { readAt: new Date() },
  });

  revalidatePath("/notifications");
}

export async function markAllRead(): Promise<void> {
  const session = await requireUser();

  await prisma.notification.updateMany({
    where: { userId: session.user.id, readAt: null },
    data: { readAt: new Date() },
  });

  revalidatePath("/notifications");
}

export async function updatePreferences(formData: FormData): Promise<void> {
  const session = await requireUser();

  const inAppNewSignal = formData.get("inAppNewSignal") === "on";
  const inAppSignalStatus = formData.get("inAppSignalStatus") === "on";
  const weeklyReport = formData.get("weeklyReport") === "on";

  await prisma.userNotificationPreference.upsert({
    where: { userId: session.user.id },
    update: { inAppNewSignal, inAppSignalStatus, weeklyReport },
    create: {
      userId: session.user.id,
      inAppNewSignal,
      inAppSignalStatus,
      weeklyReport,
    },
  });

  revalidatePath("/settings");
}