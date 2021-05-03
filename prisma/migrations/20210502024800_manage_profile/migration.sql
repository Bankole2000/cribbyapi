/*
  Warnings:

  - The required column `uuid` was added to the `Profile` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `lastSeen` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "uuid" UUID NOT NULL,
ADD COLUMN     "instagramHandle" VARCHAR(255),
ADD COLUMN     "twitterHandle" VARCHAR(255),
ADD COLUMN     "snapchatUrl" VARCHAR(255),
ADD COLUMN     "websiteUrl" VARCHAR(255);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isOnline" BOOLEAN DEFAULT false,
ADD COLUMN     "lastSeen" TIMESTAMPTZ(6) NOT NULL;

-- CreateTable
CREATE TABLE "Hobby" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "emoticon" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_HobbyToProfile" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Hobby.uuid_unique" ON "Hobby"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "_HobbyToProfile_AB_unique" ON "_HobbyToProfile"("A", "B");

-- CreateIndex
CREATE INDEX "_HobbyToProfile_B_index" ON "_HobbyToProfile"("B");

-- AddForeignKey
ALTER TABLE "_HobbyToProfile" ADD FOREIGN KEY ("A") REFERENCES "Hobby"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_HobbyToProfile" ADD FOREIGN KEY ("B") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
