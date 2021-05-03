const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({});

const { DataSource } = require("apollo-datasource");

class UserAPI extends DataSource {
  constructor() {
    super();
  }

  initialize(config) {}

  async getAllUsers() {
    const data = await prisma.user.findMany({
      include: {
        profile: true,
        agentProfile: true,
        supportProfile: true,
        listings: true,
        bookings: true,
      },
    });
    return data;
  }
  async getUserByEmail(email) {
    const data = await prisma.user.findUnique({
      where: {
        email,
      },
    });

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
          profile: {
            include: {
              hobbies: true,
            },
          },
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
      console.log({ error });
      throw new Error("Couldn't get user with that UUID");
      return false;
    }
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
      include: {
        profile: true,
        agentProfile: true,
        supportProfile: true,
        listings: true,
        bookings: true,
      },
    });
    return updatedUser;
  }
  async updateUserProfile(data) {
    const { updateData, uuid } = data;
    let { hobbies } = updateData;
    if (hobbies) {
      hobbies = {
        set: hobbies.map((hobby) => {
          return { id: Number(hobby.id) };
        }),
      };
      delete updateData.hobbies;
    }
    console.log(hobbies);
    const profileExists = await prisma.profile.findUnique({
      where: {
        uuid,
      },
    });
    let updatedUser;
    try {
      if (profileExists) {
        if (hobbies) {
          await prisma.profile.update({
            where: {
              uuid,
            },
            data: {
              hobbies: { ...hobbies },
            },
          });
        }
        updatedUser = await prisma.user.update({
          where: {
            uuid,
          },
          data: {
            profile: {
              update: updateData,
            },
          },
          include: {
            profile: true,
            agentProfile: true,
            supportProfile: true,
            listings: true,
            bookings: true,
          },
        });
        return updatedUser;
      } else {
        updatedUser = await prisma.user.update({
          where: {
            uuid,
          },
          data: {
            profile: {
              create: {
                ...updateData,
                uuid,
                hobbies: { connect: hobbies.set },
              },
            },
          },
          include: {
            profile: true,
            agentProfile: true,
            supportProfile: true,
            listings: true,
            bookings: true,
          },
        });
        return updatedUser;
      }
    } catch (err) {
      console.log({ err, line: 195, file: "users.js" });
    }
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
