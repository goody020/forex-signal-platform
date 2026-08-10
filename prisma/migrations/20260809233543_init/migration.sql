-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'DELETED');

-- CreateEnum
CREATE TYPE "SignalDirection" AS ENUM ('BUY', 'SELL');

-- CreateEnum
CREATE TYPE "SignalStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'SCHEDULED', 'ACTIVE', 'TP1_HIT', 'TP2_HIT', 'CLOSED_TP', 'CLOSED_SL', 'CLOSED_MANUAL', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "SignalRiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "SignalTimeframe" AS ENUM ('M15', 'M30', 'H1', 'H4', 'D1');

-- CreateEnum
CREATE TYPE "SignalTimeframeRole" AS ENUM ('CONTEXT', 'STRUCTURE', 'ENTRY', 'CONFIRMATION');

-- CreateEnum
CREATE TYPE "MarketSession" AS ENUM ('ASIA', 'LONDON', 'NEW_YORK', 'LONDON_NY_OVERLAP', 'GLOBAL');

-- CreateEnum
CREATE TYPE "QualityLabel" AS ENUM ('STRONG_SETUP', 'VALID_SETUP', 'WEAK_SETUP', 'NO_TRADE');

-- CreateEnum
CREATE TYPE "SignalResultOutcome" AS ENUM ('OPEN', 'WIN', 'LOSS', 'BREAKEVEN', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SignalSource" AS ENUM ('MANUAL', 'ENGINE', 'HYBRID');

-- CreateEnum
CREATE TYPE "EngineRunStatus" AS ENUM ('RUNNING', 'SUCCESS', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "EngineCandidateStatus" AS ENUM ('REJECTED', 'PENDING_REVIEW', 'APPROVED', 'DISCARDED');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('IN_APP', 'EMAIL', 'PUSH');

-- CreateEnum
CREATE TYPE "ContentPostType" AS ENUM ('EDUCATION', 'ANNOUNCEMENT', 'MARKET_COMMENTARY', 'RISK_MESSAGE');

-- CreateEnum
CREATE TYPE "ContentPostStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "PeriodType" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'ALL');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "emailVerified" TIMESTAMP(3),
    "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "profiles" (
    "userId" TEXT NOT NULL,
    "displayName" TEXT,
    "avatarUrl" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "baseCurrency" CHAR(3) NOT NULL DEFAULT 'USD',
    "defaultAccountBalance" DECIMAL(18,2),
    "defaultRiskPercent" DECIMAL(5,2) NOT NULL DEFAULT 1.0,
    "onboardedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "symbols" (
    "id" SERIAL NOT NULL,
    "symbol" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "baseCurrency" CHAR(3) NOT NULL,
    "quoteCurrency" CHAR(3) NOT NULL,
    "pipSize" DECIMAL(10,5) NOT NULL,
    "priceDecimals" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "symbols_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "signals" (
    "id" TEXT NOT NULL,
    "signalCode" TEXT NOT NULL,
    "symbolId" INTEGER NOT NULL,
    "direction" "SignalDirection" NOT NULL,
    "timeframe" "SignalTimeframe" NOT NULL,
    "marketSession" "MarketSession",
    "status" "SignalStatus" NOT NULL DEFAULT 'DRAFT',
    "entryPrice" DECIMAL(18,8) NOT NULL,
    "stopLossPrice" DECIMAL(18,8) NOT NULL,
    "tp1Price" DECIMAL(18,8) NOT NULL,
    "tp2Price" DECIMAL(18,8),
    "tp3Price" DECIMAL(18,8),
    "riskPips" DECIMAL(18,2),
    "rewardPips" DECIMAL(18,2),
    "riskReward" DECIMAL(8,3),
    "riskLevel" "SignalRiskLevel" NOT NULL DEFAULT 'MEDIUM',
    "qualityScore" INTEGER,
    "qualityLabel" "QualityLabel",
    "analysisMd" TEXT,
    "reasoningMd" TEXT,
    "source" "SignalSource" NOT NULL DEFAULT 'MANUAL',
    "engineRunId" TEXT,
    "createdById" TEXT,
    "approvedById" TEXT,
    "publishedAt" TIMESTAMP(3),
    "activatedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "signals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "signal_timeframes" (
    "id" TEXT NOT NULL,
    "signalId" TEXT NOT NULL,
    "timeframe" "SignalTimeframe" NOT NULL,
    "role" "SignalTimeframeRole" NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "signal_timeframes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "signal_factors" (
    "id" TEXT NOT NULL,
    "signalId" TEXT NOT NULL,
    "factor" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "maxScore" INTEGER NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "signal_factors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "signal_updates" (
    "id" TEXT NOT NULL,
    "signalId" TEXT NOT NULL,
    "oldStatus" "SignalStatus",
    "newStatus" "SignalStatus" NOT NULL,
    "price" DECIMAL(18,8),
    "note" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "signal_updates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "signal_results" (
    "signalId" TEXT NOT NULL,
    "outcome" "SignalResultOutcome" NOT NULL DEFAULT 'OPEN',
    "realizedR" DECIMAL(10,3),
    "realizedPips" DECIMAL(18,2),
    "tpLevelReached" INTEGER,
    "note" TEXT,
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "signal_results_pkey" PRIMARY KEY ("signalId")
);

-- CreateTable
CREATE TABLE "market_analysis" (
    "id" TEXT NOT NULL,
    "symbolId" INTEGER NOT NULL,
    "timeframe" "SignalTimeframe" NOT NULL,
    "runAt" TIMESTAMP(3) NOT NULL,
    "closePrice" DECIMAL(18,8),
    "ema50" DECIMAL(18,8),
    "ema200" DECIMAL(18,8),
    "rsi14" DECIMAL(8,4),
    "macd" JSONB,
    "atr14" DECIMAL(18,8),
    "marketStructure" TEXT,
    "supportLevels" JSONB,
    "resistanceLevels" JSONB,
    "liquidityZones" JSONB,
    "orderBlocks" JSONB,
    "fairValueGaps" JSONB,
    "notes" TEXT,
    "raw" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "market_analysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "signal_engine_runs" (
    "id" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "status" "EngineRunStatus" NOT NULL,
    "provider" TEXT,
    "params" JSONB,
    "candidatesCount" INTEGER NOT NULL DEFAULT 0,
    "noTradeCount" INTEGER NOT NULL DEFAULT 0,
    "publishedCount" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "signal_engine_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "signal_engine_candidates" (
    "id" TEXT NOT NULL,
    "engineRunId" TEXT NOT NULL,
    "symbolId" INTEGER NOT NULL,
    "timeframe" "SignalTimeframe" NOT NULL,
    "direction" "SignalDirection" NOT NULL,
    "entryPrice" DECIMAL(18,8),
    "stopLossPrice" DECIMAL(18,8),
    "tp1Price" DECIMAL(18,8),
    "tp2Price" DECIMAL(18,8),
    "tp3Price" DECIMAL(18,8),
    "qualityScore" INTEGER NOT NULL,
    "qualityLabel" "QualityLabel" NOT NULL,
    "factors" JSONB,
    "rejectionReasons" JSONB,
    "status" "EngineCandidateStatus" NOT NULL DEFAULT 'REJECTED',
    "signalId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "signal_engine_candidates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "channel" "NotificationChannel" NOT NULL DEFAULT 'IN_APP',
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "signalId" TEXT,
    "data" JSONB,
    "readAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_notification_preferences" (
    "userId" TEXT NOT NULL,
    "inAppNewSignal" BOOLEAN NOT NULL DEFAULT true,
    "inAppSignalStatus" BOOLEAN NOT NULL DEFAULT true,
    "emailNewSignal" BOOLEAN NOT NULL DEFAULT false,
    "emailSignalStatus" BOOLEAN NOT NULL DEFAULT false,
    "pushNewSignal" BOOLEAN NOT NULL DEFAULT false,
    "pushSignalStatus" BOOLEAN NOT NULL DEFAULT false,
    "weeklyReport" BOOLEAN NOT NULL DEFAULT true,
    "quietHoursStart" TEXT,
    "quietHoursEnd" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_notification_preferences_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "push_subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "push_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_audit_logs" (
    "id" TEXT NOT NULL,
    "adminUserId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "before" JSONB,
    "after" JSONB,
    "ip" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_posts" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" "ContentPostType" NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT,
    "bodyMd" TEXT NOT NULL,
    "authorId" TEXT,
    "status" "ContentPostStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "content_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "performance_metrics" (
    "id" TEXT NOT NULL,
    "period" "PeriodType" NOT NULL,
    "periodStart" DATE NOT NULL,
    "periodEnd" DATE NOT NULL,
    "totalSignals" INTEGER NOT NULL DEFAULT 0,
    "closedSignals" INTEGER NOT NULL DEFAULT 0,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "losses" INTEGER NOT NULL DEFAULT 0,
    "breakevens" INTEGER NOT NULL DEFAULT 0,
    "cancelled" INTEGER NOT NULL DEFAULT 0,
    "winRate" DECIMAL(6,3),
    "avgRr" DECIMAL(8,3),
    "totalR" DECIMAL(12,3),
    "profitFactor" DECIMAL(12,3),
    "maxDrawdownR" DECIMAL(12,3),
    "avgWinR" DECIMAL(12,3),
    "avgLossR" DECIMAL(12,3),
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "performance_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_settings" (
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "updatedById" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "plan" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "provider" TEXT,
    "providerSubscriptionId" TEXT,
    "currentPeriodEndsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "accounts_userId_idx" ON "accounts"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE INDEX "sessions_userId_idx" ON "sessions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "symbols_symbol_key" ON "symbols"("symbol");

-- CreateIndex
CREATE UNIQUE INDEX "signals_signalCode_key" ON "signals"("signalCode");

-- CreateIndex
CREATE INDEX "signals_status_publishedAt_idx" ON "signals"("status", "publishedAt");

-- CreateIndex
CREATE INDEX "signals_symbolId_publishedAt_idx" ON "signals"("symbolId", "publishedAt");

-- CreateIndex
CREATE INDEX "signals_createdAt_idx" ON "signals"("createdAt");

-- CreateIndex
CREATE INDEX "signal_timeframes_signalId_idx" ON "signal_timeframes"("signalId");

-- CreateIndex
CREATE UNIQUE INDEX "signal_timeframes_signalId_timeframe_role_key" ON "signal_timeframes"("signalId", "timeframe", "role");

-- CreateIndex
CREATE INDEX "signal_factors_signalId_idx" ON "signal_factors"("signalId");

-- CreateIndex
CREATE UNIQUE INDEX "signal_factors_signalId_factor_key" ON "signal_factors"("signalId", "factor");

-- CreateIndex
CREATE INDEX "signal_updates_signalId_createdAt_idx" ON "signal_updates"("signalId", "createdAt");

-- CreateIndex
CREATE INDEX "market_analysis_symbolId_timeframe_runAt_idx" ON "market_analysis"("symbolId", "timeframe", "runAt");

-- CreateIndex
CREATE UNIQUE INDEX "signal_engine_candidates_signalId_key" ON "signal_engine_candidates"("signalId");

-- CreateIndex
CREATE INDEX "signal_engine_candidates_engineRunId_idx" ON "signal_engine_candidates"("engineRunId");

-- CreateIndex
CREATE INDEX "signal_engine_candidates_symbolId_createdAt_idx" ON "signal_engine_candidates"("symbolId", "createdAt");

-- CreateIndex
CREATE INDEX "notifications_userId_readAt_createdAt_idx" ON "notifications"("userId", "readAt", "createdAt");

-- CreateIndex
CREATE INDEX "notifications_signalId_idx" ON "notifications"("signalId");

-- CreateIndex
CREATE UNIQUE INDEX "push_subscriptions_endpoint_key" ON "push_subscriptions"("endpoint");

-- CreateIndex
CREATE INDEX "push_subscriptions_userId_idx" ON "push_subscriptions"("userId");

-- CreateIndex
CREATE INDEX "admin_audit_logs_adminUserId_createdAt_idx" ON "admin_audit_logs"("adminUserId", "createdAt");

-- CreateIndex
CREATE INDEX "admin_audit_logs_entityType_entityId_idx" ON "admin_audit_logs"("entityType", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "content_posts_slug_key" ON "content_posts"("slug");

-- CreateIndex
CREATE INDEX "content_posts_status_publishedAt_idx" ON "content_posts"("status", "publishedAt");

-- CreateIndex
CREATE INDEX "content_posts_type_idx" ON "content_posts"("type");

-- CreateIndex
CREATE UNIQUE INDEX "performance_metrics_period_periodStart_key" ON "performance_metrics"("period", "periodStart");

-- CreateIndex
CREATE INDEX "subscriptions_userId_idx" ON "subscriptions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_provider_providerSubscriptionId_key" ON "subscriptions"("provider", "providerSubscriptionId");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "signals" ADD CONSTRAINT "signals_symbolId_fkey" FOREIGN KEY ("symbolId") REFERENCES "symbols"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "signals" ADD CONSTRAINT "signals_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "signals" ADD CONSTRAINT "signals_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "signals" ADD CONSTRAINT "signals_engineRunId_fkey" FOREIGN KEY ("engineRunId") REFERENCES "signal_engine_runs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "signal_timeframes" ADD CONSTRAINT "signal_timeframes_signalId_fkey" FOREIGN KEY ("signalId") REFERENCES "signals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "signal_factors" ADD CONSTRAINT "signal_factors_signalId_fkey" FOREIGN KEY ("signalId") REFERENCES "signals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "signal_updates" ADD CONSTRAINT "signal_updates_signalId_fkey" FOREIGN KEY ("signalId") REFERENCES "signals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "signal_updates" ADD CONSTRAINT "signal_updates_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "signal_results" ADD CONSTRAINT "signal_results_signalId_fkey" FOREIGN KEY ("signalId") REFERENCES "signals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "market_analysis" ADD CONSTRAINT "market_analysis_symbolId_fkey" FOREIGN KEY ("symbolId") REFERENCES "symbols"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "signal_engine_candidates" ADD CONSTRAINT "signal_engine_candidates_engineRunId_fkey" FOREIGN KEY ("engineRunId") REFERENCES "signal_engine_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "signal_engine_candidates" ADD CONSTRAINT "signal_engine_candidates_symbolId_fkey" FOREIGN KEY ("symbolId") REFERENCES "symbols"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "signal_engine_candidates" ADD CONSTRAINT "signal_engine_candidates_signalId_fkey" FOREIGN KEY ("signalId") REFERENCES "signals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_signalId_fkey" FOREIGN KEY ("signalId") REFERENCES "signals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_notification_preferences" ADD CONSTRAINT "user_notification_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_audit_logs" ADD CONSTRAINT "admin_audit_logs_adminUserId_fkey" FOREIGN KEY ("adminUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_posts" ADD CONSTRAINT "content_posts_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system_settings" ADD CONSTRAINT "system_settings_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
