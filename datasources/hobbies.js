const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({});

const { DataSource } = require("apollo-datasource");

class HobbiesAPI extends DataSource {
  constructor() {
    super();
  }

  initialize(config) {}

  async getHobbies(args) {
    const hobbies = await prisma.hobby.findMany({});
    return hobbies;
  }

  async createHobby(args) {
    console.log({ args });
    let { id, data } = args;
    try {
      if (id) {
        const newHobby = await prisma.hobby.upsert({
          where: { id: Number(id) },
          update: data,
          create: data,
        });
        return newHobby;
      } else {
        const newHobby = await prisma.hobby.create({
          data,
        });
        return newHobby;
      }
    } catch (error) {
      console.log({ error });
      throw new Error("Required Details are missing");
    }
  }
}

module.exports = HobbiesAPI;
