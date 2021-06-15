const statesArray = require("./states.json");
const citiesArray = require("./cities.json");
const stateIds = statesArray.map(x => Number(x.id));
const cityIds = citiesArray.map(x => Number(x.id));
stateIds.sort((a, b) => b - a)
cityIds.sort((a, b) => b - a)
lastStateId = stateIds[0];
lastCityId = cityIds[0]
console.log({lastStateId, lastCityId});

module.exports = { lastStateId, lastCityId }