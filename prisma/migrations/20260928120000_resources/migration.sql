-- CreateTable
CREATE TABLE "ResourceEntry" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "itemId" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResourceEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ResourceEntry_date_idx" ON "ResourceEntry"("date");

-- CreateIndex
CREATE UNIQUE INDEX "ResourceEntry_date_itemId_key" ON "ResourceEntry"("date", "itemId");

