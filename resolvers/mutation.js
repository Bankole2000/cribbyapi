const { prisma } = require(".prisma/client");
const authUtils = require("../utils/auth");
const validators = require("../utils/validators");
const { AuthenticationError } = require("apollo-server-express");
const { update } = require("lodash");

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
        // signedInUser = await dataSources.userAPI.getUserDetails(uuid);
        signedInUser = await dataSources.userAPI.updateUser({
          uuid,
          lastLogin: new Date(),
          lastSeen: new Date(),
          isOnline: true,
        });
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
        console.log({ cookie: res.cookie.token, line: 175 });
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
  signOut: async (parent, args, { dataSources, req, res, user }, info) => {
    console.log({ user, file: "mutation.js", line: 189 });
    if (user) {
      const { uuid } = user;
      await dataSources.userAPI.updateUser({
        uuid,
        lastSeen: new Date(),
        isOnline: false,
      });
    }
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
  updateUser: async (
    parent,
    { uuid, updateData },
    { dataSources, res, user },
    info
  ) => {
    const userToUpdate = await dataSources.userAPI.getUserByUUID(uuid);
    if (!userToUpdate) {
      throw new Error("No user with that UUID");
    }
    const { email: newEmail, username, dob, gender } = updateData;
    if (newEmail) {
      if (!validators.isEmail(newEmail)) {
        throw new Error("Invalid Email");
      }
      if (newEmail === userToUpdate.email) {
        throw new Error("This is your current email!");
      }
      updateData.email = newEmail.toLowerCase();
      const emailTaken = await dataSources.userAPI.getUserByEmail(
        updateData.email
      );
      if (emailTaken) {
        throw new Error("This email is already registered");
      }
      updateData.emailIsVerified = false;
    }
    if (username) {
      if (!validators.isValidUsername(username)) {
        throw new Error("Invalid Username");
      }
      if (username === userToUpdate.username) {
        throw new Error("This is your current username!");
      }
      const usernameTaken = await dataSources.userAPI.getUserByEmail(
        updateData.username
      );
      if (usernameTaken) {
        throw new Error("Username is already taken");
      }
    }
    if (dob) {
      if (validators.isOfAge(dob) < 18) {
        throw new Error("Must be above 18");
      }
    }
    if (!user) {
      throw new AuthenticationError("You need to be logged in to do this");
    }
    if (!(uuid === user.uuid) && !user.roles.includes("ADMIN")) {
      throw new Error("Can't update - This is not your user profile");
    }
    const updatedUser = await dataSources.userAPI.updateUser({
      uuid,
      ...updateData,
    });
    const { roles, emailIsVerified, id } = updatedUser;
    const token = authUtils.createToken({
      roles,
      uuid,
      emailIsVerified,
      username: updatedUser.username,
      email: updatedUser.email,
      id,
    });
    if (user.uuid === uuid) {
      res.cookie("cribbyToken", token, {
        httpOnly: false,
        sameSite: "none",
        secure: true,
      });
    }
    if (!updatedUser.emailIsVerified) {
      await dataSources.userAPI
        .updateUser({ uuid: updatedUser.uuid, emailVerificationToken: token })
        .then((data) => {
          // TODO: Send user email Confirmation to new email address
          console.log(data);
        });
    }
    return updatedUser;
  },
  updateUserProfile: async (
    parent,
    { uuid, updateData },
    { dataSources, user, res, req },
    info
  ) => {
    const userToUpdate = await dataSources.userAPI.getUserByUUID(uuid);
    if (!userToUpdate) {
      throw new Error("No user with that UUID");
    }
    if (!user) {
      throw new AuthenticationError("You need to be logged in to do this");
    }
    if (!(uuid === user.uuid) && !user.roles.includes("ADMIN")) {
      throw new AuthenticationError(
        "Can't update - This is not your user profile"
      );
    }
    if (updateData.firstname && !validators.isValidName(updateData.firstname)) {
      throw new Error(
        "Invalid firstname - Must be letters only (hyphenated names allowed e.g John-Doe)"
      );
    }
    if (updateData.lastname && !validators.isValidName(updateData.lastname)) {
      throw new Error(
        "Invalid lastname - Must be letters only (hyphenated names allowed e.g John-Doe)"
      );
    }
    if (updateData.phone && !validators.isValidPhoneNumber(updateData.phone)) {
      throw new Error(
        "Invalid Phone number - Should be numbers only (- and + allowed)"
      );
    }

    if (
      userToUpdate.profile?.phone &&
      updateData.phone === userToUpdate.profile?.phone
    ) {
      throw new Error("This is your current Phone Number");
    }

    if (updateData.phone) {
      updateData.phoneIsVerified = false;
    }

    console.log(validators.isNotEmpty(updateData.bio), {
      hasBio: Boolean(updateData.bio),
    });
    if (updateData.bio && !validators.isNotEmpty(updateData.bio)) {
      throw new Error("Bio cannot be empty");
    }

    const updatedUser = await dataSources.userAPI.updateUserProfile({
      uuid,
      updateData,
    });
    if (!updatedUser.profile.phoneIsVerified) {
      // TODO: Verify Phone Number - Twillio API
    }

    return updatedUser;
  },
  createOrUpdateHobby: async (
    parent,
    { hobby: hobbyData },
    { dataSources },
    info
  ) => {
    const { id, title, description, emoticon } = hobbyData;
    const hobby = await dataSources.hobbyAPI.createHobby({
      id,
      data: { title, description, emoticon },
    });

    return hobby;
  },
};
