const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({});

const { DataSource } = require("apollo-datasource");

class UserAPI extends DataSource {
  constructor() {
    super();
  }

  initialize(config) {}

  async getAllUsers() {
    const data = await prisma.user.findMany({});
    return data;
  }
  async getUserByEmail(email) {
    const data = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    // console.log({ email, line: 24, file: "users.js" });
    return data;
  }
  async getUserByUsername(username) {
    const data = await prisma.user.findUnique({
      where: {
        username,
      },
    });
    return data;
  }
  async getUserDetails(uuid) {
    try {
      const user = await prisma.user.findUnique({
        where: {
          uuid,
        },
        include: {
          profile: true,
          agentProfile: true,
          supportProfile: true,
          listings: true,
          bookings: true,
        },
      });
      return user;
    } catch (error) {
      console.log(error);
    }
  }
  async getUserByUUID(uuid) {
    const user = await prisma.user.findUnique({
      where: {
        uuid,
      },
    });
    return user;
  }
  async createUser({
    email,
    username,
    hash: password,
    dob,
    tos,
    gender,
    roles,
  }) {
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password,
        dob,
        tos,
        gender,
        roles,
      },
      include: {
        profile: true,
        supportProfile: true,
        agentProfile: true,
      },
    });
    return user;
  }
  async updateUser(data) {
    const updatedUser = await prisma.user.update({
      where: {
        uuid: data.uuid,
      },
      data,
    });
    return updatedUser;
  }
  async deleteUser({ uuid }) {
    const deletedUser = await prisma.user.delete({
      where: {
        uuid,
      },
    });
    return deletedUser;
  }
}

module.exports = UserAPI;
