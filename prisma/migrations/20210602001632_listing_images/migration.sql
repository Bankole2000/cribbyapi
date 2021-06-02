/*
  Warnings:

  - Added the required column `filename` to the `ListingImage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `ListingImage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `ListingImage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `filePath` to the `ListingImage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fileURL` to the `ListingImage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `thumbnailPath` to the `ListingImage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `thumbnailURL` to the `ListingImage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mediumPath` to the `ListingImage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mediumURL` to the `ListingImage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `largePath` to the `ListingImage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `largeURL` to the `ListingImage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ListingImage" ADD COLUMN     "filename" TEXT NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "filePath" TEXT NOT NULL,
ADD COLUMN     "fileURL" TEXT NOT NULL,
ADD COLUMN     "thumbnailPath" TEXT NOT NULL,
ADD COLUMN     "thumbnailURL" TEXT NOT NULL,
ADD COLUMN     "mediumPath" TEXT NOT NULL,
ADD COLUMN     "mediumURL" TEXT NOT NULL,
ADD COLUMN     "largePath" TEXT NOT NULL,
ADD COLUMN     "largeURL" TEXT NOT NULL;
