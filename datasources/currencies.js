const currencyObject = require("../data/currency.json");
const { DataSource } = require("apollo-datasource");

class CurrencyAPI extends DataSource {
  constructor() {
    super();
  }

  initialize(config) {}

  getAllCurrencyCodes() {
    return Object.keys(currencyObject);
  }
  getCurrencyDetails({ code }) {
    return currencyObject[code];
  }
}

module.exports = CurrencyAPI;
