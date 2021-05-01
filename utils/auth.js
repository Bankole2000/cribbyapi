const JWT = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const createToken = (userInfo) => {
  return JWT.sign(userInfo, process.env.SECRET);
};

const verifyPassword = (attemptedPwd, hashedPwd) => {
  return bcrypt.compareSync(attemptedPwd, hashedPwd);
};

const verifyToken = (token) => JWT.verify(token, process.env.SECRET);

const hashPassword = (password) => {
  const salt = bcrypt.genSaltSync();
  return bcrypt.hashSync(password, salt);
};

module.exports = { createToken, verifyPassword, hashPassword, verifyToken };
