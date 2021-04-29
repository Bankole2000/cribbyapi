module.exports = {
  allUsers: (parent, args, context, info) => {
    return context.dataSources.userAPI.getAllUsers(args);
  },
};
