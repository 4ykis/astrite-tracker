-- CreateEnum
CREATE TYPE "BannerType" AS ENUM ('CHARACTER', 'WEAPON');

-- CreateEnum
CREATE TYPE "PullResult" AS ENUM ('WIN', 'LOSE');

-- CreateTable
CREATE TABLE "BalanceEntry" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "amount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BalanceEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpendEntry" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "amount" INTEGER NOT NULL,
    "category" "BannerType" NOT NULL,
    "bannerName" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SpendEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PullEntry" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "bannerType" "BannerType" NOT NULL,
    "bannerName" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "result" "PullResult" NOT NULL,
    "pityAtPull" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PullEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PityCounter" (
    "bannerType" "BannerType" NOT NULL,
    "currentPity" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PityCounter_pkey" PRIMARY KEY ("bannerType")
);

-- CreateIndex
CREATE UNIQUE INDEX "BalanceEntry_date_key" ON "BalanceEntry"("date");
