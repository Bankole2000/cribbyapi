/*
  Warnings:

  - A unique constraint covering the columns `[uuid]` on the table `Profile` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Profile" ALTER COLUMN "IdentityVerifiedById" DROP NOT NULL,
ALTER COLUMN "IdentityVerifiedAt" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Profile.uuid_unique" ON "Profile"("uuid");
