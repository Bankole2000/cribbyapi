module.exports = {
  cities({ stateCode, countryCode }, args, { dataSources }, info) {
    console.log(dataSources);
    return dataSources.locationAPI.getCitiesByState({ countryCode, stateCode });
  },
};
