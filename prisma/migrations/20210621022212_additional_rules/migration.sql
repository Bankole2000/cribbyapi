-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "guestsShouldKnow" JSON NOT NULL DEFAULT E'[]';
