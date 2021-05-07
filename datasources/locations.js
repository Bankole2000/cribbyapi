const { PrismaClient } = require("@prisma/client");
const _ = require("lodash");
const prisma = new PrismaClient({});
const currencyObject = require("../data/currency.json");
const countryToContinent = require("../data/countryContinent.json");
const countryToCurrency = require("../data/countryToCurrency.json");
const countryCodeToName = require("../data/countryISO2ToName.json");
const countriesArray = require("../data/countries.json");
const statesArray = require("../data/states.json");
const citiesArray = require("../data/cities.json");
const { codeContinentMap } = require("../data/mappings");
const allCurrencyCodes = Object.keys(currencyObject);
const excessCountries = {};
const excessCountryCodes = Object.keys(countryToCurrency);
countriesArray.forEach((country) => {
  excessCountries[country.iso2] = country;
});
const allCountryCodes = [];
const allCountries = [];
excessCountryCodes.forEach((countryCode) => {
  if (currencyObject[countryToCurrency[countryCode]]) {
    allCountryCodes.push(countryCode);
  }
});
allCountryCodes.forEach((code) => {
  if (excessCountries[code]) {
    const {
      name,
      iso2,
      capital,
      phone_code,
      currency,
      region,
      tld,
      subregion,
      latitude,
      longitude,
      emoji,
      emojiU,
    } = excessCountries[code];
    allCountries.push({
      tld,
      name,
      countryCode: iso2,
      capital,
      phoneCode: phone_code,
      currencyCode: currency,
      continent: region,
      continentCode: codeContinentMap[region],
      subregion,
      latitude,
      longitude,
      emoji,
      emojiU,
    });
  }
});
stateCodeToName = {};
statesArray.forEach((state) => {
  const { name, state_code } = state;
  stateCodeToName[state_code] = name;
});

const { DataSource } = require("apollo-datasource");
const { continentCodes } = require("../resolvers/query");

class LocationAPI extends DataSource {
  constructor() {
    super();
  }

  initialize(config) {}

  getAllCountries() {
    return allCountries;
  }
  getCountryCodes() {
    return allCountryCodes;
  }
  getContinentCodes() {
    return new Set(countryToContinent.map((country) => country.Continent_Code));
  }
  getCountries(args) {
    return _.filter(allCountries, args);
  }
  getStatesByCountry({ countryCode }) {
    const allStates = statesArray
      .filter((state) => state.country_code === countryCode)
      .map((state) => {
        const { name, country_code, state_code, latitude, longitude } = state;
        return {
          name,
          countryCode,
          stateCode: state_code,
          latitude,
          longitude,
          countryName: countryCodeToName[country_code],
        };
      });
    return allStates;
  }
  getCitiesByState({ countryCode, stateCode }) {
    return citiesArray
      .filter((city) => {
        return (
          city.state_code === stateCode && city.country_code === countryCode
        );
      })
      .map((city) => {
        const { name, state_code, country_code, latitude, longitude } = city;
        return {
          name,
          stateCode: state_code,
          stateName: stateCodeToName[stateCode],
          countryCode: country_code,
          countryName: countryCodeToName[countryCode],
          latitude,
          longitude,
        };
      });
  }
}

module.exports = LocationAPI;
