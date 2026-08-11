import { prisma } from "@/server/db/client";
import { sendEmail } from "./email";

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

  const inAppRecipients = users.filter((user) => {
    const pref = user.notificationPreference;
    if (!pref) return true;
    return isNewSignal ? pref.inAppNewSignal : pref.inAppSignalStatus;
  });

  if (inAppRecipients.length > 0) {
    await prisma.notification.createMany({
      data: inAppRecipients.map((user) => ({
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

  const emailRecipients = users.filter((user) => {
    if (!user.email) return false;
    const pref = user.notificationPreference;
    if (!pref) return false;
    return isNewSignal ? pref.emailNewSignal : pref.emailSignalStatus;
  });

  for (const user of emailRecipients) {
    await sendEmail({
      to: user.email!,
      subject: input.title,
      html: `<p>${input.body}</p><p>Log in to view full details.</p><p>— Forex Signal Platform</p>`,
    });
  }
}