const _ = require('lodash');

const generateUniqueId = require('generate-unique-id');
const { isValidURl } = require('../utils/validators');
const baseURL = process.env.API_SERVER_URL

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
  listings: async (parent, args, { dataSources }, info) => {
    const listings = await dataSources.listingAPI.getListings(args);
    return listings;
    // return _.filter(listings, args);
  },
  searchListings: async (parent, args, { dataSources }, info) => {
    const listings = await dataSources.listingAPI.searchListings(args);
    return listings;
  },
  currencies: (parent, args, { dataSources }, info) => {
    return dataSources.currencyAPI.getAllCurrencyDetails();
  },
  currencyCodes: (parent, args, { dataSources }, info) => {
    return dataSources.currencyAPI.getAllCurrencyCodes();
  },
  countryByCode: (parent, { countryCode }, { dataSources }, info) => {
    return dataSources.locationAPI.getCountryByCode(countryCode);
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
  stateByCode: (parent, args, { dataSources }, info) => {
    return dataSources.locationAPI.getSingleStateByCodes(args);
  },
  stateAddRequests: (parent, { searchText }, { dataSources }, info) => {
    return dataSources.locationRequestAPI.getStateAddRequests(searchText);
  },
  citiesByState: (
    parent,
    { countryCode, stateCode },
    { dataSources },
    info
  ) => {
    return dataSources.locationAPI.getCitiesByState({ countryCode, stateCode });
  },
  cityAddRequests: (parent, { searchText }, { dataSources }, info) => {
    return dataSources.locationRequestAPI.getCityAddRequests(searchText)
  },
  continentCodes: (parent, args, { dataSources }, info) => {
    return dataSources.locationAPI.getContinentCodes();
  },
  amenities: (parent, { searchText }, { dataSources }, info) => {
    return dataSources.amenityAPI.getAmenities(searchText);
  },
  amenityCategories: (parent, args, { dataSources }, info) => {
    return dataSources.amenityAPI.getAmenityCategories();
  },
  houseRules: (parent, { searchText }, { dataSources }, info) => {
    return dataSources.listingAPI.getHouseRules(searchText);
  },
  hobbies: (parent, args, { dataSources }, info) => {
    return dataSources.hobbyAPI.getHobbies(args);
  },
  shortenURL: async (parent, { url }, { dataSources }, info) => {
    // Check if it's a valid URL
    if (!isValidURl(url)) {
      throw new Error("Invalid URL");
    }
    // Check for the url in the database
    const urlExists = await dataSources.urlAPI.getURLByName(url)
    if (urlExists) {
      return `${baseURL}/api/v1/url-shortener/${urlExists.shortenedId}`
    }
    // Generate Uniqie Id for URL
    const uniqueID = generateUniqueId({
      length: 6,
      useLetters: true,
      useNumbers: true,
    })
    const newlyStoredURL = await dataSources.urlAPI.storeNewURLAndShortcode(url, uniqueID);
    if (newlyStoredURL) {
      return `${baseURL}/api/v1/url-shortener/${newlyStoredURL.shortenedId}`
    }
    return "Couldn't find or store URL"
  },
  shortenedURLs: async (parent, { searchText }, { dataSources }, info) => {
    const urls = await dataSources.urlAPI.getAllURLs(searchText)
    return urls
  }
};
