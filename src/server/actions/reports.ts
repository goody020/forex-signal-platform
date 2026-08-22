"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/server/auth/guards";
import { sendWeeklyReports } from "@/server/services/weekly-report";

export async function sendWeeklyReportAction(): Promise<void> {
  await requireAdmin();
  await sendWeeklyReports();
  revalidatePath("/admin/reports");
}