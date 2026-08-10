import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2] ?? "user@example.com";

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error(`User not found: ${email}`);
  }

  await prisma.subscription.deleteMany({ where: { userId: user.id } });

  await prisma.subscription.create({
    data: {
      userId: user.id,
      plan: "PREMIUM",
      status: "ACTIVE",
    },
  });

  console.log(`✅ ${email} is now a PREMIUM member.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });