const emailRegex = /^[a-z]+(_|\.)?[a-z0-9]*@[a-z]+\.[a-z]{2,}$/i;
const alphaNumRegex = /^[a-z0-9]+$/i;
const userNameRegex = /^[a-z0-9_]+$/i;
const nameRegex = /^[a-z-]+$/i;
const phoneRegex = /^[0-9-+]+$/i;
const validStringRegex = /([^\s])/;
const URLRegex = /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z0-9\u00a1-\uffff][a-z0-9\u00a1-\uffff_-]{0,62})?[a-z0-9\u00a1-\uffff]\.)+(?:[a-z\u00a1-\uffff]{2,}\.?))(?::\d{2,5})?(?:[/?#]\S*)?$/i;

module.exports.isEmail = (emailLike) => {
  return emailLike ? emailRegex.test(emailLike) : false;
};

module.exports.isAlphaNumeric = (alphaNumLike) => {
  return alphaNumLike ? alphaNumRegex.test(alphaNumLike) : false;
};

module.exports.isValidUsername = (usernameLike) => {
  return usernameLike ? userNameRegex.test(usernameLike) : false;
};

module.exports.isValidName = (nameLike) => {
  return nameLike ? nameRegex.test(nameLike) : false;
};

module.exports.isValidPhoneNumber = (phoneNumberLike) => {
  return phoneNumberLike ? phoneRegex.test(phoneNumberLike) : false;
};

module.exports.isNotEmpty = (stringLike) => {
  return stringLike ? validStringRegex.test(stringLike) : false;
};

module.exports.isOfAge = (dateLike) => {
  if (Date.parse(dateLike)) {
    const dob = new Date(dateLike);
    let ageDiff = Date.now() - dob.getTime();
    ageDiff = new Date(ageDiff);
    return Math.abs(ageDiff.getUTCFullYear() - 1970);
  }
  return false;
};

module.exports.isOverADayOld = (lastUpdate) => {
  return lastUpdate ? Date.now() - Date.parse(lastUpdate) > 86400000 * 4 : false;
};

module.exports.isValidImage = (mimetype) => {
  const validMimeTypes = {
    jpg: "image/jpg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    png: "image/png",
    svg: "image/svg+xml",
    webp: "image/webp",
    bmp: "image/bmp"
  }
  return mimetype ? validMimeTypes[mimetype.split('/')[1]] : false;
}

module.exports.isValidURl = (urlLike) => {
  return urlLike ? URLRegex.test(urlLike) : false;
}
