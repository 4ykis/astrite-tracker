-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "googleId" TEXT,
    "email" TEXT,
    "name" TEXT,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- Everything recorded before logins existed belongs to one placeholder user,
-- claimed by the first Google login matching LEGACY_OWNER_EMAIL.
INSERT INTO "User" ("id") VALUES ('legacy-owner');

-- Add userId, backfill existing rows, then enforce NOT NULL.
ALTER TABLE "BalanceEntry" ADD COLUMN "userId" TEXT NOT NULL DEFAULT 'legacy-owner';
ALTER TABLE "SpendEntry" ADD COLUMN "userId" TEXT NOT NULL DEFAULT 'legacy-owner';
ALTER TABLE "PullEntry" ADD COLUMN "userId" TEXT NOT NULL DEFAULT 'legacy-owner';
ALTER TABLE "PityCounter" ADD COLUMN "userId" TEXT NOT NULL DEFAULT 'legacy-owner';
ALTER TABLE "ResourceEntry" ADD COLUMN "userId" TEXT NOT NULL DEFAULT 'legacy-owner';
ALTER TABLE "EchoBuild" ADD COLUMN "userId" TEXT NOT NULL DEFAULT 'legacy-owner';

ALTER TABLE "BalanceEntry" ALTER COLUMN "userId" DROP DEFAULT;
ALTER TABLE "SpendEntry" ALTER COLUMN "userId" DROP DEFAULT;
ALTER TABLE "PullEntry" ALTER COLUMN "userId" DROP DEFAULT;
ALTER TABLE "PityCounter" ALTER COLUMN "userId" DROP DEFAULT;
ALTER TABLE "ResourceEntry" ALTER COLUMN "userId" DROP DEFAULT;
ALTER TABLE "EchoBuild" ALTER COLUMN "userId" DROP DEFAULT;

-- Pity is now per user and banner.
ALTER TABLE "PityCounter" DROP CONSTRAINT "PityCounter_pkey",
ADD CONSTRAINT "PityCounter_pkey" PRIMARY KEY ("userId", "bannerType");

-- Resource snapshots are unique per user, day and item.
DROP INDEX "ResourceEntry_date_idx";
DROP INDEX "ResourceEntry_date_itemId_key";
CREATE UNIQUE INDEX "ResourceEntry_userId_date_itemId_key" ON "ResourceEntry"("userId", "date", "itemId");

CREATE INDEX "BalanceEntry_userId_date_idx" ON "BalanceEntry"("userId", "date");
CREATE INDEX "SpendEntry_userId_date_idx" ON "SpendEntry"("userId", "date");
CREATE INDEX "PullEntry_userId_date_idx" ON "PullEntry"("userId", "date");
CREATE INDEX "EchoBuild_userId_position_idx" ON "EchoBuild"("userId", "position");

-- AddForeignKey
ALTER TABLE "BalanceEntry" ADD CONSTRAINT "BalanceEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SpendEntry" ADD CONSTRAINT "SpendEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PullEntry" ADD CONSTRAINT "PullEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PityCounter" ADD CONSTRAINT "PityCounter_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ResourceEntry" ADD CONSTRAINT "ResourceEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EchoBuild" ADD CONSTRAINT "EchoBuild_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
