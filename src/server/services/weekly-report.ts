import { prisma } from "@/server/db/client";
import { sendEmail } from "./email";

export interface WeeklyStats {
  published: number;
  closed: number;
  wins: number;
  losses: number;
  breakevens: number;
  winRate: number;
  active: number;
}

export async function computeWeeklyStats(): Promise<WeeklyStats> {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const results = await prisma.signalResult.findMany({
    where: { closedAt: { gte: since } },
  });

  const wins = results.filter((r) => r.outcome === "WIN").length;
  const losses = results.filter((r) => r.outcome === "LOSS").length;
  const breakevens = results.filter(
    (r) => r.outcome === "BREAKEVEN"
  ).length;
  const closed = wins + losses + breakevens;

  const published = await prisma.signal.count({
    where: { publishedAt: { gte: since } },
  });

  const active = await prisma.signal.count({
    where: { status: { in: ["ACTIVE", "TP1_HIT", "TP2_HIT"] } },
  });

  const winRate = closed > 0 ? Math.round((wins / closed) * 100) : 0;

  return { published, closed, wins, losses, breakevens, winRate, active };
}

export async function sendWeeklyReports(): Promise<number> {
  const stats = await computeWeeklyStats();
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001";

  const users = await prisma.user.findMany({
    where: {
      status: "ACTIVE",
      notificationPreference: { is: { weeklyReport: true } },
    },
  });

  const html = `
    <h2>Weekly Performance Report</h2>
    <p>Here is the transparent summary of the last 7 days:</p>
    <ul>
      <li>Signals published: <b>${stats.published}</b></li>
      <li>Signals closed: <b>${stats.closed}</b></li>
      <li>Wins: <b>${stats.wins}</b> • Losses: <b>${stats.losses}</b> • Breakeven: <b>${stats.breakevens}</b></li>
      <li>Win rate: <b>${stats.winRate}%</b></li>
      <li>Currently active signals: <b>${stats.active}</b></li>
    </ul>
    <p>We publish losses with the same transparency as wins. Risk management always comes first.</p>
    <p><a href="${base}">View the platform</a></p>
  `;

  for (const user of users) {
    if (!user.email) continue;
    await sendEmail({
      to: user.email,
      subject: "Your weekly performance report",
      html,
    });
  }

  return users.length;
}