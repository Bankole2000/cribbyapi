module.exports = {
  users: (parent, args, context, info) => {
    return context.dataSources.userAPI.getAllUsers(args);
  },
  me: (parent, args, { dataSources, user, req, res }, info) => {
    if (user) {
      return dataSources.userAPI.getUserDetails(user.uuid);
    }
    return {
      user: undefined,
    };
  },
  listings: (parent, args, { dataSources }, info) => {
    return dataSources.listingAPI.getListings(args);
  },
  currencies: (parent, args, { dataSources }, info) => {
    return dataSources.currencyAPI.getAllCurrencyDetails();
  },
  currencyCodes: (parent, args, { dataSources }, info) => {
    return dataSources.currencyAPI.getAllCurrencyCodes();
  },
  currencyDetails: (parent, args, { dataSources }, info) => {
    const {
      symbol,
      name,
      symbol_native,
      decimal_digits,
      rounding,
      code,
      name_plural,
    } = dataSources.currencyAPI.getCurrencyDetails(args);
    return {
      symbol,
      name,
      code,
      rounding,
      decimalDigits: decimal_digits,
      nativeSymbol: symbol_native,
      pluralName: name_plural,
    };
  },
  countryCodes: (parent, args, { dataSources }, info) => {
    return dataSources.locationAPI.getCountryCodes(args);
  },
  countries: (parent, args, { dataSources }, info) => {
    return dataSources.locationAPI.getCountries(args);
  },
  statesByCountry: (parent, args, { dataSources }, info) => {
    return dataSources.locationAPI.getStatesByCountry(args);
  },
  citiesByState: (
    parent,
    { countryCode, stateCode },
    { dataSources },
    info
  ) => {
    return dataSources.locationAPI.getCitiesByState({ countryCode, stateCode });
  },
  continentCodes: (parent, args, { dataSources }, info) => {
    return dataSources.locationAPI.getContinentCodes();
  },
  hobbies: (parent, args, { dataSources }, info) => {
    return dataSources.hobbyAPI.getHobbies(args);
  },
};
