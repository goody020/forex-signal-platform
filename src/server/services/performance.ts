export interface PerformanceStats {
  decided: number;
  wins: number;
  losses: number;
  breakevens: number;
  cancelled: number;
  winRate: number;
  totalR: number;
  avgR: number;
}

export function computeStats(
  rows: { outcome: string; realizedR: unknown }[]
): PerformanceStats {
  const wins = rows.filter((r) => r.outcome === "WIN").length;
  const losses = rows.filter((r) => r.outcome === "LOSS").length;
  const breakevens = rows.filter((r) => r.outcome === "BREAKEVEN").length;
  const cancelled = rows.filter((r) => r.outcome === "CANCELLED").length;

  const decided = wins + losses + breakevens;
  const totalR = rows.reduce((sum, r) => sum + Number(r.realizedR ?? 0), 0);
  const winRate = decided > 0 ? (wins / decided) * 100 : 0;
  const avgR = decided > 0 ? totalR / decided : 0;

  return {
    decided,
    wins,
    losses,
    breakevens,
    cancelled,
    winRate,
    totalR,
    avgR,
  };
}