/*
  Warnings:

  - Added the required column `description` to the `Amenity` table without a default value. This is not possible if the table is not empty.
  - Added the required column `faIcon` to the `Amenity` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mdiIcon` to the `Amenity` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `HouseRule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `ListingRating` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `ListingReview` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Amenity" ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "faIcon" TEXT NOT NULL,
ADD COLUMN     "mdiIcon" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "HouseRule" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "ListingRating" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "ListingReview" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
