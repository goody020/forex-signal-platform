import { prisma } from "@/server/db/client";

export type SignalEventType =
  | "NEW_SIGNAL_PUBLISHED"
  | "SIGNAL_TP1_HIT"
  | "SIGNAL_TP2_HIT"
  | "SIGNAL_CLOSED_TP"
  | "SIGNAL_STOP_LOSS_HIT"
  | "SIGNAL_CANCELLED";

export async function notifySignalEvent(input: {
  signalId: string;
  eventType: SignalEventType;
  title: string;
  body: string;
}) {
  const users = await prisma.user.findMany({
    where: { status: "ACTIVE" },
    include: { notificationPreference: true },
  });

  const isNewSignal = input.eventType === "NEW_SIGNAL_PUBLISHED";

  const recipients = users.filter((user) => {
    const pref = user.notificationPreference;
    if (!pref) return true;
    return isNewSignal ? pref.inAppNewSignal : pref.inAppSignalStatus;
  });

  if (recipients.length === 0) return;

  await prisma.notification.createMany({
    data: recipients.map((user) => ({
      userId: user.id,
      eventType: input.eventType,
      channel: "IN_APP",
      title: input.title,
      body: input.body,
      signalId: input.signalId,
      sentAt: new Date(),
    })),
  });
}