"use client";

import { updateSignalStatus } from "@/server/actions/signals";

const options = [
  "ACTIVE",
  "TP1_HIT",
  "TP2_HIT",
  "CLOSED_TP",
  "CLOSED_SL",
  "CANCELLED",
];

export function UpdateStatusForm({
  id,
  current,
}: {
  id: string;
  current: string;
}) {
  return (
    <form action={updateSignalStatus} className="flex gap-2">
      <input type="hidden" name="id" value={id} />
      <select
        name="status"
        defaultValue={current}
        className="rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-xs outline-none"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="rounded-lg bg-zinc-800 px-3 py-1.5 text-xs text-zinc-200 hover:bg-zinc-700"
      >
        Update
      </button>
    </form>
  );
}