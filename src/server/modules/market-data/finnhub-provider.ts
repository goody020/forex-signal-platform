import type { Candle } from "./indicators";

const FINNHUB_BASE = "https://finnhub.io/api/v1";

function toFinnhubSymbol(code: string): string {
  const base = code.slice(0, 3);
  const quote = code.slice(3);
  return `OANDA:${base}_${quote}`;
}

export async function getFinnhubCandles(
  symbolCode: string,
  count = 300
): Promise<Candle[]> {
  const key = process.env.FINNHUB_API_KEY;
  if (!key) throw new Error("FINNHUB_API_KEY is not set");

  const to = Math.floor(Date.now() / 1000);
  const from = to - (count + 2) * 3600;

  const url =
    `${FINNHUB_BASE}/forex/candle` +
    `?symbol=${encodeURIComponent(toFinnhubSymbol(symbolCode))}` +
    `&resolution=60&from=${from}&to=${to}&token=${key}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Finnhub responded ${res.status}`);

  const data = await res.json();
  if (data.s !== "ok" || !Array.isArray(data.c)) {
    throw new Error("Finnhub returned a bad payload");
  }

  const candles: Candle[] = data.c.map((close: number, i: number) => ({
    time: (data.t[i] as number) * 1000,
    open: data.o[i] as number,
    high: data.h[i] as number,
    low: data.l[i] as number,
    close,
    volume: (data.v?.[i] as number) ?? 0,
  }));

  if (candles.length < 250) throw new Error("Not enough candles");
  return candles.slice(-count);
}