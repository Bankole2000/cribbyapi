const emailRegex = /^[a-z]+(_|\.)?[a-z0-9]*@[a-z]+\.[a-z]{2,}$/i;
const alphaNumRegex = /^[a-z0-9]+$/i;
const userNameRegex = /^[a-z0-9_]+$/i;

module.exports.isEmail = (emailLike) => {
  return emailLike ? emailRegex.test(emailLike) : false;
};

module.exports.isAlphaNumeric = (alphaNumLike) => {
  return alphaNumLike ? alphaNumRegex.test(alphaNumLike) : false;
};

module.exports.isValidUsername = (usernameLike) => {
  return usernameLike ? userNameRegex.test(usernameLike) : false;
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