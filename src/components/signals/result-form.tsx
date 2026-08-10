"use client";

import { recordResult } from "@/server/actions/signals";

export function ResultForm({ id }: { id: string }) {
  return (
    <form action={recordResult} className="flex flex-wrap gap-2">
      <input type="hidden" name="id" value={id} />
      <select
        name="outcome"
        className="rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-xs outline-none"
      >
        <option value="WIN">WIN</option>
        <option value="LOSS">LOSS</option>
        <option value="BREAKEVEN">BREAKEVEN</option>
        <option value="CANCELLED">CANCELLED</option>
      </select>
      <input
        name="realizedR"
        type="number"
        step="0.1"
        placeholder="R (e.g. 2 or -1)"
        className="w-28 rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-xs outline-none"
      />
      <button
        type="submit"
        className="rounded-lg bg-zinc-800 px-3 py-1.5 text-xs text-zinc-200 hover:bg-zinc-700"
      >
        Save Result
      </button>
    </form>
  );
}