const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({});

const { DataSource } = require("apollo-datasource");

class ListingAPI extends DataSource {
  constructor() {
    super();
  }

  initialize(config) {}

  async getListings(args) {
    const listings = await prisma.listing.findMany({});
    console.log(listings);
    return listings;
  }

  async createListing(args) {
    const { uuid, listing } = args;

    const newListing = await prisma.listing.create({
      data: {
        ...listing,
        owner: {
          connect: {
            uuid,
          },
        },
      },
    });
    return newListing;
  }

  async getListingByUUID(uuid) {
    const listing = await prisma.listing.findUnique({
      where: {
        uuid,
      },
      include: {
        owner: true,
      },
    });
    return listing;
  }

  async updateListing({ uuid, updateData }) {
    const updatedListing = await prisma.listing.update({
      where: {
        uuid,
      },
      data: updateData,
    });
    return updatedListing;
  }

  async deleteListing(uuid) {
    const deletedListing = prisma.listing.delete({
      where: {
        uuid,
      },
      include: {
        owner: true,
        bookings: true,
      },
    });
    return deletedListing;
  }
}

module.exports = ListingAPI;
