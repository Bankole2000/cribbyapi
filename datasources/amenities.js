const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({});

const { DataSource } = require("apollo-datasource");

class AmenitiesAPI extends DataSource {
  constructor() {
    super();
  }
  initialize(config) {}

  async getAmenities(searchText) {
    let amenities; 
    if(!searchText){
      amenities = await prisma.amenity.findMany({
        include: {
          category: true,
        },
      });
      return amenities;
    }
    amenities = await prisma.amenity.findMany({
      where: {
        OR: [
          {
            title: {
              contains: searchText, 
              mode: "insensitive",
            }
          }, 
          {
            description: {
              contains: searchText, 
              mode: "insensitive"
            }
          }
        ]
      }, 
      include: {
        category: true,
      }
    })
    return amenities;
  }
  async getAmenityCategories(args) {
    const amenityCategories = await prisma.amenityCategory.findMany({
      include: {
        amenities: true,
      },
    });
    return amenityCategories;
  }
  async getAmenityCategoryById(id) {
    const amenityCategory = await prisma.amenityCategory.findUnique({
      where: {
        id,
      },
      include: {
        amenities: true,
      },
    });
    return amenityCategory;
  }
  async addAmenityCategory(data) {
    const {title, description} = data
    const amenityCategory = await prisma.amenityCategory.create({
      data: {
        title, 
        description
      }
    });
    return amenityCategory;
  }
  async updateAmenityCategory({ id, categoryData }) {
    const updatedAmenityCategory = await prisma.amenityCategory.update({
      where: {
        id,
      },
      data: {
        ...categoryData,
      },
      include: {
        amenities: true,
      },
    });
    return updatedAmenityCategory;
  }
  async deleteAmenityCategory({categoryId}) {
    const deletedAmenityCategory = await prisma.amenityCategory.delete({
      where: {
        id: categoryId
      }
    })
    return deletedAmenityCategory
  }
  async addAmenity(data) {
    const { categoryId } = data;
    if(categoryId){

      data.category = {
        connect: {
          id: Number(categoryId),
        },
      };
    }
    delete data.id;
    data.categoryId = Number(data.categoryId); 
    const newAmenity = await prisma.amenity.create({
      data,
    });
    return newAmenity;
  }
  async updateAmenity({ id, amenityData }) {
    const { categoryId } = amenityData;
    if (categoryId) {
      amenityData.category = {
        connect: {
          id: Number(categoryId),
        },
      };
    }
    delete amenityData.id;
    amenityData.categoryId = Number(amenityData.categoryId)
    const updatedAmenity = await prisma.amenity.update({
      where: {
        id,
      },
      data: {
        ...amenityData,
      },
      include: {
        category: true,
      },
    });
    return updatedAmenity;
  }
  async getAmenityById(id) {
    const amenity = await prisma.amenity.findUnique({
      where: {
        id,
      },
    });
    return amenity;
  }
  async deleteAmenity(args) {
    const {amenityId} = args;
    const deletedAmenity = await prisma.amenity.delete({
      where: {
        id: amenityId
      }
    })
    return deletedAmenity;
  }
}

module.exports = AmenitiesAPI;
