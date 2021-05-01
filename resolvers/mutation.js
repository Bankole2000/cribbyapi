const authUtils = require("../utils/auth");
const validators = require("../utils/validators");

module.exports = {
  signUp: async (
    parent,
    { credentials },
    { dataSources, res, pubsub },
    info
  ) => {
    const { email, password, username, dob, gender, tos } = credentials;
    // Check if user data is valid
    if (!validators.isEmail(email)) {
      throw new Error("Invalid Email");
    }
    if (!validators.isValidUsername(username)) {
      throw new Error("Invalid Username");
    }
    if (validators.isOfAge(dob) < 18) {
      throw new Error("Must be above 18");
    }
    if (!tos) {
      throw new Error("Must accept Terms of Service");
    }
    const userCredentials = {
      email: email.toLowerCase(),
      password,
      username,
      dob: new Date(dob),
      tos,
      gender,
    };
    const emailTaken = await dataSources.userAPI.getUserByEmail(
      userCredentials.email
    );
    if (emailTaken) {
      throw new Error("Email is already taken");
    }
    const usernameTaken = await dataSources.userAPI.getUserByUsername(
      userCredentials.username
    );
    if (usernameTaken) {
      throw new Error("Username is already taken");
    }
    // Encrypt password
    const hash = authUtils.hashPassword(userCredentials.password);
    userCredentials.hash = hash;

    userCredentials.roles = ["USER"];

    userCredentials.email == "techybanky@gmail.com"
      ? userCredentials.roles.push("ADMIN")
      : "";

    // Create user in db
    console.log(userCredentials);
    const createdUser = await dataSources.userAPI.createUser(userCredentials);
    // create token and send
    const { roles, uuid, emailIsVerified, id } = createdUser;
    const token = authUtils.createToken({
      roles,
      uuid,
      emailIsVerified,
      username,
      email,
      id,
    });
    console.log({ res, line: 57 });
    res.cookie("cribbyToken", token, {
      httpOnly: false,
      sameSite: "none",
      secure: true,
    });
    if (!emailIsVerified) {
      dataSources.userAPI
        .updateUser({ emailVerificationToken: token, uuid })
        .then((data) => {
          // Send Verification Link to Email
          console.log("Verification Email Sent", { data });
          pubsub.publish("USERSIGNEDUP", { userSignedUp: data });
        });
    }
    return { token, user: { email, uuid, username, roles, emailIsVerified } };
  },
  signIn: async (
    parent,
    { credentials },
    { dataSources, req, res, pubsub },
    info
  ) => {
    let { email, password, username } = credentials;

    email = email ? email.toLowerCase() : null;
    username = username ? username : null;
    let signedInUser;
    if (email) {
      if (!validators.isEmail(email)) {
        throw new Error("Invalid Email");
      }
      const existingUser = await dataSources.userAPI.getUserByEmail(email);
      if (!existingUser) {
        throw new Error("No user with this email");
      }
      const validPassword = authUtils.verifyPassword(
        password,
        existingUser.password
      );
      if (validPassword) {
        let { uuid } = existingUser;
        signedInUser = await dataSources.userAPI.getUserDetails(uuid);
        let { roles, emailIsVerified, username, email, id } = signedInUser;
        const token = authUtils.createToken({
          roles,
          uuid,
          emailIsVerified,
          username,
          email,
          id,
        });
        res.cookie("cribbyToken", token, {
          httpOnly: false,
          sameSite: "none",
          secure: true,
        });
        // res.cookie("name", "tobi", {
        //   domain: "http://localhost:5000",
        //   path: "/page",
        //   secure: true,
        // });
        // res.cookie(
        //   "some_cross_domain_cookie",
        //   "http://localhost:5500/page.html",
        //   { domain: "http://localhost:5000" }
        // );
        console.log({ token, line: 118 });
        pubsub.publish("USERLOGGEDIN", { userLoggedIn: signedInUser });
        return {
          token,
          user: signedInUser,
        };
      } else {
        throw new Error("Incorrect Password");
      }
    }
    if (username) {
      if (!validators.isValidUsername(username)) {
        throw new Error("Invalid Username");
      }
      const existingUser = await dataSources.userAPI.getUserByUsername(
        username
      );
      if (!existingUser) {
        throw new Error("No user with this username");
      }
      const validPassword = authUtils.verifyPassword(
        password,
        existingUser.password
      );
      if (validPassword) {
        let { uuid } = existingUser;
        signedInUser = await dataSources.userAPI.getUserDetails(uuid);
        let { roles, emailIsVerified, username, email, id } = signedInUser;
        console.log({ signedInUser });
        const token = authUtils.createToken({
          roles,
          uuid,
          emailIsVerified,
          username,
          email,
          id,
        });

        res.cookie("cribbyToken", token, {
          httpOnly: false,
          sameSite: "none",
          secure: true,
        });
        console.log({ cookie: res.cookie.token, line: 149 });
        pubsub.publish("USERLOGGEDIN", { userLoggedIn: signedInUser });
        return {
          token,
          user: signedInUser,
        };
      } else {
        throw new Error("Incorrect Password");
      }
    }

    return dataSources;
  },
  signOut: async (parent, args, { dataSources, req, res }, info) => {
    console.log({ res, line: 162 });

    res.clearCookie("cribbyToken");
    return {
      token: null,
      user: null,
    };
  },
  deleteUser: async (parent, { uuid }, context, info) => {
    const userToDelete = await context.dataSources.userAPI.getUserByUUID(uuid);
    if (!userToDelete) {
      throw new Error("No User with that UUID");
    }
    return context.dataSources.userAPI.deleteUser({ uuid });
  },
};
