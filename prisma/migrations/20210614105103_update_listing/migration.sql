-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "idealForSleeping" BOOLEAN DEFAULT true,
ADD COLUMN     "beds" JSON NOT NULL DEFAULT E'[]';
