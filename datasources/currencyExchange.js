// https://free.currconv.com/api/v7/convert?q=USD_PHP&compact=ultra&apiKey=a390ee71129fbe6d838e
// https://v6.exchangerate-api.com/v6/c1ab112acddcb4ce094243d8/latest/${currencyOne}
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({});

const { RESTDataSource } = require("apollo-datasource-rest");

const { isOverADayOld } = require("../utils/validators");

class FXAPI extends RESTDataSource {
  constructor() {
    super();
    // this.baseURL = "https://free.currconv.com/api/v7";
    this.baseURL = `https://v6.exchangerate-api.com/v6/c1ab112acddcb4ce094243d8/latest`;
  }

  async getExchangeRate(from, to) {
    const storedExchangeRate = await prisma.exchangeRate.findFirst({
      where: {
        from,
        to,
      },
    });
    if (!storedExchangeRate) {
      const { conversion_rates: newExchangeRate } = await this.get(`/${to}`);
      let currentExchangeRate = await prisma.exchangeRate.create({
        data: {
          from,
          to,
          exchangeRate: 1 / newExchangeRate[from],
        },
      });
      return currentExchangeRate;
    }
    if (isOverADayOld(storedExchangeRate.updatedAt)) {
      const newExchangeRate = await this.get(`/${to}`);
      let currentExchangeRate = await prisma.exchangeRate.update({
        data: {
          exchangeRate: 1 / newExchangeRate[from],
        },
        where: {
          uuid: storedExchangeRate.uuid,
        },
      });
      return currentExchangeRate;
    }
    return storedExchangeRate;
  }
}

module.exports = FXAPI;
