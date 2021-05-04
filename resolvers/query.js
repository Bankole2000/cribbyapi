module.exports = {
  allUsers: (parent, args, context, info) => {
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
  allListings: (parent, args, { dataSources }, info) => {
    return dataSources.listingAPI.getListings(args);
  },
  allCurrencyCodes: (parent, args, { dataSources }, info) => {
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
  getHobbies: (parent, args, { dataSources }, info) => {
    return dataSources.hobbyAPI.getHobbies(args);
  },
};
