export type UserRole = "USER" | "ADMIN";

export type UserStatus = "ACTIVE" | "SUSPENDED" | "DELETED";

export type SignalDirection = "BUY" | "SELL";

export type SignalStatus =
  | "DRAFT"
  | "PENDING_REVIEW"
  | "SCHEDULED"
  | "ACTIVE"
  | "TP1_HIT"
  | "TP2_HIT"
  | "CLOSED_TP"
  | "CLOSED_SL"
  | "CLOSED_MANUAL"
  | "CANCELLED"
  | "EXPIRED";

export type SignalRiskLevel = "LOW" | "MEDIUM" | "HIGH";

export type SignalTimeframe = "M15" | "M30" | "H1" | "H4" | "D1";

export type MarketSession =
  | "ASIA"
  | "LONDON"
  | "NEW_YORK"
  | "LONDON_NY_OVERLAP"
  | "GLOBAL";

export type QualityLabel =
  | "STRONG_SETUP"
  | "VALID_SETUP"
  | "WEAK_SETUP"
  | "NO_TRADE";

export type SignalResultOutcome =
  | "OPEN"
  | "WIN"
  | "LOSS"
  | "BREAKEVEN"
  | "CANCELLED";

export interface SignalSummary {
  id: string;
  signalCode: string;
  symbol: string;
  direction: SignalDirection;
  timeframe: SignalTimeframe;
  status: SignalStatus;
  entryPrice: number;
  stopLossPrice: number;
  tp1Price: number;
  tp2Price?: number | null;
  tp3Price?: number | null;
  riskReward?: number | null;
  qualityLabel?: QualityLabel | null;
  publishedAt?: string | null;
  closedAt?: string | null;
}

export interface SignalTimeframeUsage {
  timeframe: SignalTimeframe;
  role: "CONTEXT" | "STRUCTURE" | "ENTRY" | "CONFIRMATION";
  note?: string | null;
}

export interface SignalUpdate {
  id: string;
  oldStatus?: SignalStatus | null;
  newStatus: SignalStatus;
  price?: number | null;
  note?: string | null;
  createdAt: string;
}

export interface SignalDetails extends SignalSummary {
  marketSession?: MarketSession | null;
  riskLevel: SignalRiskLevel;
  riskPips?: number | null;
  rewardPips?: number | null;
  analysisMd?: string | null;
  reasoningMd?: string | null;
  timeframes: SignalTimeframeUsage[];
  updates: SignalUpdate[];
}