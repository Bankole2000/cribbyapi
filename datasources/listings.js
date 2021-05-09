const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({});

const { DataSource } = require("apollo-datasource");

class ListingAPI extends DataSource {
  constructor() {
    super();
  }

  initialize(config) {}

  async getListings(args) {
    const listings = await prisma.listing.findMany({
      include: {
        baseCurrency: true,
        owner: {
          include: {
            profile: true,
          },
        },
        houseRules: {
          include: {
            rule: true,
          },
        },
      },
    });
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
      include: {
        baseCurrency: true,
      },
    });
    return updatedListing;
  }

  async deleteListingHouseRules(listingId) {
    const deletedListingHouseRules = await prisma.listingHasHouseRule.deleteMany(
      {
        where: {
          listingId,
        },
      }
    );
    console.log(deletedListingHouseRules);
    return deletedListingHouseRules;
  }

  async getHouseRules() {
    const houseRules = await prisma.houseRule.findMany({
      include: {
        listings: true,
      },
    });
    return houseRules;
  }

  async addHouseRule(houseRuledata) {
    const newHouseRule = await prisma.houseRule.create({
      data: houseRuledata,
    });
    return newHouseRule;
  }

  async getHouseRuleById(id) {
    const houseRule = prisma.houseRule.findUnique({
      where: {
        id,
      },
      include: {
        listings: true,
      },
    });
    return houseRule;
  }
  async updateHouseRule({ id, houseRuleData: data }) {
    const updatedHouseRule = await prisma.houseRule.update({
      where: {
        id,
      },
      data,
    });
    return updatedHouseRule;
  }
  async deleteHouseRule(uuid) {
    const deletedHouseRule = await prisma.houseRule.delete({
      where: {
        uuid,
      },
    });
    return deletedHouseRule;
  }

  async deleteListing(uuid) {
    const deletedListing = await prisma.listing.delete({
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
  async setListingIsPublishedStatus(uuid, status) {
    const updatedListing = await prisma.listing.update({
      data: {
        isPublished: status,
      },
      where: {
        uuid,
      },
      include: {
        owner: {
          include: {
            profile: true,
          },
        },
        baseCurrency: true,
      },
    });
    return updatedListing;
  }
}

module.exports = ListingAPI;
