require("dotenv").config();
const { ApolloServer } = require("apollo-server-express");
const { PubSub } = require("apollo-server");
const express = require("express");
const cookieParser = require("cookie-parser");
const http = require("http");

const app = express();

const pubsub = new PubSub();

// const cors = require("cors");

// app.use(
//   cors({
//     origin: "*",
//     credentials: true,
//   })
// );

app.use(cookieParser());

const authUtil = require("./utils/auth");
const UserAPI = require("./datasources/users");

const typeDefs = require("./schema");

const resolvers = require("./resolvers");
const {
  RequiresLogin,
  RequiresSupport,
  RequiresAdmin,
  RequiresOwnership,
} = require("./directives/authDirective");

const dataSources = () => ({
  userAPI: new UserAPI(),
});

const server = new ApolloServer({
  typeDefs,
  resolvers,
  dataSources,
  subscriptions: {
    onDisconnect: (webSocket, context) => {
      console.log("disconnected");
    },
    onConnect: (connectionParams, WebSocket, context) => {
      if (WebSocket.upgradeReq.headers.cookie) {
        const cookie = WebSocket.upgradeReq.headers.cookie.split(
          "cribbyToken="
        )[1];
        const user = authUtil.verifyToken(cookie);
        console.log("ConnectedUser", user);
        return { user }; // this is returned as context from the subscriptions object and is available in apollo-server context as connection.context
      }
    },
  },
  schemaDirectives: {
    requiresLogin: RequiresLogin,
    requiresAdmin: RequiresAdmin,
    requiresSupport: RequiresSupport,
    requiresOwnership: RequiresOwnership,
  },
  context: ({ req, res, connection }) => {
    let user = null;
    // if (req.headers.authorization) {
    if (connection && connection.context) {
      user = connection.context.user;
    }
    if (req && req.cookies.cribbyToken) {
      const payload = authUtil.verifyToken(req.cookies.cribbyToken);
      user = payload;
    }
    return { user, req, res, pubsub };
  },
  introspection: true,
  playground: true,
  // debug: false,
  // formatError: (err) => {
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

server.applyMiddleware({ app });
const httpServer = http.createServer(app);
server.installSubscriptionHandlers(httpServer);

// try {
httpServer.listen(process.env.PORT || 4000, () => {
  // console.log({ object });
  console.log(`Server running at ${process.env.PORT || PORT}`);
});
// } catch (err) {
//
// }

app.get("/", (req, res) => {
  res.status(200).json({ message: "What'sup Rest" });
});
