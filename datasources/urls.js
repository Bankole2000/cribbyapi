
const { DataSource } = require('apollo-datasource');

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient()

class urlAPI extends DataSource {
  constructor() {
    super();
  }
  async getURLByName(url) {
    const urlExistsInDB = await prisma.url.findUnique({
      where: {
        originalUrl: url
      }
    })
    if (urlExistsInDB) {
      return urlExistsInDB
    }
    return false;
  }
  async storeNewURLAndShortcode(url, shortcode) {
    try {
      const storedUrl = await prisma.url.create({
        data: {
          originalUrl: url,
          shortenedId: shortcode
        }
      })
      return storedUrl
    } catch (err) {
      console.log({ err });
      throw new Error("Couldn't store Url in database")
    }
  }
  async getAllURLs(searchText) {
    let urls;
    if (searchText) {
      urls = await prisma.url.findMany({
        where: {
          OR: [
            {
              originalUrl: {
                contains: searchText,
              },
            },
            {
              shortenedId: {
                contains: searchText,
              },
            },
          ],
        }
      })
      return urls
    }
    urls = await prisma.url.findMany();
    return urls
  }
  async deleteURL(id) {
    try {
      const urlToDelete = await prisma.url.delete({
        where: {
          id: Number(id)
        }
      })
      return urlToDelete
    } catch (err) {
      console.log({ err });
    }
  }
}

module.exports = urlAPI