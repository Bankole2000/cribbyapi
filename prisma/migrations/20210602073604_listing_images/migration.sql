/*
  Warnings:

  - A unique constraint covering the columns `[uuid]` on the table `ListingImage` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ListingImage.uuid_unique" ON "ListingImage"("uuid");
