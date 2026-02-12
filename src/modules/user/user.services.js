const { StatusCodes } = require("http-status-codes");
const AppError = require("../../errors/AppError");
const User = require("../auth/auth.model");

const getUser = async (user) => {
  // Check if the user object has a valid userId
  if (!user.userId) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      "Access denied. Insufficient permissions.",
    );
  }

  const foundUser = await User.findOne({ userId: user.userId });

  if (!foundUser) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found.");
  }

  return foundUser;
};

module.exports = {
  getUser,
};
