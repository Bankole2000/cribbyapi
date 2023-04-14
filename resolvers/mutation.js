const currencyObject = require("../data/currency.json");
const countyCodeToName = require('../data/countryISO2ToName.json');
const stateArray = require('../data/states.json');
const authUtils = require("../utils/auth");
const validators = require("../utils/validators");
const { checkOrCreateListingImagePath, createResizedImage, storeUpload, deleteFiles } = require("../utils/fileHandlers");
const { createWriteStream, mkdir } = require("fs");
const { AuthenticationError } = require("apollo-server-express");
const { prisma } = require(".prisma/client");
const nodemailer = require("nodemailer");
const { emailMaker } = require("../utils/emailMaker");

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
    res.cookie("cribbyToken", token, {
      httpOnly: false,
      sameSite: "none",
      secure: true,
    });
    try {
      const newUser = { email, username };
      const verificationUrl = `${process.env.API_SERVER_URL}/verify/${token}`;
      const emailText = emailMaker.makeSignupEmailTextOnly(
        newUser,
        verificationUrl
      );
      const emailHTML = emailMaker.makeSignupEmailBody(
        newUser,
        verificationUrl
      );
      const emailToSend = emailMaker.makeEmailParams(
        "🏡 Crippy API",
        email,
        "📧 Just one more step - Verify your email",
        emailText,
        emailHTML
      );
      let transporter = nodemailer.createTransport(emailMaker.transport);
      let info = await transporter.sendMail(emailToSend);
      console.log("Message sent: %s", info.messageId);
    } catch (err) {
      console.log({ err });
    }
    dataSources.userAPI
      .updateUser({ emailVerificationToken: token, uuid })
      .then((data) => {
        console.log("Verification Email Sent", {
          data,
          file: "mutation.js",
          line: 81,
        });
        pubsub.publish("USERSIGNEDUP", { userSignedUp: data });
      });
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

    return dataSources;
  },
  signOut: async (parent, args, { dataSources, req, res, user }, info) => {
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
          console.log(data);
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
    { dataSources, req, res, user, pubsub },
    info
  ) => {
    const { uuid } = user;
    const { baseCurrency: currencyCode, locationCountry: countryCode, locationState: stateCode } = listing;
    if (countryCode) {
      listing.countryName = countyCodeToName[countryCode];
    }
    if (stateCode) {
      const statesOfCountry = stateArray.filter(state => state.country_code == countryCode);
      const specificState = statesOfCountry.find(state => state.state_code == stateCode);
      if (specificState) {
        listing.stateName = specificState.name
      }
    }

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
        where: { code },
      },
    };
    if (listing.houseRules) {
      const { houseRules } = listing;
      if (houseRules.length > 0) {
        listing.houseRules = { create: [] };
        houseRules.forEach((rule) => {
          const { isAllowed, ruleId: id } = rule;
          listing.houseRules.create.push({
            isAllowed,
            rule: {
              connect: {
                id,
              },
            },
          });
        });
      } else {
        delete listing.houseRules;
      }
    }
    if (listing.amenities) {
      const { amenities } = listing;
      if (amenities.length > 0) {
        listing.amenities = { set: [] };
        amenities.forEach((amenityId) => {
          listing.amenities.set.push({ id: amenityId });
        });
      }
    }
    const newListing = await dataSources.listingAPI.createListing({ uuid, listing });
    pubsub.publish('LISTINGADDED', { listingAdded: newListing });
    return newListing;
  },
  updateListing: async (
    parent,
    { listingUUID, updateData },
    { dataSources, user, res, req },
    info
  ) => {
    let uuid = listingUUID;
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
    if (updateData.locationCountry) {
      updateData.countryName = countyCodeToName[updateData.locationCountry];
    }
    if (updateData.locationState) {
      const { locationCountry: countryCode, locationState: stateCode } = updateData;
      const statesOfCountry = stateArray.filter(state => state.country_code == countryCode);
      const specificState = statesOfCountry.find(state => state.state_code == stateCode);
      if (specificState) {
        updateData.stateName = specificState.name
      }
    }
    if (updateData.baseCurrency) {
      const { baseCurrency: currencyCode } = updateData;


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
      updateData.baseCurrency = {
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
          where: { code },
        },
      };
    }
    if (updateData.houseRules) {
      const { houseRules } = updateData;
      if (houseRules.length > 0) {
        await dataSources.listingAPI.deleteListingHouseRules(
          listingToUpdate.id
        );
        updateData.houseRules = { create: [] };
        houseRules.forEach((rule) => {
          const { isAllowed, ruleId: id } = rule;
          updateData.houseRules.create.push({
            isAllowed,
            rule: {
              connect: {
                id,
              },
            },
          });
        });
      } else {
        await dataSources.listingAPI.deleteListingHouseRules(
          listingToUpdate.id
        );
        delete updateData.houseRules;
      }
    }
    if (updateData.amenities) {
      const { amenities } = updateData;
      if (amenities.length > 0) {
        updateData.amenities = { set: [] };
        amenities.forEach((amenityId) => {
          updateData.amenities.set.push({ id: amenityId });
        });
      }
    }
    const updatedListing = await dataSources.listingAPI.updateListing({
      uuid,
      updateData,
    });
    console.log({ updatedListing });
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
  addOrUpdateAmenityCategory: async (
    parent,
    { categoryData },
    { dataSources, pubsub },
    info
  ) => {
    let amenityCategory;
    const { id } = categoryData;
    if (id) {
      categoryData.id = Number(id);
      const existingCategory = await dataSources.amenityAPI.getAmenityCategoryById(
        Number(id)
      );
      if (!existingCategory) {
        throw new Error("No Category with that ID");
      }
      const updatedAmenityCategory = await dataSources.amenityAPI.updateAmenityCategory(
        {
          id: Number(id),
          categoryData,
        }
      );
      pubsub.publish('AMENITYCATEGORYADDED', { amenityCategoryAdded: updatedAmenityCategory })
      return updatedAmenityCategory;
    }
    amenityCategory = await dataSources.amenityAPI.addAmenityCategory(
      categoryData
    );
    pubsub.publish('AMENITYCATEGORYADDED', { amenityCategoryAdded: amenityCategory })
    return amenityCategory;
  },
  deleteAmenityCategory: async (parent, args, { dataSources }, info) => {
    try {
      let deletedCategory = await dataSources.amenityAPI.deleteAmenityCategory(args);
      return deletedCategory
    } catch (err) {
      console.log({ err });
      throw new Error("Unable to delete Category")
    }
  },
  addOrUpdateAmenity: async (
    parent,
    { amenityData },
    { dataSources, pubsub },
    info
  ) => {
    const { id } = amenityData;
    if (id) {
      amenityData.id = Number(id);
      const existingAmenity = dataSources.amenityAPI.getAmenityById(
        amenityData.id
      );
      if (!existingAmenity) {
        throw new Error("No Amenity with this Id");
      }
      const updatedAmenity = await dataSources.amenityAPI.updateAmenity({
        id: Number(id),
        amenityData,
      });
      pubsub.publish('AMENITYADDED', { amenityAdded: updatedAmenity });
      return updatedAmenity;
    }
    const newAmenity = await dataSources.amenityAPI.addAmenity(amenityData);
    pubsub.publish('AMENITYADDED', { amenityAdded: newAmenity });
    return newAmenity;
  },
  deleteAmenity: async (parent, args, { dataSources }, info) => {
    const deletedAmenity = await dataSources.amenityAPI.deleteAmenity(args);
    return deletedAmenity
  },
  addOrUpdateHouseRule: async (
    parent,
    { houseRuleData },
    { dataSources, pubsub },
    info
  ) => {
    const { id } = houseRuleData;
    if (id) {
      houseRuleData.id = Number(id);
      const existingHouseRule = await dataSources.listingAPI.getHouseRuleById(
        houseRuleData.id
      );
      if (!existingHouseRule) {
        throw new Error("No house rule with that ID");
      }
      delete houseRuleData.id;
      const updatedHouseRule = await dataSources.listingAPI.updateHouseRule({
        id: Number(id),
        houseRuleData,
      });
      pubsub.publish('HOUSERULEADDED', { houseRuleAdded: updatedHouseRule })
      return updatedHouseRule;
    }
    const newHouseRule = await dataSources.listingAPI.addHouseRule(
      houseRuleData
    );
    pubsub.publish('HOUSERULEADDED', { houseRuleAdded: newHouseRule })
    return newHouseRule;
  },
  deleteHouseRule: async (parent, { houseRuleId }, { dataSources }, info) => {
    const deletedHouseRule = await dataSources.listingAPI.deleteHouseRule(
      houseRuleId
    );
    return deletedHouseRule;
  },
  addOrUpdateHobby: async (
    parent,
    { hobby: hobbyData },
    { dataSources, pubsub },
    info
  ) => {
    const { id, title, description, emoticon } = hobbyData;
    const hobby = await dataSources.hobbyAPI.createHobby({
      id,
      data: { title, description, emoticon },
    });
    pubsub.publish('HOBBYADDED', { hobbyAdded: hobby })
    return hobby;
  },
  deleteHobby: async (parent, args, { dataSources }, info) => {
    // console.log(args);
    const deletedHobby = await dataSources.hobbyAPI.deleteHobby(args);
    return deletedHobby
  },
  toggleListingPublishedStatus: async (
    parent,
    { listingUUID: uuid },
    { dataSources, user },
    info
  ) => {
    const listingToUpdate = await dataSources.listingAPI.getListingByUUID(uuid);

    if (!listingToUpdate) {
      throw new Error("No listing with this UUID");
    }

    if (
      !(listingToUpdate.owner.uuid === user.uuid) &&
      !user.roles.includes("ADMIN")
    ) {
      throw new AuthenticationError(
        "Can't update - This is not your user profile"
      );
    }
    const { isPublished: isCurrentlyPublished } = listingToUpdate;
    let updatedListing;
    if (isCurrentlyPublished) {
      // TODO: Do necessary checks before unpublishing
      updatedListing = await dataSources.listingAPI.setListingIsPublishedStatus(
        uuid,
        !isCurrentlyPublished
      );
      return updatedListing;
    }
    if (!isCurrentlyPublished) {
      // TODO: Do necessary checks before publishing e.g. basic price and currency set
      updatedListing = await dataSources.listingAPI.setListingIsPublishedStatus(
        uuid,
        !isCurrentlyPublished
      );
      return updatedListing;
    }
  },
  setListingFeaturedImage: async (parent, { file, listingUUID, title, description }, { dataSources }, info) => {
    const { createReadStream, filename, mimetype } = await file;
    if (!validators.isValidImage(mimetype)) {
      throw new Error("Invalid File Type")
    }
    const listing = await dataSources.listingAPI.getListingByUUID(listingUUID);
    if (!listing) {
      throw new Error("No Listing with this UUID");
    }
    console.log(listing.images);
    if (listing.images.length) {
      const oldImage = listing.images.find(image => image.index == 0);
      // Delete old Images 
      if (oldImage) {
        const { filePath, thumbnailPath, mediumPath, largePath } = oldImage;
        await deleteFiles(filePath, thumbnailPath, mediumPath, largePath);
      }
    }

    const paths = await checkOrCreateListingImagePath(listingUUID, filename);
    // console.log(paths);
    const stream = createReadStream();
    file = await storeUpload(stream, filename, mimetype, paths.filePath);
    const sizes = {
      thumbnailPath: 150,
      mediumPath: 640,
      largePath: 1200
    }
    const sizeValues = Object.keys(sizes);
    for (let i = 0; i < sizeValues.length; i++) {
      const size = sizeValues[i];
      await createResizedImage(file, sizes[size], paths[size]);
    }
    listingImage = await dataSources.listingAPI.setListingFeaturedImage(listingUUID, { index: 0, filename: file.filename, title, description, ...paths });

    return { title: listingImage.title, description: listingImage.description, index: listingImage.index, image: { ...listingImage } }
  },
  addListingImage: async (parent, { file, listingUUID, title, description }, { dataSources }, info) => {
    const { createReadStream, filename, mimetype } = await file;
    if (!validators.isValidImage(mimetype)) {
      throw new Error("Invalid File Type")
    }
    const listing = await dataSources.listingAPI.getListingByUUID(listingUUID);
    if (!listing) {
      throw new Error("No Listing with this UUID");
    }
    let index = 0;
    if (listing.images.length) {
      const lastIndex = Math.max(...[...listing.images.map(image => image.index)])
      index = lastIndex + 1;
      console.log({ lastIndex });
    }
    const paths = await checkOrCreateListingImagePath(listingUUID, filename);
    const stream = createReadStream();
    file = await storeUpload(stream, filename, mimetype, paths.filePath);
    const sizes = {
      thumbnailPath: 150,
      mediumPath: 640,
      largePath: 1200
    }
    const sizeValues = Object.keys(sizes);
    for (let i = 0; i < sizeValues.length; i++) {
      const size = sizeValues[i];
      await createResizedImage(file, sizes[size], paths[size]);
    }
    if (index == 0) {
      listingImage = await dataSources.listingAPI.setListingFeaturedImage(listingUUID, { index, filename: file.filename, title, description, ...paths });
      return { title: listingImage.title, description: listingImage.description, index: listingImage.index, image: { ...listingImage } }
    }
    listingImage = await dataSources.listingAPI.addListingImage(listingUUID, { index, filename: file.filename, title, description, ...paths });
    return { title: listingImage.title, description: listingImage.description, index: listingImage.index, image: { ...listingImage } }
  },
  updateListingImageInfo: async (parent, { imageUUID, title, description }, { dataSources }, info) => {
    const updatedImage = await dataSources.listingAPI.updateListingImage(imageUUID, { title, description });
    return { title: updatedImage.title, description: updatedImage.description, index: updatedImage.index, image: { ...updatedImage } };
  },
  deleteListingImage: async (parent, { listingUUID, imageUUID }, { dataSources }, info) => {
    const { updatedImages, imageToDelete } = await dataSources.listingAPI.deleteListingImage(listingUUID, imageUUID);
    if (imageToDelete) {
      const { filePath, thumbnailPath, mediumPath, largePath } = imageToDelete;
      await deleteFiles(filePath, thumbnailPath, mediumPath, largePath);
    }
    if (updatedImages && updatedImages.length) {
      return updatedImages.map(image => {
        return { title: image.title, description: image.description, index: image.index, image: { ...image } }
      })
    }
    return updatedImages;
  },
  addOrUpdateStateRequest: async (parent, { stateData }, { dataSources, pubsub }, info) => {
    console.log({ stateData });
    const stateAddRequest = await dataSources.locationRequestAPI.addOrUpdateStateAddRequest(stateData);
    pubsub.publish('STATEADDREQUESTADDED', { stateAddRequestAdded: stateAddRequest });
    return stateAddRequest
  },
  addOrUpdateCityRequest: async (parent, { cityData }, { dataSources, pubsub }, info) => {
    console.log({ cityData });
    const cityAddRequest = await dataSources.locationRequestAPI.addOrUpdateCityAddRequest(cityData)
    pubsub.publish('CITYADDREQUESTADDED', { cityAddRequestAdded: cityAddRequest });
    return cityAddRequest
  },
  deleteStateAddRequest: async (parent, { stateAddRequestId }, { dataSources }, info) => {
    console.log({ stateAddRequestId });
    const deletedStateAddRequest = await dataSources.locationRequestAPI.deleteStateAddRequest(stateAddRequestId)
    return deletedStateAddRequest
  },
  deleteCityAddRequest: async (parent, { cityAddRequestId }, { dataSources }, info) => {
    console.log({ cityAddRequestId });
    const deletedCityAddRequest = await dataSources.locationRequestAPI.deleteCityAddRequest(cityAddRequestId)
    return deletedCityAddRequest
  }
};
