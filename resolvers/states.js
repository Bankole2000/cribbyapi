module.exports = {
  cities({ stateCode, countryCode }, args, { dataSources }, info) {
    return dataSources.locationAPI.getCitiesByState({ countryCode, stateCode });
  },
};
