-- AlterTable
ALTER TABLE "EchoBuild" ADD COLUMN "collapsed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "position" INTEGER NOT NULL DEFAULT 0;

-- Keep the existing creation order.
UPDATE "EchoBuild" AS b
SET "position" = o.rn
FROM (SELECT "id", ROW_NUMBER() OVER (ORDER BY "createdAt") AS rn FROM "EchoBuild") AS o
WHERE b."id" = o."id";
