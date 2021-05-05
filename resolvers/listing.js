module.exports = {
  async basicPrice(
    { baseCurrency, basicPrice, uuid },
    { currency },
    { dataSources },
    info
  ) {
    if (currency && currency !== baseCurrency.code) {
      const { exchangeRate } = await dataSources.fxAPI.getExchangeRate(
        baseCurrency.code,
        currency
      );
      return Number(basicPrice * exchangeRate).toFixed(
        baseCurrency.decimalDigits
      );
    }
    return Number(basicPrice).toFixed(baseCurrency.decimalDigits);
  },
  async pricePerWeekend(
    { baseCurrency, pricePerWeekend, uuid },
    { currency },
    { dataSources },
    info
  ) {
    if (currency && currency !== baseCurrency.code) {
      const { exchangeRate } = await dataSources.fxAPI.getExchangeRate(
        baseCurrency.code,
        currency
      );
      return Number(pricePerWeekend * exchangeRate).toFixed(
        baseCurrency.decimalDigits
      );
    }
    return Number(pricePerWeekend).toFixed(baseCurrency.decimalDigits);
  },
  async pricePerWeek(
    { baseCurrency, pricePerWeek, uuid },
    { currency },
    { dataSources },
    info
  ) {
    if (currency && currency !== baseCurrency.code) {
      const { exchangeRate } = await dataSources.fxAPI.getExchangeRate(
        baseCurrency.code,
        currency
      );
      return Number(pricePerWeek * exchangeRate).toFixed(
        baseCurrency.decimalDigits
      );
    }
    return Number(pricePerWeek).toFixed(baseCurrency.decimalDigits);
  },
  async pricePerMonth(
    { baseCurrency, pricePerMonth, uuid },
    { currency },
    { dataSources },
    info
  ) {
    if (currency && currency !== baseCurrency.code) {
      const { exchangeRate } = await dataSources.fxAPI.getExchangeRate(
        baseCurrency.code,
        currency
      );
      return Number(pricePerMonth * exchangeRate).toFixed(
        baseCurrency.decimalDigits
      );
    }
    return Number(pricePerMonth).toFixed(baseCurrency.decimalDigits);
  },
  requestedCurrency(parent, { currency }, { dataSources }, info) {
    const {
      symbol,
      name,
      symbol_native,
      decimal_digits,
      rounding,
      code,
      name_plural,
    } = dataSources.currencyAPI.getCurrencyDetails({ code: currency });
    return {
      symbol,
      name,
      code,
      rounding: Number(rounding),
      decimalDigits: Number(decimal_digits),
      nativeSymbol: symbol_native,
      pluralName: name_plural,
    };
  },
};
