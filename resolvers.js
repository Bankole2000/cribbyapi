const Query = require("./resolvers/query");
const Mutation = require("./resolvers/mutation");
const Subscription = require("./resolvers/subscriptions");
const Listing = require("./resolvers/listing");
const Country = require("./resolvers/countries");
const State = require("./resolvers/states");
module.exports = {
  Query,
  Subscription,
  Listing,
  Mutation,
  Country,
  State,
  // Speaker,
};
