import "dotenv/config";
import {
  PrismaClient,
  Prisma,
  UserRole,
  UserStatus,
  ContentPostType,
  ContentPostStatus,
} from "@prisma/client";
import { hash } from "@node-rs/argon2";
import { defaultSignalEngineSettings } from "../src/server/constants/signal-engine";

const prisma = new PrismaClient();

const symbols = [
  { symbol: "EURUSD", displayName: "EUR/USD", baseCurrency: "EUR", quoteCurrency: "USD", pipSize: "0.0001", priceDecimals: 5 },
  { symbol: "GBPUSD", displayName: "GBP/USD", baseCurrency: "GBP", quoteCurrency: "USD", pipSize: "0.0001", priceDecimals: 5 },
  { symbol: "USDJPY", displayName: "USD/JPY", baseCurrency: "USD", quoteCurrency: "JPY", pipSize: "0.01", priceDecimals: 3 },
  { symbol: "USDCHF", displayName: "USD/CHF", baseCurrency: "USD", quoteCurrency: "CHF", pipSize: "0.0001", priceDecimals: 5 },
  { symbol: "AUDUSD", displayName: "AUD/USD", baseCurrency: "AUD", quoteCurrency: "USD", pipSize: "0.0001", priceDecimals: 5 },
  { symbol: "NZDUSD", displayName: "NZD/USD", baseCurrency: "NZD", quoteCurrency: "USD", pipSize: "0.0001", priceDecimals: 5 },
  { symbol: "USDCAD", displayName: "USD/CAD", baseCurrency: "USD", quoteCurrency: "CAD", pipSize: "0.0001", priceDecimals: 5 },
  { symbol: "EURJPY", displayName: "EUR/JPY", baseCurrency: "EUR", quoteCurrency: "JPY", pipSize: "0.01", priceDecimals: 3 },
  { symbol: "GBPJPY", displayName: "GBP/JPY", baseCurrency: "GBP", quoteCurrency: "JPY", pipSize: "0.01", priceDecimals: 3 },
];

async function ensureUser(input: {
  email: string;
  password: string;
  role: UserRole;
  displayName: string;
}) {
  const existing = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existing) {
    const user = await prisma.user.update({
      where: { id: existing.id },
      data: {
        role: input.role,
        status: UserStatus.ACTIVE,
        emailVerified: existing.emailVerified ?? new Date(),
      },
    });

    await prisma.profile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        displayName: input.displayName,
        timezone: "UTC",
        baseCurrency: "USD",
        defaultRiskPercent: 1,
      },
    });

    await prisma.userNotificationPreference.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id },
    });

    return user;
  }

  const passwordHash = await hash(input.password);

  const user = await prisma.user.create({
    data: {
      email: input.email,
      passwordHash,
      role: input.role,
      status: UserStatus.ACTIVE,
      emailVerified: new Date(),
      profile: {
        create: {
          displayName: input.displayName,
          timezone: "UTC",
          baseCurrency: "USD",
          defaultRiskPercent: 1,
        },
      },
      notificationPreference: {
        create: {},
      },
    },
  });

  return user;
}

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@example.com";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;

  if (!adminPassword) {
    throw new Error("SEED_ADMIN_PASSWORD is required in .env");
  }

  const userEmail = process.env.SEED_USER_EMAIL ?? "user@example.com";
  const userPassword = process.env.SEED_USER_PASSWORD;

  console.log("Seeding admin user...");
  const admin = await ensureUser({
    email: adminEmail,
    password: adminPassword,
    role: UserRole.ADMIN,
    displayName: "Platform Admin",
  });

  if (userPassword) {
    console.log("Seeding standard user...");
    await ensureUser({
      email: userEmail,
      password: userPassword,
      role: UserRole.USER,
      displayName: "Demo Trader",
    });
  }

  console.log("Seeding symbols...");
  for (const symbol of symbols) {
    await prisma.symbol.upsert({
      where: { symbol: symbol.symbol },
      update: {},
      create: {
        symbol: symbol.symbol,
        displayName: symbol.displayName,
        baseCurrency: symbol.baseCurrency,
        quoteCurrency: symbol.quoteCurrency,
        pipSize: symbol.pipSize,
        priceDecimals: symbol.priceDecimals,
        isActive: true,
      },
    });
  }

  console.log("Seeding system settings...");
  await prisma.systemSetting.upsert({
    where: { key: "signal_engine" },
    update: {
      value: defaultSignalEngineSettings as unknown as Prisma.InputJsonValue,
      updatedById: admin.id,
    },
    create: {
      key: "signal_engine",
      value: defaultSignalEngineSettings as unknown as Prisma.InputJsonValue,
      updatedById: admin.id,
    },
  });

  console.log("Seeding content...");
  await prisma.contentPost.upsert({
    where: { slug: "what-is-forex" },
    update: {},
    create: {
      slug: "what-is-forex",
      type: ContentPostType.EDUCATION,
      title: "What Is Forex?",
      excerpt: "A beginner-friendly introduction to forex, entries, stop losses, and risk.",
      bodyMd: [
        "# What Is Forex?",
        "",
        "Forex, or foreign exchange, is the market where currencies are traded in pairs.",
        "",
        "For example, EUR/USD means you are trading the Euro against the US Dollar.",
        "",
        "## Key Concepts",
        "",
        "- **Entry Price:** The price where a trade idea becomes active.",
        "- **Stop Loss:** The price that limits losses if the idea is wrong.",
        "- **Take Profit:** The price where profit is taken.",
        "- **Risk/Reward:** The relationship between potential loss and potential gain.",
        "",
        "## Important Risk Warning",
        "",
        "Forex trading involves substantial risk. No signal, strategy, or analysis can guarantee profits.",
      ].join("\n"),
      status: ContentPostStatus.PUBLISHED,
      publishedAt: new Date(),
      authorId: admin.id,
    },
  });

  await prisma.contentPost.upsert({
    where: { slug: "risk-management-priority" },
    update: {},
    create: {
      slug: "risk-management-priority",
      type: ContentPostType.RISK_MESSAGE,
      title: "Risk Management Is the Priority",
      excerpt: "Why risk control matters more than chasing signals.",
      bodyMd: [
        "# Risk Management Is the Priority",
        "",
        "Before using any signal, define your risk.",
        "",
        "A common beginner rule is to risk no more than 1% of account balance per trade.",
        "",
        "Signals are structured market analysis, not guarantees.",
        "",
        "Always verify position size, pip value, and margin requirements with your broker.",
      ].join("\n"),
      status: ContentPostStatus.PUBLISHED,
      publishedAt: new Date(),
      authorId: admin.id,
    },
  });

  console.log("Seed complete.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });