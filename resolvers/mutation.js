const currencyObject = require("../data/currency.json");
const authUtils = require("../utils/auth");
const validators = require("../utils/validators");
const { AuthenticationError } = require("apollo-server-express");

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
    console.log({ res, file: "mutation.js", line: 67 });
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
          console.log("Verification Email Sent", {
            data,
            file: "mutation.js",
            line: 81,
          });
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
        console.log({ signedInUser, file: "mutation.js", line: 162 });
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
        console.log({ cookie: res.cookie.token, line: 177 });
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
    console.log({ user, file: "mutation.js", line: 190 });
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
  deleteUser: async (parent, { userUUID: uuid }, context, info) => {
    const userToDelete = await context.dataSources.userAPI.getUserByUUID(uuid);
    // TODO: User with Listings that have active bookings cannot delete account
    if (!userToDelete) {
      throw new Error("No User with that UUID");
    }
    return context.dataSources.userAPI.deleteUser({ uuid });
  },
  updateUser: async (
    parent,
    { userUUID: uuid, updateData },
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
          console.log({ data, file: "mutation.js", line: 290 });
        });
    }
    return updatedUser;
  },
  updateUserProfile: async (
    parent,
    { userUUID: uuid, updateData },
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

    if (
      Object.keys(updateData).includes("bio") &&
      !validators.isNotEmpty(updateData.bio)
    ) {
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
  addListing: async (
    parent,
    { listing },
    { dataSources, req, res, user },
    info
  ) => {
    const { uuid } = user;
    const { baseCurrency: currencyCode } = listing;
    if (!currencyCode) {
      throw new Error("Listing requires a base currency");
    }
    if (!currencyObject[currencyCode]) {
      throw new Error("Invalid Currency");
    }
    const {
      symbol,
      name,
      symbol_native,
      decimal_digits,
      rounding,
      code,
      name_plural,
    } = currencyObject[currencyCode];
    listing.baseCurrency = {
      connectOrCreate: {
        create: {
          symbol,
          name,
          code,
          rounding: Number(rounding),
          decimalDigits: Number(decimal_digits),
          nativeSymbol: symbol_native,
          pluralName: name_plural,
        },
        // update: {
        //   symbol,
        //   name,
        //   code,
        //   rounding,
        //   decimalDigits: decimal_digits,
        //   nativeSymbol: symbol_native,
        //   pluralName: name_plural,
        // },
        where: { code },
      },
    };

    const newListing = dataSources.listingAPI.createListing({ uuid, listing });
    return newListing;
  },
  updateListing: async (
    parent,
    { listingUUID: uuid, updateData },
    { dataSources, user, res, req },
    info
  ) => {
    const listingToUpdate = await dataSources.listingAPI.getListingByUUID(uuid);
    if (!listingToUpdate) {
      throw new Error("No Listing with that UUID");
    }
    if (
      listingToUpdate.owner.uuid !== user.uuid &&
      !user.roles.includes("ADMIN")
    ) {
      throw new AuthenticationError("You do not own this Listing");
    }
    if (
      Object.keys(updateData).includes("title") &&
      !validators.isNotEmpty(updateData.title)
    ) {
      throw new Error("Listing Title Cannot be empty");
    }
    const updatedListing = await dataSources.listingAPI.updateListing({
      uuid,
      updateData,
    });
    return updatedListing;
  },
  deleteListing: async (
    parent,
    { listingUUID: uuid },
    { dataSources },
    info
  ) => {
    const listingToDelete = await dataSources.listingAPI.getListingByUUID(uuid);
    if (!listingToDelete) {
      throw new Error("No Listing with this UUID");
    }
    const deletedListing = await dataSources.listingAPI.deleteListing(uuid);
    return deletedListing;
  },
  addOrUpdateHobby: async (
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
