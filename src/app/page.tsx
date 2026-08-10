import { APP_NAME, RISK_DISCLAIMER } from "@/lib/constants/app";

const phases = [
  { phase: "Phase 1", name: "Project Bootstrap", status: "ACTIVE" },
  { phase: "Phase 2", name: "Database Schema", status: "PENDING" },
  { phase: "Phase 3", name: "App Shell & UI Foundation", status: "PENDING" },
  { phase: "Phase 4", name: "Authentication", status: "PENDING" },
  { phase: "Phase 5", name: "Signal Management", status: "PENDING" },
  { phase: "Phase 6", name: "Signal Engine", status: "PENDING" },
  { phase: "Phase 7", name: "User Dashboard", status: "PENDING" },
  { phase: "Phase 8", name: "Admin Dashboard", status: "PENDING" },
  { phase: "Phase 9", name: "Notifications", status: "PENDING" },
  { phase: "Phase 10", name: "Performance Analytics", status: "PENDING" },
  { phase: "Phase 11", name: "Testing & Security", status: "PENDING" },
  { phase: "Phase 12", name: "Deployment", status: "PENDING" },
];

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 px-4 py-10">
      <header className="space-y-3">
        <p className="text-sm uppercase tracking-[0.3em] text-emerald-400">
          Fresh Build
        </p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          {APP_NAME}
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-zinc-400">
          A professional forex signal platform built around structured
          analysis, disciplined risk management, transparent performance, and
          no-trade decision support.
        </p>
      </header>

      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
        <h2 className="text-lg font-medium">Build Status</h2>
        <div className="mt-4 overflow-hidden rounded-xl border border-zinc-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-900 text-zinc-400">
              <tr>
                <th className="px-4 py-3 font-medium">Phase</th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {phases.map((item) => (
                <tr
                  key={item.phase}
                  className="border-t border-zinc-800 bg-zinc-950/40"
                >
                  <td className="px-4 py-3 text-zinc-300">{item.phase}</td>
                  <td className="px-4 py-3 text-zinc-300">{item.name}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        item.status === "ACTIVE"
                          ? "rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400"
                          : "rounded-full bg-zinc-500/10 px-3 py-1 text-xs font-medium text-zinc-400"
                      }
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6">
        <h2 className="text-lg font-medium text-amber-300">Risk Disclaimer</h2>
        <p className="mt-3 text-sm leading-6 text-amber-100/80">
          {RISK_DISCLAIMER}
        </p>
      </section>
    </main>
  );
}