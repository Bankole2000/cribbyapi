const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({});

const { DataSource } = require("apollo-datasource");

class AmenitiesAPI extends DataSource {
  constructor() {
    super();
  }
  initialize(config) {}

  async getAmenities(args) {
    // const amenities = await prisma.
    const amenities = await prisma.amenity.findMany({
      include: {
        category: true,
      },
    });
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
    const amenityCategory = await prisma.amenityCategory.create({
      data,
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
  async deleteAmenityCategory(args) {
    console.log(args);
  }
  async addAmenity(data) {
    const { categoryId } = data;
    data.category = {
      connect: {
        id: categoryId,
      },
    };
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
          id: categoryId,
        },
      };
    }
    delete amenityData.id;
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
    console.log(args);
  }
}

module.exports = AmenitiesAPI;
