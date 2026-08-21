import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/server/auth/config";
import { PREMIUM_PRICE_LABEL } from "@/lib/constants/billing";

export const metadata = {
  title: "Forex Signal Platform — Structured, Disciplined Trading Signals",
  description:
    "Professional forex signals built on structured analysis, disciplined risk management, and transparent performance. Start free, upgrade for full access.",
};

export default async function Home() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* NAV */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
        <p className="text-lg font-semibold tracking-tight">
          Forex <span className="text-emerald-400">Signal</span> Platform
        </p>
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="rounded-lg px-4 py-2 text-sm text-zinc-300 hover:text-white"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
          >
            Create Account
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-14 text-center">
        <p className="text-xs font-medium tracking-[0.3em] text-emerald-400">
          STRUCTURED • DISCIPLINED • TRANSPARENT
        </p>
        <h1 className="mx-auto mt-4 max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl">
          Forex signals with a process, not promises.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm text-zinc-400 sm:text-base">
          Every setup is scored on trend, structure, momentum and risk before
          it reaches you. Free members see previews. Premium members get full
          entries, stops, targets and reasoning.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link
            href="/signup"
            className="rounded-lg bg-emerald-600 px-6 py-3 text-sm font-medium text-white hover:bg-emerald-500"
          >
            Start Free
          </Link>
          <Link
            href="#pricing"
            className="rounded-lg border border-zinc-700 px-6 py-3 text-sm text-zinc-200 hover:bg-zinc-900"
          >
            View Pricing
          </Link>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
            <p className="text-sm font-medium text-emerald-400">1</p>
            <p className="mt-2 font-medium">Create a free account</p>
            <p className="mt-2 text-sm text-zinc-400">
              30 seconds to join. No card required. Instant access to previews
              and education.
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
            <p className="text-sm font-medium text-emerald-400">2</p>
            <p className="mt-2 font-medium">Study the process</p>
            <p className="mt-2 text-sm text-zinc-400">
              See how setups are scored, how risk is managed, and how results
              are published — wins and losses.
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
            <p className="text-sm font-medium text-emerald-400">3</p>
            <p className="mt-2 font-medium">Upgrade when ready</p>
            <p className="mt-2 text-sm text-zinc-400">
              Unlock full levels, analysis and alerts with a simple transfer.
              Cancel anytime.
            </p>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="mx-auto max-w-6xl px-4 pb-16">
        <h2 className="text-center text-2xl font-semibold">Simple pricing</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
            <p className="font-medium">Free</p>
            <p className="mt-1 text-2xl font-semibold text-zinc-300">₦0</p>
            <ul className="mt-4 space-y-2 text-sm text-zinc-400">
              <li>• 1–2 preview signals per week</li>
              <li>• Confidence varies 6–9</li>
              <li>• Education and risk tools</li>
              <li>• Full transparency on results</li>
            </ul>
            <Link
              href="/signup"
              className="mt-6 block rounded-lg border border-zinc-700 px-4 py-2 text-center text-sm text-zinc-200 hover:bg-zinc-900"
            >
              Start Free
            </Link>
          </div>

          <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/5 p-6">
            <p className="font-medium text-emerald-300">Premium</p>
            <p className="mt-1 text-2xl font-semibold text-emerald-400">
              {PREMIUM_PRICE_LABEL}
            </p>
            <ul className="mt-4 space-y-2 text-sm text-zinc-300">
              <li>• 3+ high-confidence signals weekly</li>
              <li>• Confidence always starts at 8/10</li>
              <li>• Full entry, stop loss, take profits</li>
              <li>• Complete analysis and reasoning</li>
              <li>• Email alerts + full history</li>
            </ul>
            <Link
              href="/signup"
              className="mt-6 block rounded-lg bg-emerald-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-emerald-500"
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>

      {/* HONESTY */}
      <section className="mx-auto max-w-3xl px-4 pb-16 text-center">
        <h2 className="text-xl font-semibold">Our promise: honesty</h2>
        <p className="mt-3 text-sm text-zinc-400">
          No guaranteed wins. Losses are published with the same transparency
          as wins. Every signal includes risk guidance, and we would rather
          publish a no-trade day than a bad signal.
        </p>
      </section>

      <footer className="border-t border-zinc-800 py-6 text-center text-xs text-zinc-600">
        © {new Date().getFullYear()} Forex Signal Platform. Trading involves
        substantial risk of loss. Signals are educational, not financial
        advice.
      </footer>
    </main>
  );
}