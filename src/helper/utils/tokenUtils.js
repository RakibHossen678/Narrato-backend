const jwt = require("jsonwebtoken");
const config = require("../../config/config");
const secretKey = config.jwt_secret_key;

const generateToken = function (userId, role) {
  const token = jwt.sign({ userId: userId, role: role }, secretKey, {
    expiresIn: "1h",
  });
  return token;
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, secretKey);
  } catch (err) {
    return null;
  }
};

module.exports = {
  generateToken,
  verifyToken,
};
