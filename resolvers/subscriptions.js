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
};
