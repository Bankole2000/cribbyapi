require("dotenv").config();
const { ApolloServer } = require("apollo-server-express");
const { PubSub } = require("apollo-server");
const express = require("express");
const cookieParser = require("cookie-parser");
const http = require("http");

const app = express();

const pubsub = new PubSub();

const cors = require("cors");

app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:5501", "https://bankole2000.github.io", "http://localhost:8081"],
  credentials: true
}));
// app.use(
//   cors({
//     origin: "*",
//     credentials: true,
//   })
// );

app.use(cookieParser());
app.use('/uploads', express.static('uploads'))

const authUtil = require("./utils/auth");
const UserAPI = require("./datasources/users");
const HobbyAPI = require("./datasources/hobbies");
const CurrencyAPI = require("./datasources/currencies");
const ListingAPI = require("./datasources/listings");
const LocationAPI = require("./datasources/locations");
const LocationRequestAPI = require("./datasources/requests");
const AmenityAPI = require("./datasources/amenities");
const FXAPI = require("./datasources/currencyExchange");
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
  hobbyAPI: new HobbyAPI(),
  currencyAPI: new CurrencyAPI(),
  listingAPI: new ListingAPI(),
  fxAPI: new FXAPI(),
  locationAPI: new LocationAPI(),
  locationRequestAPI: new LocationRequestAPI(),
  amenityAPI: new AmenityAPI(),
});

const server = new ApolloServer({
  cors: {
    origin: ['http://localhost:3000', "http://localhost:8081", "*"],
    credentials: true
  },
  typeDefs,
  resolvers,
  dataSources,
  subscriptions: {
    onDisconnect: async (WebSocket, context) => {
      if (WebSocket.upgradeReq.headers.cookie) {
        const cookie = WebSocket.upgradeReq.headers.cookie.split(
          "cribbyToken="
        )[1];
        let user;
        if (cookie) {
          user = authUtil.verifyToken(cookie);
        }
        if (user) {
          const { uuid } = user;
          // console.log(dataSources());
          try {
            await dataSources().userAPI.updateUser({
              uuid,
              isOnline: false,
              lastSeen: new Date(),
            });
          } catch (err) {
            console.log({ err });
          }
        }
      }
    },
    onConnect: async (connectionParams, WebSocket, context) => {
      if (WebSocket.upgradeReq.headers.cookie) {
        const cookie = WebSocket.upgradeReq.headers.cookie.split(
          "cribbyToken="
        )[1];
        const user = authUtil.verifyToken(cookie);
        if (user) {
          const { uuid } = user;
          try {
            await dataSources().userAPI.updateUser({
              uuid,
              isOnline: true,
              lastSeen: new Date(),
            });
          } catch (err) {
            console.log({ err });
          }
        }
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
    // console.log({user});
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

server.applyMiddleware({ app, cors: { origin: ["http://localhost:3000", "http://localhost:8081", "*"], credentials: true } });
const httpServer = http.createServer(app);
server.installSubscriptionHandlers(httpServer);

(async () => {
  await new Promise(resolve => httpServer.listen(process.env.PORT, resolve));
  console.log(`🚀 Server ready at http://${process.env.DOMAIN}${server.graphqlPath}`);
  console.log(`🚀 Subscriptions ready at ws://${process.env.DOMAIN}${server.subscriptionsPath}`);
  return { server, app, httpServer };
})()


// httpServer.listen(process.env.PORT || 4000, () => {
//   console.log(`Server running at ${process.env.PORT}`);
// });

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to the Cribby API",
    graphQLRemote: `https://${process.env.DOMAIN}/graphql`,
    graphQLLocal: `http://${process.env.DOMAIN}/graphql`,
  });
});

app.get('/books', async (req, res) => {
  const books = require('./data/books.json');
  res.status(200).json({
    message: "Get Books Endpoint is working",
    items: books
  })
})
