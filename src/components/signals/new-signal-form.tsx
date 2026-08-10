"use client";

import { useActionState } from "react";
import { createSignal, type SignalFormState } from "@/server/actions/signals";

const inputClass =
  "mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-emerald-500";

export function NewSignalForm({
  symbols,
}: {
  symbols: { id: number; displayName: string }[];
}) {
  const [state, formAction, pending] = useActionState<SignalFormState, FormData>(
    createSignal,
    null
  );

  return (
    <form action={formAction} className="space-y-5">
      {state?.error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {state.error}
        </p>
      )}
      {state?.ok && (
        <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
          Signal created as DRAFT. Publish it from Manage Signals.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm text-zinc-300">Pair</label>
          <select name="symbolId" className={inputClass} required>
            {symbols.map((s) => (
              <option key={s.id} value={s.id}>
                {s.displayName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm text-zinc-300">Direction</label>
          <select name="direction" className={inputClass}>
            <option value="BUY">BUY</option>
            <option value="SELL">SELL</option>
          </select>
        </div>

        <div>
          <label className="text-sm text-zinc-300">Timeframe</label>
          <select name="timeframe" className={inputClass}>
            <option value="M15">M15</option>
            <option value="M30">M30</option>
            <option value="H1">H1</option>
            <option value="H4">H4</option>
            <option value="D1">D1</option>
          </select>
        </div>

        <div>
          <label className="text-sm text-zinc-300">Session</label>
          <select name="marketSession" className={inputClass}>
            <option value="LONDON">London</option>
            <option value="NEW_YORK">New York</option>
            <option value="LONDON_NY_OVERLAP">London/NY Overlap</option>
            <option value="ASIA">Asia</option>
            <option value="GLOBAL">Global</option>
          </select>
        </div>

        <div>
          <label className="text-sm text-zinc-300">Entry Price</label>
          <input name="entryPrice" type="number" step="0.00001" required className={inputClass} />
        </div>

        <div>
          <label className="text-sm text-zinc-300">Stop Loss</label>
          <input name="stopLossPrice" type="number" step="0.00001" required className={inputClass} />
        </div>

        <div>
          <label className="text-sm text-zinc-300">Take Profit 1</label>
          <input name="tp1Price" type="number" step="0.00001" required className={inputClass} />
        </div>

        <div>
          <label className="text-sm text-zinc-300">Take Profit 2 (optional)</label>
          <input name="tp2Price" type="number" step="0.00001" className={inputClass} />
        </div>

        <div>
          <label className="text-sm text-zinc-300">Take Profit 3 (optional)</label>
          <input name="tp3Price" type="number" step="0.00001" className={inputClass} />
        </div>

        <div>
          <label className="text-sm text-zinc-300">Risk Level</label>
          <select name="riskLevel" className={inputClass}>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>

        <div>
          <label className="text-sm text-zinc-300">Setup Quality</label>
          <select name="qualityLabel" className={inputClass}>
            <option value="STRONG_SETUP">Strong Setup</option>
            <option value="VALID_SETUP">Valid Setup</option>
            <option value="WEAK_SETUP">Weak Setup</option>
          </select>
        </div>

        <div>
          <label className="text-sm text-zinc-300">Visibility</label>
          <select name="accessTier" className={inputClass}>
            <option value="PREMIUM">Premium only</option>
            <option value="FREE">Free members (preview)</option>
          </select>
        </div>
      </div>

      <div>
        <label className="text-sm text-zinc-300">Technical Analysis</label>
        <textarea name="analysisMd" rows={4} required className={inputClass} />
      </div>

      <div>
        <label className="text-sm text-zinc-300">Trade Reasoning</label>
        <textarea name="reasoningMd" rows={4} required className={inputClass} />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
      >
        {pending ? "Creating..." : "Create Signal (Draft)"}
      </button>
    </form>
  );
}