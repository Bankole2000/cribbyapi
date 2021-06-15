const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({});

const { DataSource } = require("apollo-datasource");

class HobbiesAPI extends DataSource {
  constructor() {
    super();
  }

  initialize(config) {}

  async getHobbies(args) {
    let hobbies, {searchText} = args;

    if(!searchText){
      hobbies = await prisma.hobby.findMany({
        include: {
          profiles: true,
        },
      });
      return hobbies
    }

    hobbies = await prisma.hobby.findMany({
      where: {
        OR: [
          {
            title: {
              contains: searchText, 
              mode: 'insensitive'
            }
          },
          {
            description: {
              contains: searchText,
              mode: 'insensitive'
            },
          },
        ],
      }, 
      include: {
        profiles: true,
      }
    })
    
    return hobbies;
  }

  async createHobby(args) {
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
  async deleteHobby(args){
    let {hobbyId: id} = args; 
    try {
      const deletedHobby = await prisma.hobby.delete({
        where: {
          id
        }
      })
      return deletedHobby;
    } catch (err) {
      console.log({err});
      throw new Error("couldn't delete Hobby")
    }
  }
}

module.exports = HobbiesAPI;
