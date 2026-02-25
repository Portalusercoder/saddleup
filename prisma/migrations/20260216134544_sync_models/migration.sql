/*
  Warnings:

  - You are about to drop the column `group` on the `Horse` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Horse` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Session" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "duration" INTEGER NOT NULL,
    "intensity" TEXT NOT NULL,
    "discipline" TEXT NOT NULL,
    "rider" TEXT,
    "notes" TEXT,
    "horseId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Session_horseId_fkey" FOREIGN KEY ("horseId") REFERENCES "Horse" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Horse" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "age" INTEGER,
    "breed" TEXT,
    "owner" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Horse" ("age", "breed", "createdAt", "gender", "id", "name", "owner") SELECT "age", "breed", "createdAt", "gender", "id", "name", "owner" FROM "Horse";
DROP TABLE "Horse";
ALTER TABLE "new_Horse" RENAME TO "Horse";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
