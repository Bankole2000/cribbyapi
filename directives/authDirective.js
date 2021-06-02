const {
  SchemaDirectiveVisitor,
  AuthenticationError,
} = require("apollo-server-express");

class RequiresLogin extends SchemaDirectiveVisitor {
  visitFieldDefinition(field, details) {
    const { resolve } = field;
    field.resolve = async function (...args) {
      const context = args[2];
      const user = context.user;
      if (!user) {
        throw new AuthenticationError("You need to be logged in");
      }
      return resolve.apply(this, args);
    };
  }
}

class RequiresAdmin extends SchemaDirectiveVisitor {
  visitFieldDefinition(field, details) {
    const { resolve } = field;
    field.resolve = async function (...args) {
      const context = args[2];
      const user = context.user;
      if (!user.roles.includes("ADMIN")) {
        throw new AuthenticationError("Requires Admin Role");
      }
      return resolve.apply(this, args);
    };
  }
}

class RequiresSupport extends SchemaDirectiveVisitor {
  visitFieldDefinition(field, details) {
    const { resolve } = field;
    field.resolve = async function (...args) {
      const context = args[2];
      const user = context.user;

      if (!user.roles.includes("SUPPORT") && !user.roles.includes("ADMIN")) {
        throw new AuthenticationError("Requires Support Role");
      }
      return resolve.apply(this, args);
    };
  }
}

class RequiresOwnership extends SchemaDirectiveVisitor {
  visitFieldDefinition(field, details) {
    const { resolve } = field;
    field.resolve = async function (...args) {
      const context = args[2];
      const user = context.user;

      if (!user) {
        throw new AuthenticationError("Requires Resource Ownership");
      }
      return resolve.apply(this, args);
    };
  }
}

module.exports = {
  RequiresLogin,
  RequiresAdmin,
  RequiresSupport,
  RequiresOwnership,
};
