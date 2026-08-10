import { prisma } from "@/server/db/client";
import { defaultSignalEngineSettings } from "@/server/constants/signal-engine";
import type { SignalEngineSettings } from "@/server/constants/signal-engine";
import { getDemoCandles } from "../market-data/demo-provider";
import {
  atr,
  ema,
  rsi,
  swingPoints,
  type Candle,
} from "../market-data/indicators";

export interface EngineCandidateResult {
  symbolId: number;
  direction: "BUY" | "SELL";
  entry: number;
  stopLoss: number;
  tp1: number;
  tp2: number;
  qualityScore: number;
  qualityLabel: "STRONG_SETUP" | "VALID_SETUP" | "WEAK_SETUP";
  factors: Record<string, number>;
  rejectionReasons: string[];
  analysis: {
    close: number;
    ema50: number;
    ema200: number;
    rsi14: number;
    atr14: number;
    structure: string;
    supports: number[];
    resistances: number[];
  };
}

export async function loadEngineSettings(): Promise<SignalEngineSettings> {
  const setting = await prisma.systemSetting.findUnique({
    where: { key: "signal_engine" },
  });
  return (
    (setting?.value as unknown as SignalEngineSettings) ??
    defaultSignalEngineSettings
  );
}

export function analyzeSymbol(symbolId: number, symbolCode: string): EngineCandidateResult {
  const settingsSync = defaultSignalEngineSettings; // weights applied by caller via returned factors
  const candles = getDemoCandles(symbolCode, 300);
  const closes = candles.map((c) => c.close);

  const ema50arr = ema(closes, 50);
  const ema200arr = ema(closes, 200);
  const ema50 = ema50arr[ema50arr.length - 1];
  const ema200 = ema200arr[ema200arr.length - 1];
  const close = closes[closes.length - 1];
  const rsi14 = rsi(closes, 14);
  const atr14 = atr(candles, 14);
  const { highs, lows } = swingPoints(candles, 5);

  const direction: "BUY" | "SELL" = close > ema200 ? "BUY" : "SELL";
  const bullishTrend = ema50 > ema200;

  // --- factor scores (0..1) ---
  const trend =
    (direction === "BUY") === bullishTrend &&
    (direction === "BUY" ? close > ema50 : close < ema50)
      ? 1
      : 0.4;

  const lastLows = lows.slice(-2);
  const lastHighs = highs.slice(-2);
  let structure = 0.5;
  if (direction === "BUY" && lastLows.length === 2 && lastLows[1] > lastLows[0])
    structure = 1;
  if (direction === "SELL" && lastHighs.length === 2 && lastHighs[1] < lastHighs[0])
    structure = 1;

  const supports = lows.filter((l) => l < close);
  const resistances = highs.filter((h) => h > close);
  const nearestSupport = supports.length ? Math.max(...supports) : close - atr14 * 2;
  const nearestResistance = resistances.length ? Math.min(...resistances) : close + atr14 * 2;

  const srDistance =
    direction === "BUY" ? close - nearestSupport : nearestResistance - close;
  const sr =
    srDistance > 0.3 * atr14 && srDistance < 1.5 * atr14 ? 1 : 0.5;

  let momentum = 0.5;
  if (direction === "BUY") {
    if (rsi14 >= 50 && rsi14 <= 70) momentum = 1;
    else if (rsi14 > 75) momentum = 0.3;
    else if (rsi14 >= 45) momentum = 0.6;
  } else {
    if (rsi14 <= 50 && rsi14 >= 30) momentum = 1;
    else if (rsi14 < 25) momentum = 0.3;
    else if (rsi14 <= 55) momentum = 0.6;
  }

  const last = candles[candles.length - 1];
  const body = Math.abs(last.close - last.open);
  const range = Math.max(last.high - last.low, 1e-9);
  const dirMatch = (last.close > last.open) === (direction === "BUY");
  const priceAction = dirMatch && body / range > 0.5 ? 1 : 0.5;

  const entry = close;
  const stopLoss =
    direction === "BUY"
      ? nearestSupport - 0.2 * atr14
      : nearestResistance + 0.2 * atr14;
  const risk = Math.abs(entry - stopLoss);
  const rrScore = risk > 0.4 * atr14 && risk < 2.5 * atr14 ? 1 : 0.5;

  const tp1 = direction === "BUY" ? entry + 1.5 * risk : entry - 1.5 * risk;
  const tp2 = direction === "BUY" ? entry + 2.5 * risk : entry - 2.5 * risk;

  void settingsSync;

  return {
    symbolId,
    direction,
    entry,
    stopLoss,
    tp1,
    tp2,
    qualityScore: 0,
    qualityLabel: "WEAK_SETUP",
    factors: {
      trendConfirmation: trend,
      marketStructure: structure,
      supportResistance: sr,
      momentum,
      priceAction,
      riskReward: rrScore,
    },
    rejectionReasons: [],
    analysis: {
      close,
      ema50,
      ema200,
      rsi14,
      atr14,
      structure:
        structure === 1
          ? direction === "BUY"
            ? "Higher lows (bullish)"
            : "Lower highs (bearish)"
          : "Mixed structure",
      supports: supports.slice(-3),
      resistances: resistances.slice(-3),
    },
  };
}

export function scoreCandidate(
  result: EngineCandidateResult,
  settings: SignalEngineSettings
): EngineCandidateResult {
  const w = settings.weights;
  const f = result.factors;

  const score = Math.round(
    f.trendConfirmation * w.trendConfirmation +
      f.marketStructure * w.marketStructure +
      f.supportResistance * w.supportResistance +
      f.momentum * w.momentum +
      f.priceAction * w.priceAction +
      f.riskReward * w.riskReward
  );

  const label =
    score >= settings.labels.strongSetup
      ? "STRONG_SETUP"
      : score >= settings.labels.validSetup
        ? "VALID_SETUP"
        : "WEAK_SETUP";

  const reasons: string[] = [];
  if (score < settings.minimumQualityScore)
    reasons.push(`Quality ${score} below minimum ${settings.minimumQualityScore}`);
  if (1.5 < settings.minimumRiskReward)
    reasons.push(`Fixed 1.5R below minimum ${settings.minimumRiskReward}`);
  if (result.analysis.atr14 > result.analysis.close * 0.004)
    reasons.push("Volatility too high");

  return { ...result, qualityScore: score, qualityLabel: label, rejectionReasons: reasons };
}

export function aggregateH4(candles: Candle[]): Candle[] {
  const out: Candle[] = [];
  for (let i = 0; i + 3 < candles.length; i += 4) {
    const chunk = candles.slice(i, i + 4);
    out.push({
      time: chunk[0].time,
      open: chunk[0].open,
      close: chunk[3].close,
      high: Math.max(...chunk.map((c) => c.high)),
      low: Math.min(...chunk.map((c) => c.low)),
      volume: 0,
    });
  }
  return out;
}