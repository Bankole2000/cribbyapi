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
  getAllCurrencyDetails() {
    let currencyCodes = Object.keys(currencyObject);
    const currencies = [];
    currencyCodes.forEach((currencyCode) => {
      const {
        symbol,
        name,
        symbol_native,
        decimal_digits,
        rounding,
        code,
        name_plural,
      } = currencyObject[currencyCode];
      currencies.push({
        symbol,
        name,
        code,
        rounding: Number(rounding),
        decimalDigits: Number(decimal_digits),
        nativeSymbol: symbol_native,
        pluralName: name_plural,
      });
    });
    return currencies;
  }
  getCurrencyDetails({ code }) {
    return currencyObject[code];
  }
}

module.exports = CurrencyAPI;
