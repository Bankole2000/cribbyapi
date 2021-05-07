/*
  Warnings:

  - You are about to drop the column `ispublished` on the `Listing` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Listing" DROP COLUMN "ispublished",
ADD COLUMN     "isPublished" BOOLEAN DEFAULT false;
