-- DropForeignKey
ALTER TABLE "Agent" DROP CONSTRAINT "Agent_userId_fkey";

-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_guestId_fkey";

-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_listingId_fkey";

-- DropForeignKey
ALTER TABLE "Contact" DROP CONSTRAINT "Contact_inviterUuid_fkey";

-- DropForeignKey
ALTER TABLE "Listing" DROP CONSTRAINT "Listing_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "ListingHasHouseRule" DROP CONSTRAINT "ListingHasHouseRule_houseRuleId_fkey";

-- DropForeignKey
ALTER TABLE "ListingHasHouseRule" DROP CONSTRAINT "ListingHasHouseRule_listingId_fkey";

-- DropForeignKey
ALTER TABLE "ListingRating" DROP CONSTRAINT "ListingRating_listingId_fkey";

-- DropForeignKey
ALTER TABLE "ListingRating" DROP CONSTRAINT "ListingRating_userId_fkey";

-- DropForeignKey
ALTER TABLE "ListingReview" DROP CONSTRAINT "ListingReview_listingId_fkey";

-- DropForeignKey
ALTER TABLE "ListingReview" DROP CONSTRAINT "ListingReview_listingRatingId_fkey";

-- DropForeignKey
ALTER TABLE "ListingReview" DROP CONSTRAINT "ListingReview_userId_fkey";

-- DropForeignKey
ALTER TABLE "Profile" DROP CONSTRAINT "Profile_IdentityVerifiedById_fkey";

-- DropForeignKey
ALTER TABLE "Profile" DROP CONSTRAINT "Profile_userId_fkey";

-- DropForeignKey
ALTER TABLE "Rental" DROP CONSTRAINT "Rental_agentId_fkey";

-- DropForeignKey
ALTER TABLE "RentalImage" DROP CONSTRAINT "RentalImage_rentalId_fkey";

-- DropForeignKey
ALTER TABLE "Support" DROP CONSTRAINT "Support_userDataId_fkey";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "roles" SET DEFAULT ARRAY['USER']::"Role"[];

-- CreateTable
CREATE TABLE "Url" (
    "id" SERIAL NOT NULL,
    "originalUrl" TEXT NOT NULL,
    "shortenedId" TEXT NOT NULL,
    "clickCount" INTEGER NOT NULL DEFAULT 0,
    "lastVisited" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Url_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Url_originalUrl_key" ON "Url"("originalUrl");

-- CreateIndex
CREATE UNIQUE INDEX "Url_shortenedId_key" ON "Url"("shortenedId");

-- AddForeignKey
ALTER TABLE "Agent" ADD CONSTRAINT "Agent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Support" ADD CONSTRAINT "Support_userDataId_fkey" FOREIGN KEY ("userDataId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rental" ADD CONSTRAINT "Rental_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalImage" ADD CONSTRAINT "RentalImage_rentalId_fkey" FOREIGN KEY ("rentalId") REFERENCES "Rental"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_IdentityVerifiedById_fkey" FOREIGN KEY ("IdentityVerifiedById") REFERENCES "Support"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingHasHouseRule" ADD CONSTRAINT "ListingHasHouseRule_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingHasHouseRule" ADD CONSTRAINT "ListingHasHouseRule_houseRuleId_fkey" FOREIGN KEY ("houseRuleId") REFERENCES "HouseRule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingReview" ADD CONSTRAINT "ListingReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingReview" ADD CONSTRAINT "ListingReview_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingReview" ADD CONSTRAINT "ListingReview_listingRatingId_fkey" FOREIGN KEY ("listingRatingId") REFERENCES "ListingRating"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingRating" ADD CONSTRAINT "ListingRating_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingRating" ADD CONSTRAINT "ListingRating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_inviterUuid_fkey" FOREIGN KEY ("inviterUuid") REFERENCES "User"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "Agent.agentEmail_unique" RENAME TO "Agent_agentEmail_key";

-- RenameIndex
ALTER INDEX "Agent.uuid_unique" RENAME TO "Agent_uuid_key";

-- RenameIndex
ALTER INDEX "Agent_userId_unique" RENAME TO "Agent_userId_key";

-- RenameIndex
ALTER INDEX "Amenity.uuid_unique" RENAME TO "Amenity_uuid_key";

-- RenameIndex
ALTER INDEX "AmenityCategory.uuid_unique" RENAME TO "AmenityCategory_uuid_key";

-- RenameIndex
ALTER INDEX "Booking.uuid_unique" RENAME TO "Booking_uuid_key";

-- RenameIndex
ALTER INDEX "CityAddRequest.uuid_unique" RENAME TO "CityAddRequest_uuid_key";

-- RenameIndex
ALTER INDEX "CohabitOffer.uuid_unique" RENAME TO "CohabitOffer_uuid_key";

-- RenameIndex
ALTER INDEX "Company.email_unique" RENAME TO "Company_email_key";

-- RenameIndex
ALTER INDEX "Company.uuid_unique" RENAME TO "Company_uuid_key";

-- RenameIndex
ALTER INDEX "Contact.uuid_unique" RENAME TO "Contact_uuid_key";

-- RenameIndex
ALTER INDEX "Currency.code_unique" RENAME TO "Currency_code_key";

-- RenameIndex
ALTER INDEX "Currency.uuid_unique" RENAME TO "Currency_uuid_key";

-- RenameIndex
ALTER INDEX "ExchangeRate.uuid_unique" RENAME TO "ExchangeRate_uuid_key";

-- RenameIndex
ALTER INDEX "Hobby.uuid_unique" RENAME TO "Hobby_uuid_key";

-- RenameIndex
ALTER INDEX "HouseRule.uuid_unique" RENAME TO "HouseRule_uuid_key";

-- RenameIndex
ALTER INDEX "Listing.uuid_unique" RENAME TO "Listing_uuid_key";

-- RenameIndex
ALTER INDEX "ListingHasHouseRule.uuid_unique" RENAME TO "ListingHasHouseRule_uuid_key";

-- RenameIndex
ALTER INDEX "ListingImage.uuid_unique" RENAME TO "ListingImage_uuid_key";

-- RenameIndex
ALTER INDEX "ListingReview.uuid_unique" RENAME TO "ListingReview_uuid_key";

-- RenameIndex
ALTER INDEX "ListingReview_listingRatingId_unique" RENAME TO "ListingReview_listingRatingId_key";

-- RenameIndex
ALTER INDEX "Profile.uuid_unique" RENAME TO "Profile_uuid_key";

-- RenameIndex
ALTER INDEX "Profile_userId_unique" RENAME TO "Profile_userId_key";

-- RenameIndex
ALTER INDEX "Rental.uuid_unique" RENAME TO "Rental_uuid_key";

-- RenameIndex
ALTER INDEX "RentalImage.uuid_unique" RENAME TO "RentalImage_uuid_key";

-- RenameIndex
ALTER INDEX "StateAddRequest.uuid_unique" RENAME TO "StateAddRequest_uuid_key";

-- RenameIndex
ALTER INDEX "Support.uuid_unique" RENAME TO "Support_uuid_key";

-- RenameIndex
ALTER INDEX "Support_userDataId_unique" RENAME TO "Support_userDataId_key";

-- RenameIndex
ALTER INDEX "User.email_unique" RENAME TO "User_email_key";

-- RenameIndex
ALTER INDEX "User.username_unique" RENAME TO "User_username_key";

-- RenameIndex
ALTER INDEX "User.uuid_unique" RENAME TO "User_uuid_key";
