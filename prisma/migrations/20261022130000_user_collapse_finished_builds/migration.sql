-- AlterTable
ALTER TABLE "User" ADD COLUMN     "collapseFinishedBuilds" BOOLEAN NOT NULL DEFAULT false;

-- Users who already have shelved builds are in the "collapse finished" mode.
UPDATE "User" SET "collapseFinishedBuilds" = true
WHERE EXISTS (SELECT 1 FROM "EchoBuild" WHERE "EchoBuild"."userId" = "User"."id" AND "EchoBuild"."shelved");
