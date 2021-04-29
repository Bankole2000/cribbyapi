/*
  Warnings:

  - Made the column `dob` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `tos` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `gender` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "dob" SET NOT NULL,
ALTER COLUMN "tos" SET NOT NULL,
ALTER COLUMN "gender" SET NOT NULL;
