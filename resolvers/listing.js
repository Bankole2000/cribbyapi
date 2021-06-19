const _ = require("lodash");

module.exports = {
  async basicPrice(
    { baseCurrency, basicPrice, uuid },
    // parent,
    { currency },
    { dataSources },
    info
  ) {
    if (currency && currency != baseCurrency.code) {
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
    if (currency && currency != baseCurrency.code) {
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
  locationCountry({ locationCountry }, args, { dataSources }, info) {
    return dataSources.locationAPI.getCountryByCode(locationCountry);
  },
  locationState(
    { locationState, locationCountry },
    args,
    { dataSources },
    info
  ) {
    if(!locationCountry){
      return null;
    }
    const data = { countryCode: locationCountry };
    const countryStates = dataSources.locationAPI.getStatesByCountry(data);
    if(!countryStates.length){
      return {
        name: null,
        stateCode: locationState, 
        countryCode: locationCountry,
        latitude: null,
        longitude: null,
      }
    }
    const statesInData = _.filter(countryStates, {
      stateCode: locationState,
      countryCode: locationCountry,
    });
    if (statesInData.length){
      return statesInData[0]
    }
    return {
      name: null,
      stateCode: locationState,
      
      countryName: null, 
      countryCode: locationCountry,
      latitude: null,
      longitude: null,
    }
  },
  locationCity(
    { locationState, locationCountry, locationCity },
    args,
    { dataSources },
    info
  ) {
    if(!locationState){
      return null;
    }
    data = { countryCode: locationCountry, stateCode: locationState };
    const stateCities = dataSources.locationAPI.getCitiesByState(data);
    if(!stateCities.length){
      return {
        name: locationCity,
        stateCode: locationState,
        stateName: null,
        countryName: null,
        countryCode: locationCountry,
        latitude: null, 
        longitude: null,
      }  
    }
    const citiesInData = _.filter(stateCities, { name: locationCity });
    if(citiesInData.length){
      return citiesInData[0];
    }
    return {
      name: locationCity,
      stateCode: locationState,
      stateName: null,
      countryName: null,
      countryCode: locationCountry,
      latitude: null, 
      longitude: null,
    }  
  },
  featuredImage({images}, args, context, info){
    const featuredImage = images.find(image => image.index == 0);
    if(!featuredImage){
      return null;
    }
    return {title: featuredImage.title, description: featuredImage.description, index: featuredImage.index, image: {...featuredImage}}
  },
  images({images}, args, context,info ){
    return images.map(image => {
     return {title: image.title, description: image.description, index: image.index, image: {...image}}
    }).sort((a, b) => a.index - b.index)
  }
};
