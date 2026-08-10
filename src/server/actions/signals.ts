"use server";
import { notifySignalEvent } from "@/server/services/notifications";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/server/db/client";
import { requireAdmin } from "@/server/auth/guards";
import type { SignalResultOutcome, SignalStatus } from "@prisma/client";

export type SignalFormState = { error?: string; ok?: boolean } | null;

const createSignalSchema = z.object({
  symbolId: z.coerce.number().int().positive(),
  direction: z.enum(["BUY", "SELL"]),
  timeframe: z.enum(["M15", "M30", "H1", "H4", "D1"]),
  marketSession: z.enum([
    "ASIA",
    "LONDON",
    "NEW_YORK",
    "LONDON_NY_OVERLAP",
    "GLOBAL",
  ]),
  entryPrice: z.coerce.number().positive(),
  stopLossPrice: z.coerce.number().positive(),
  tp1Price: z.coerce.number().positive(),
  tp2Price: z.coerce.number().positive().optional(),
  tp3Price: z.coerce.number().positive().optional(),
  riskLevel: z.enum(["LOW", "MEDIUM", "HIGH"]),
  qualityLabel: z.enum(["STRONG_SETUP", "VALID_SETUP", "WEAK_SETUP"]),
  accessTier: z.enum(["FREE", "PREMIUM"]),
  analysisMd: z.string().min(10).max(20000),
  reasoningMd: z.string().min(10).max(20000),
});

