-- CreateEnum
CREATE TYPE "AccessTier" AS ENUM ('FREE', 'PREMIUM');

-- AlterTable
ALTER TABLE "signals" ADD COLUMN     "accessTier" "AccessTier" NOT NULL DEFAULT 'PREMIUM';
