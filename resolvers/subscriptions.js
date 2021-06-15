const { withFilter } = require("apollo-server");

module.exports = {
  userLoggedIn: {
    subscribe: withFilter(
      (parent, args, { pubsub, user }, info) => {
        console.log("User Logged In!!!", {
          user,
          file: "subscriptions.js",
          line: 15,
        });

        return pubsub.asyncIterator(["USERLOGGEDIN"]);
      },
      (payload, variables) => {
        console.log({ payload, variables, file: "subscriptions.js", line: 21 });
        if (!variables) {
          return false;
        }
        return payload.userLoggedIn.roles.includes("ADMIN");
      }
    ),
  },
  userSignedUp: {
    subscribe: (parent, args, { pubsub, user }, info) => {
      console.log("onSignedUp Subscription!!!", {
        user: user.uuid,
        file: "subscriptions.js",
        line: 34,
      });
      return pubsub.asyncIterator(["USERSIGNEDUP"]);
    },
  },
  hobbyAdded: {
    subscribe: (parent, args, {pubsub, user}, info) => {
      console.log("Hobby Subscription!", {
        user: user.uuid,
        file: "subscriptions.js",
        line: 44,
      });
      return pubsub.asyncIterator(["HOBBYADDED"]);
    }
  }, 
  amenityAdded: {
    subscribe: (parent, args, {pubsub, user}, info) => {
      console.log("Amenity Subscription!", {
        user: user.uuid,
        file: "subscriptions.js",
        line: 54,
      });
      return pubsub.asyncIterator(["AMENITYADDED"]);
    }
  }, 
  amenityCategoryAdded: {
    subscribe: (parent, args, {pubsub, user}, info) => {
      console.log("Amenity Category Subscription!", {
        user: user.uuid,
        file: "subscriptions.js",
        line: 64,
      });
      return pubsub.asyncIterator(["AMENITYCATEGORYADDED"]);
    }
  },
  houseRuleAdded: {
    subscribe: (parent, args, {pubsub, user}, info) => {
      console.log("House Rule Subscription!", {
        user: user.uuid,
        file: "subscriptions.js",
        line: 74,
      });
      return pubsub.asyncIterator(["HOUSERULEADDED"]);
    }
  },
  listingAdded: {
    subscribe: (parent, args, {pubsub, user}, info) => {
      console.log("Listing Subscription!", {
        user: user.uuid,
        file: "subscriptions.js",
        line: 84,
      });
      return pubsub.asyncIterator(["LISTINGADDED"]);
    }
  }, 
  stateAddRequestAdded: {
    subscribe: (parent, args, {pubsub, user}, info) => {
      console.log("State Add Request Subscription!", {
        user: user.uuid,
        file: "subscriptions.js",
        line: 94,
      });
      return pubsub.asyncIterator(["STATEADDREQUESTADDED"]);
    }
  }, 
  cityAddRequestAdded: {
    subscribe: (parent, args, {pubsub, user}, info) => {
      console.log("City Add Request Subscription!", {
        user: user.uuid,
        file: "subscriptions.js",
        line: 94,
      });
      return pubsub.asyncIterator(["CITYADDREQUESTADDED"]);
    }
  }
};
