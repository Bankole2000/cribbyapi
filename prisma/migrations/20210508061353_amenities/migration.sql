-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "guestCapacity" INTEGER,
ADD COLUMN     "guestArrivalDaysNotice" INTEGER,
ADD COLUMN     "guestBookingMonthsInAdvance" INTEGER,
ADD COLUMN     "bookingStayDaysMin" INTEGER,
ADD COLUMN     "bookingStayDaysMax" INTEGER,
ADD COLUMN     "locationCountry" TEXT,
ADD COLUMN     "countryCode" VARCHAR(2),
ADD COLUMN     "locationState" TEXT,
ADD COLUMN     "stateCode" VARCHAR(2),
ADD COLUMN     "locationCity" TEXT,
ADD COLUMN     "streetAddress" TEXT,
ADD COLUMN     "listingPurpose" VARCHAR(255),
ADD COLUMN     "listingType" VARCHAR(255),
ADD COLUMN     "latitude" DECIMAL(65,30),
ADD COLUMN     "longitude" DECIMAL(65,30),
ADD COLUMN     "specialFeatures" TEXT[],
ADD COLUMN     "guestPreferences" TEXT[];

-- CreateTable
CREATE TABLE "ListingHasHouseRule" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "isAllowed" BOOLEAN NOT NULL,
    "listingId" INTEGER NOT NULL,
    "houseRuleId" INTEGER NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HouseRule" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "faIconTrue" TEXT NOT NULL,
    "faIconFalse" TEXT NOT NULL,
    "mdiIconTrue" TEXT NOT NULL,
    "mdiIconFalse" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Amenity" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "amenityCategoryId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AmenityCategory" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AmenityToListing" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "ListingHasHouseRule.uuid_unique" ON "ListingHasHouseRule"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "HouseRule.uuid_unique" ON "HouseRule"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Amenity.uuid_unique" ON "Amenity"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "AmenityCategory.uuid_unique" ON "AmenityCategory"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "_AmenityToListing_AB_unique" ON "_AmenityToListing"("A", "B");

-- CreateIndex
CREATE INDEX "_AmenityToListing_B_index" ON "_AmenityToListing"("B");

-- AddForeignKey
ALTER TABLE "ListingHasHouseRule" ADD FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingHasHouseRule" ADD FOREIGN KEY ("houseRuleId") REFERENCES "HouseRule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Amenity" ADD FOREIGN KEY ("amenityCategoryId") REFERENCES "AmenityCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AmenityToListing" ADD FOREIGN KEY ("A") REFERENCES "Amenity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AmenityToListing" ADD FOREIGN KEY ("B") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
