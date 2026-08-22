import { NextResponse } from "next/server";
import { sendWeeklyReports } from "@/server/services/weekly-report";

export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sent = await sendWeeklyReports();
  return NextResponse.json({ ok: true, sent });
}