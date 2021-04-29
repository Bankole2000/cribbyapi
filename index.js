require("dotenv").config();
const { ApolloServer, ApolloError } = require("apollo-server");

const UserAPI = require("./datasources/users");

const typeDefs = require("./schema");

const resolvers = require("./resolvers");

const dataSources = () => ({
  userAPI: new UserAPI(),
});

const server = new ApolloServer({
  typeDefs,
  resolvers,
  dataSources,
  // debug: false,
  // formatError: (err) => {
  //   console.log(err);
  //   if (err.extensions.code == "INTERNAL_SERVER_ERROR") {
  //     return new ApolloError("We're having some trouble", "ERROR", {
  //       token: "Unique Token for support ticket maybe",
  //     });
  //   }
  //   return err;
  // },
  // introspection: false,
  // playground: false,
});

server.listen({ port: process.env.PORT || 4000 }).then((object) => {
  // console.log({ object });
  console.log(`Server running at ${object.url}`);
});
