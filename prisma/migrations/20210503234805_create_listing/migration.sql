/*
  Warnings:

  - Added the required column `title` to the `CohabitOffer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Listing` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CohabitOffer" ADD COLUMN     "title" VARCHAR(255) NOT NULL;

-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "title" VARCHAR(255) NOT NULL,
ADD COLUMN     "shortDescription" VARCHAR(255),
ADD COLUMN     "longDescription" TEXT,
ADD COLUMN     "additionalRules" TEXT[],
ADD COLUMN     "currencyId" INTEGER,
ADD COLUMN     "basicPrice" DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN     "pricePerWeekend" DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN     "pricePerWeek" DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN     "pricePerMonth" DECIMAL(10,2) DEFAULT 0.00,
ALTER COLUMN "ispublished" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Currency" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "symbol" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nativeSymbol" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "pluralName" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListingReview" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "review" TEXT NOT NULL,
    "reviewerId" INTEGER NOT NULL,
    "listingId" INTEGER NOT NULL,
    "listingRatingId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListingRating" (
    "id" SERIAL NOT NULL,
    "rating" INTEGER NOT NULL,
    "listingId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Currency.uuid_unique" ON "Currency"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "ListingReview.uuid_unique" ON "ListingReview"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "ListingReview_listingRatingId_unique" ON "ListingReview"("listingRatingId");

-- AddForeignKey
ALTER TABLE "ListingReview" ADD FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingReview" ADD FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingReview" ADD FOREIGN KEY ("listingRatingId") REFERENCES "ListingRating"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingRating" ADD FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingRating" ADD FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Listing" ADD FOREIGN KEY ("currencyId") REFERENCES "Currency"("id") ON DELETE SET NULL ON UPDATE CASCADE;
