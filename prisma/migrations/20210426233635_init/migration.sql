-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'AGENT', 'SUPPORT', 'ADMIN');

-- CreateTable
CREATE TABLE "Agent" (
    "id" SERIAL NOT NULL,
    "uuid" UUID,
    "companyId" INTEGER,
    "licenseUrl" VARCHAR(255),
    "licenseIsImage" BOOLEAN,
    "licenseIsUpload" BOOLEAN,
    "licenseFilePath" VARCHAR(255),
    "approved" BOOLEAN DEFAULT false,
    "approvedAt" TIMESTAMPTZ(6),
    "approvedById" INTEGER,
    "userId" INTEGER NOT NULL,
    "agentEmail" TEXT,
    "agentPhone" TEXT,
    "agentEmailIsVerified" BOOLEAN DEFAULT false,
    "agentPhoneIsVerified" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" SERIAL NOT NULL,
    "uuid" UUID,
    "email" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "websiteUrl" VARCHAR(255) NOT NULL,
    "address" VARCHAR(255) NOT NULL,
    "locationCity" VARCHAR(255) NOT NULL,
    "locationState" VARCHAR(255) NOT NULL,
    "locationCountry" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Support" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "userDataId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rental" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "title" VARCHAR(255) NOT NULL,
    "shortDesc" VARCHAR(255) NOT NULL,
    "agentId" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RentalImage" (
    "id" SERIAL NOT NULL,
    "imageIndex" INTEGER NOT NULL,
    "uuid" UUID NOT NULL,
    "imageResizedUrl" VARCHAR(255) NOT NULL,
    "imageFullsizeUrl" VARCHAR NOT NULL,
    "imageResizedPath" VARCHAR(255) NOT NULL,
    "imageFullSizedPath" VARCHAR(255) NOT NULL,
    "rentalId" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "uuid" UUID,
    "email" VARCHAR(255),
    "emailIsVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerificationToken" VARCHAR(255) NOT NULL,
    "dob" DATE NOT NULL,
    "tos" BOOLEAN NOT NULL DEFAULT false,
    "gender" VARCHAR(255),
    "username" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255),
    "role" "Role" NOT NULL DEFAULT E'USER',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" SERIAL NOT NULL,
    "profileImageUrl" VARCHAR(255),
    "profileImagePath" VARCHAR(255),
    "identityCardImageUrl" VARCHAR(200),
    "identityVerified" BOOLEAN NOT NULL DEFAULT false,
    "IdentityVerifiedById" INTEGER NOT NULL,
    "IdentityVerifiedAt" TIMESTAMPTZ(6) NOT NULL,
    "firstname" VARCHAR(255),
    "lastname" VARCHAR(255),
    "phone" VARCHAR(255),
    "bio" VARCHAR(255),
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Listing" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "ownerId" INTEGER NOT NULL,
    "ispublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListingImage" (
    "id" SERIAL NOT NULL,
    "index" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "listingId" INTEGER NOT NULL,
    "guestId" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Agent.uuid_unique" ON "Agent"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Agent.agentEmail_unique" ON "Agent"("agentEmail");

-- CreateIndex
CREATE UNIQUE INDEX "Agent_userId_unique" ON "Agent"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Company.uuid_unique" ON "Company"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Company.email_unique" ON "Company"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Support.uuid_unique" ON "Support"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Support_userDataId_unique" ON "Support"("userDataId");

-- CreateIndex
CREATE UNIQUE INDEX "Rental.uuid_unique" ON "Rental"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "RentalImage.uuid_unique" ON "RentalImage"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "User.uuid_unique" ON "User"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "User.email_unique" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User.username_unique" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_unique" ON "Profile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Listing.uuid_unique" ON "Listing"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Booking.uuid_unique" ON "Booking"("uuid");

-- AddForeignKey
ALTER TABLE "Agent" ADD FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agent" ADD FOREIGN KEY ("approvedById") REFERENCES "Support"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agent" ADD FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Support" ADD FOREIGN KEY ("userDataId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rental" ADD FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalImage" ADD FOREIGN KEY ("rentalId") REFERENCES "Rental"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Profile" ADD FOREIGN KEY ("IdentityVerifiedById") REFERENCES "Support"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Profile" ADD FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Listing" ADD FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD FOREIGN KEY ("guestId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
