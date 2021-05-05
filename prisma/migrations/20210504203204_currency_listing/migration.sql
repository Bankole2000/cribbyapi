/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `Currency` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `rounding` to the `Currency` table without a default value. This is not possible if the table is not empty.
  - Added the required column `decimalDigits` to the `Currency` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Currency" ADD COLUMN     "rounding" INTEGER NOT NULL,
ADD COLUMN     "decimalDigits" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Listing" ALTER COLUMN "uuid" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Currency.code_unique" ON "Currency"("code");
