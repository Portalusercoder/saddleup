/*
  Warnings:

  - Added the required column `punchType` to the `Session` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Horse" ADD COLUMN "photoUrl" TEXT;
ALTER TABLE "Horse" ADD COLUMN "ridingSuitability" TEXT;
ALTER TABLE "Horse" ADD COLUMN "skillLevel" TEXT;
ALTER TABLE "Horse" ADD COLUMN "temperament" TEXT;
ALTER TABLE "Horse" ADD COLUMN "trainingStatus" TEXT;

-- CreateTable
CREATE TABLE "Rider" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "ridingLevel" TEXT,
    "notes" TEXT,
    "instructorFeedback" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "HealthLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "description" TEXT,
    "cost" REAL,
    "nextDue" DATETIME,
    "recoveryStatus" TEXT,
    "horseId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "HealthLog_horseId_fkey" FOREIGN KEY ("horseId") REFERENCES "Horse" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Session" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "punchType" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "intensity" TEXT NOT NULL,
    "discipline" TEXT NOT NULL,
    "rider" TEXT,
    "notes" TEXT,
    "horseId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Session_horseId_fkey" FOREIGN KEY ("horseId") REFERENCES "Horse" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Session" ("createdAt", "discipline", "duration", "horseId", "id", "intensity", "notes", "rider") SELECT "createdAt", "discipline", "duration", "horseId", "id", "intensity", "notes", "rider" FROM "Session";
DROP TABLE "Session";
ALTER TABLE "new_Session" RENAME TO "Session";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