export async function createSignal(
  _prev: SignalFormState,
  formData: FormData
): Promise<SignalFormState> {
  const session = await requireAdmin();

  const parsed = createSignalSchema.safeParse({
    symbolId: formData.get("symbolId"),
    direction: formData.get("direction"),
    timeframe: formData.get("timeframe"),
    marketSession: formData.get("marketSession"),
    entryPrice: formData.get("entryPrice"),
    stopLossPrice: formData.get("stopLossPrice"),
    tp1Price: formData.get("tp1Price"),
    tp2Price: formData.get("tp2Price") || undefined,
    tp3Price: formData.get("tp3Price") || undefined,
    riskLevel: formData.get("riskLevel"),
    qualityLabel: formData.get("qualityLabel"),
    accessTier: formData.get("accessTier"),
    analysisMd: formData.get("analysisMd"),
    reasoningMd: formData.get("reasoningMd"),
  });

  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join(".") || "form"}: ${issue.message}`)
      .join(" • ");
    return { error: `Invalid input — ${details}` };
  }

  const data = parsed.data;

  const isBuy = data.direction === "BUY";
  const priceLogicOk = isBuy
    ? data.stopLossPrice < data.entryPrice && data.tp1Price > data.entryPrice
    : data.stopLossPrice > data.entryPrice && data.tp1Price < data.entryPrice;

  if (!priceLogicOk) {
    return {
      error:
        "Price logic invalid: for BUY, SL must be below entry and TP above. For SELL, the opposite.",
    };
  }

  const symbol = await prisma.symbol.findUnique({
    where: { id: data.symbolId },
  });

  if (!symbol) return { error: "Unknown symbol." };

  const pip = Number(symbol.pipSize);
  const riskPips = Math.abs(data.entryPrice - data.stopLossPrice) / pip;
  const finalTp = data.tp3Price ?? data.tp2Price ?? data.tp1Price;
  const rewardPips = Math.abs(finalTp - data.entryPrice) / pip;
  const riskReward = rewardPips / riskPips;

  const count = await prisma.signal.count();
  const signalCode = `SIG-${new Date().getFullYear()}-${String(
    count + 1
  ).padStart(4, "0")}`;

  await prisma.signal.create({
    data: {
      signalCode,
      symbolId: symbol.id,
      direction: data.direction,
      timeframe: data.timeframe,
      marketSession: data.marketSession,
      entryPrice: data.entryPrice,
      stopLossPrice: data.stopLossPrice,
      tp1Price: data.tp1Price,
      tp2Price: data.tp2Price ?? null,
      tp3Price: data.tp3Price ?? null,
      riskPips,
      rewardPips,
      riskReward,
      riskLevel: data.riskLevel,
      qualityLabel: data.qualityLabel,
      accessTier: data.accessTier,
      analysisMd: data.analysisMd,
      reasoningMd: data.reasoningMd,
      status: "DRAFT",
      createdById: session.user.id,
    },
  });

  revalidatePath("/admin/signals");
  return { ok: true };
}

const allowedStatuses: SignalStatus[] = [
  "ACTIVE",
  "TP1_HIT",
  "TP2_HIT",
  "CLOSED_TP",
  "CLOSED_SL",
  "CANCELLED",
];

export async function updateSignalStatus(formData: FormData): Promise<void> {
  const session = await requireAdmin();

  const id = formData.get("id") as string | null;
  const status = formData.get("status") as SignalStatus | null;

  if (!id || !status || !allowedStatuses.includes(status)) return;

  const signal = await prisma.signal.findUnique({ where: { id } });
  if (!signal) return;

  const now = new Date();
  const isClosing = ["CLOSED_TP", "CLOSED_SL", "CANCELLED"].includes(status);

  await prisma.signal.update({
    where: { id },
    data: {
      status,
      publishedAt:
        status === "ACTIVE" && !signal.publishedAt ? now : signal.publishedAt,
      activatedAt:
        status === "ACTIVE" && !signal.activatedAt ? now : signal.activatedAt,
      closedAt: isClosing ? now : signal.closedAt,
    },
  });

  if (isClosing) {
    const defaultOutcome: SignalResultOutcome =
      status === "CLOSED_TP"
        ? "WIN"
        : status === "CLOSED_SL"
          ? "LOSS"
          : "CANCELLED";

    const defaultR =
      status === "CLOSED_TP"
        ? Number(signal.riskReward ?? 1)
        : status === "CLOSED_SL"
          ? -1
          : 0;

    await prisma.signalResult.upsert({
      where: { signalId: id },
      update: { outcome: defaultOutcome, realizedR: defaultR, closedAt: now },
      create: { signalId: id, outcome: defaultOutcome, realizedR: defaultR, closedAt: now },
    });
  }

   await prisma.signalUpdate.create({
    data: {
      signalId: id,
      oldStatus: signal.status,
      newStatus: status,
      createdById: session.user.id,
    },
  });

  if (signal.status !== status) {
    const symbol = await prisma.symbol.findUnique({
      where: { id: signal.symbolId },
    });
    const pair = symbol?.displayName ?? "Signal";

    const eventMap: Record<string, { type: Parameters<typeof notifySignalEvent>[0]["eventType"]; title: string }> = {
      ACTIVE: { type: "NEW_SIGNAL_PUBLISHED", title: "New signal published" },
      TP1_HIT: { type: "SIGNAL_TP1_HIT", title: "TP1 reached" },
      TP2_HIT: { type: "SIGNAL_TP2_HIT", title: "TP2 reached" },
      CLOSED_TP: { type: "SIGNAL_CLOSED_TP", title: "Signal closed in profit" },
      CLOSED_SL: { type: "SIGNAL_STOP_LOSS_HIT", title: "Stop loss reached" },
      CANCELLED: { type: "SIGNAL_CANCELLED", title: "Signal cancelled" },
    };

    const event = eventMap[status];
    if (event) {
      await notifySignalEvent({
        signalId: id,
        eventType: event.type,
        title: event.title,
        body: `${pair} ${signal.direction} — ${status.replace(/_/g, " ")}`,
      });
    }
  }

  revalidatePath("/admin/signals");
  revalidatePath("/history");
  revalidatePath("/notifications");
}

const allowedOutcomes: SignalResultOutcome[] = [
  "WIN",
  "LOSS",
  "BREAKEVEN",
  "CANCELLED",
];

export async function recordResult(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = formData.get("id") as string | null;
  const outcome = formData.get("outcome") as SignalResultOutcome | null;
  const realizedR = Number(formData.get("realizedR"));

  if (!id || !outcome || !allowedOutcomes.includes(outcome)) return;
  if (Number.isNaN(realizedR)) return;

  await prisma.signalResult.upsert({
    where: { signalId: id },
    update: { outcome, realizedR, closedAt: new Date() },
    create: { signalId: id, outcome, realizedR, closedAt: new Date() },
  });

  revalidatePath("/admin/signals");
  revalidatePath("/history");
}