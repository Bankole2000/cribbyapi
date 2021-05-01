const { withFilter } = require("apollo-server");

module.exports = {
  favorites: {
    subscribe: (parent, args, { pubsub, user }, info) => {
      return pubsub.asyncIterator(["FAVORITESUPDATE"]);
    },
  },
  userLoggedIn: {
    subscribe: withFilter(
      (parent, args, { pubsub, user }, info) => {
        console.log("onSignedUp Subscription!!!", user);

        return pubsub.asyncIterator(["USERLOGGEDIN"]);
      },
      (payload, variables) => {
        console.log({ payload, variables });
        if (!variables) {
          return false;
        }
        return payload.userLoggedIn.roles.includes("ADMIN");
      }
    ),
  },
  userSignedUp: {
    subscribe: (parent, args, { pubsub, user }, info) => {
      console.log("onSignedUp Subscription!!!", user);
      return pubsub.asyncIterator(["USERSIGNEDUP"]);
    },
  },
};
