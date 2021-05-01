-- AlterTable
ALTER TABLE "User" ADD COLUMN     "favoriteListings" JSON NOT NULL DEFAULT E'[]',
ADD COLUMN     "favoriteRentals" JSON NOT NULL DEFAULT E'[]',
ADD COLUMN     "lastLogin" TIMESTAMPTZ(6);

-- CreateTable
CREATE TABLE "CohabitOffer" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contact" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "inviterUuid" UUID NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CohabitOffer.uuid_unique" ON "CohabitOffer"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Contact.uuid_unique" ON "Contact"("uuid");

-- AddForeignKey
ALTER TABLE "Contact" ADD FOREIGN KEY ("inviterUuid") REFERENCES "User"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;
