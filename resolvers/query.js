module.exports = {
  allUsers: (parent, args, context, info) => {
    return context.dataSources.userAPI.getAllUsers(args);
  },
  me: (parent, args, { dataSources, user, req, res }, info) => {
    if (user) {
      return dataSources.userAPI.getUserDetails(user.uuid);
    }
    return {
      user: undefined,
    };
  },
};
