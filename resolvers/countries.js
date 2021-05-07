const statesArray = require("../data/states.json");
const currencyObject = require("../data/currency.json");
const countryToCurrency = require("../data/countryToCurrency.json");

module.exports = {
  states({ countryCode }, args, { dataSources }, info) {
    return dataSources.locationAPI.getStatesByCountry({ countryCode });
  },
  currency({ countryCode }, args, { dataSources }, info) {
    const {
      symbol,
      name,
      symbol_native,
      decimal_digits,
      rounding,
      code,
      name_plural,
    } = currencyObject[countryToCurrency[countryCode]];
    return {
      symbol,
      name,
      nativeSymbol: symbol_native,
      code,
      decimalDigits: decimal_digits,
      rounding,
      pluralName: name_plural,
    };
  },
};
