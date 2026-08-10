import type { Candle } from "./indicators";

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

const basePrices: Record<string, number> = {
  EURUSD: 1.16,
  GBPUSD: 1.35,
  USDJPY: 150,
  USDCHF: 0.88,
  AUDUSD: 0.65,
  NZDUSD: 0.6,
  USDCAD: 1.35,
  EURJPY: 174,
  GBPJPY: 196,
};

export function getDemoCandles(symbol: string, count = 300): Candle[] {
  const base = basePrices[symbol] ?? 1.2;
  const day = Math.floor(Date.now() / 86400000);
  const rand = mulberry32(hashString(symbol) + day);

  const candles: Candle[] = [];
  let price = base * (0.98 + rand() * 0.04);
  const now = Date.now();
  const hour = 3600000;
  let trend = 0;

  for (let i = 0; i < count; i++) {
    if (i % 40 === 0) trend = (rand() - 0.5) * 0.0015;
    const vol = base * 0.0012;
    const open = price;
    const close = open + trend * base + (rand() - 0.5) * vol;
    const high = Math.max(open, close) + rand() * vol * 0.5;
    const low = Math.min(open, close) - rand() * vol * 0.5;
    candles.push({
      time: now - (count - i) * hour,
      open,
      high,
      low,
      close,
      volume: Math.floor(rand() * 1000),
    });
    price = close;
  }

  return candles;
}