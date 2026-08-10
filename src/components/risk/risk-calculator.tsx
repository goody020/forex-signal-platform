"use client";

import { useState } from "react";

const inputClass =
  "mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-emerald-500";

export function RiskCalculator() {
  const [balance, setBalance] = useState("1000");
  const [riskPercent, setRiskPercent] = useState("1");
  const [stopPips, setStopPips] = useState("30");
  const [pipValue, setPipValue] = useState("10");

  const b = Number(balance);
  const r = Number(riskPercent);
  const s = Number(stopPips);
  const p = Number(pipValue);

  const valid = [b, r, s, p].every((n) => Number.isFinite(n) && n > 0);

  const riskAmount = valid ? b * (r / 100) : 0;
  const lots = valid ? riskAmount / (s * p) : 0;
  const roundedLots = valid ? Math.floor(lots / 0.01) * 0.01 : 0;

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
      <h2 className="text-lg font-medium">Position Size Calculator</h2>
      <p className="mt-1 text-sm text-zinc-500">
        How much size can I take while respecting my risk?
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm text-zinc-300">Account Balance ($)</label>
          <input
            type="number"
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="text-sm text-zinc-300">Risk Per Trade (%)</label>
          <input
            type="number"
            step="0.1"
            value={riskPercent}
            onChange={(e) => setRiskPercent(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="text-sm text-zinc-300">Stop Distance (pips)</label>
          <input
            type="number"
            value={stopPips}
            onChange={(e) => setStopPips(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="text-sm text-zinc-300">
            Pip Value Per 1.00 Lot ($)
          </label>
          <input
            type="number"
            step="0.1"
            value={pipValue}
            onChange={(e) => setPipValue(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-zinc-600">
            Usually $10 for EUR/USD-style pairs. Confirm with your broker.
          </p>
        </div>
      </div>

      {r > 2 && (
        <p className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-300">
          Risk above 2% per trade is considered aggressive. Most professionals
          risk 1% or less.
        </p>
      )}

      <div className="mt-5 grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
          <p className="text-sm text-zinc-500">Maximum Risk</p>
          <p className="mt-1 text-2xl font-semibold text-red-300">
            ${valid ? riskAmount.toFixed(2) : "0.00"}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
          <p className="text-sm text-zinc-500">Suggested Size</p>
          <p className="mt-1 text-2xl font-semibold text-emerald-300">
            {valid ? roundedLots.toFixed(2) : "0.00"} lots
          </p>
        </div>
      </div>

      <p className="mt-4 text-xs text-zinc-600">
        This is an estimate. Verify pip value, contract size, margin, and
        stop-loss behavior with your broker before placing any trade. Never
        risk money you cannot afford to lose.
      </p>
    </div>
  );
}