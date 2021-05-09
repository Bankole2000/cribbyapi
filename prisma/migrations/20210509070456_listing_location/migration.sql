/*
  Warnings:

  - You are about to drop the column `countryCode` on the `Listing` table. All the data in the column will be lost.
  - You are about to drop the column `stateCode` on the `Listing` table. All the data in the column will be lost.
  - You are about to alter the column `locationCountry` on the `Listing` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(2)`.
  - You are about to alter the column `locationState` on the `Listing` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(2)`.

*/
-- AlterTable
ALTER TABLE "Listing" DROP COLUMN "countryCode",
DROP COLUMN "stateCode",
ALTER COLUMN "locationCountry" SET DATA TYPE VARCHAR(2),
ALTER COLUMN "locationState" SET DATA TYPE VARCHAR(2);
