const { PrismaClient } = require("@prisma/client");
const currencyObject = require("../data/currency.json");
const { DataSource } = require("apollo-datasource");

const prisma = new PrismaClient({});
class CurrencyAPI extends DataSource {
  constructor() {
    super();
  }

  initialize(config) {}

  getAllCurrencyCodes() {
    return Object.keys(currencyObject);
  }
  async getCurrencyFromDatabaseByCode(currencyCode) {
    const currency = await prisma.currency.findUnique({
      where: {
        code: currencyCode,
      },
    });
    return currency;
  }
  getCurrencyDetails({ code }) {
    return currencyObject[code];
  }
}

module.exports = CurrencyAPI;
