"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/server/db/client";
import { requireAdmin } from "@/server/auth/guards";

export async function updateSignalConfidence(
  formData: FormData
): Promise<void> {
  await requireAdmin();

  const id = formData.get("id") as string | null;
  const value = Number(formData.get("confidence"));

  if (!id || !Number.isFinite(value)) return;

  const confidence = Math.min(10, Math.max(1, Math.round(value)));

  await prisma.signal.update({
    where: { id },
    data: { confidence },
  });

  revalidatePath("/admin/confidence");
  revalidatePath("/signals");
  revalidatePath("/history");
  revalidatePath("/dashboard");
}