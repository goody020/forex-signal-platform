import { prisma } from "@/server/db/client";

export async function isPremiumUser(
  userId: string,
  role: string
): Promise<boolean> {
  if (role === "ADMIN") return true;

  const subscription = await prisma.subscription.findFirst({
    where: {
      userId,
      status: "ACTIVE",
      OR: [
        { currentPeriodEndsAt: null },
        { currentPeriodEndsAt: { gte: new Date() } },
      ],
    },
  });

  return subscription !== null;
}