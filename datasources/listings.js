const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({});
const {deleteFiles} = require("../utils/fileHandlers");

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
        images: true, 
        amenities: true,
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
        images: true,
        amenities: true
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
        images: true,
        amenities: true,
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

  async getHouseRules(searchText) {
    let houseRules;
    if(!searchText){
      houseRules = await prisma.houseRule.findMany({
        include: {
          listings: true,
        },
      });
      return houseRules;
    }
    houseRules = await prisma.houseRule.findMany({
      where: {
        OR: [
          {
            title: {
              contains: searchText,
              mode: "insensitive"
            }
          }, 
          {
            description: {
              contains: searchText, 
              mode: 'insensitive'
            }
          }, 
          {
            code: {
              contains: searchText, 
              mode: 'insensitive'
            }
          }
        ]
      }, 
      include: {
        listings: true
      }
    })
    return houseRules;
  }

  async addHouseRule(houseRuledata) {
    delete houseRuledata.id;
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
  async deleteHouseRule(id) {
    const deletedHouseRule = await prisma.houseRule.delete({
      where: {
        id,
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
        images: true
      },
    });
    return updatedListing;
  }

  async setListingFeaturedImage(uuid, imageData) {
    let listingImage;
    const listing = await prisma.listing.findUnique({
      where: {
        uuid
      }, 
      include: {
        images: true
      }
    });
    if(listing.images.length){
      const oldImage = listing.images.find(image => image.index == 0);
      if(oldImage){
        listingImage = await prisma.listingImage.update({
          where: {id: oldImage.id}, 
          data: imageData
        })
        return listingImage
      }
    }
    listingImage = await prisma.listingImage.create({
      data: {
        ...imageData,
        listing: {
          connect: {uuid}
        }
      } 
    })
    return listingImage
  }
  async addListingImage(uuid, imageData){
    const listingImage = await prisma.listingImage.create({
      data: {
        ...imageData,
        listing: {
          connect: {uuid}
        }
      } 
    })
    return listingImage
  }
  async updateListingImage( imageUUID, imageData){
    const listingImage = await prisma.listingImage.findUnique({
      where: {
        uuid: imageUUID
      }
    })
    if(!listingImage){
      throw new Error("No listing Image with that UUID");
    }
    const updatedImage = await prisma.listingImage.update({
      data: {...imageData}, 
      where: {
        uuid: imageUUID
      }
    })
    return updatedImage
  }
  async deleteListingImage(listingUUID, imageUUID){
    const imageToDelete = await prisma.listingImage.findUnique({
      where: {
        uuid: imageUUID
      }
    })
    if(!imageToDelete){
      throw new Error("No Image with that UUID")
    }
    const deletedImage = await prisma.listingImage.delete({
      where: {
        uuid: imageUUID
      }, 
      select: {
        index: true
      }
    })
    
    await prisma.listingImage.updateMany({
      where: {
        AND: [
          {
            index: {
              gt: deletedImage.index
            }
          }, 
          {
            listing: {
              is: {
                uuid: listingUUID
              }
            }
          }
        ]
      }, 
      data: {
        index: {
          decrement: 1
        }
      }
    })
    const {images: updatedImages} = await prisma.listing.findUnique({
      where: {
        uuid: listingUUID
      }, 
      select: {
        images: true,
      }
    })
    return {updatedImages, imageToDelete}
  }
}

module.exports = ListingAPI;
