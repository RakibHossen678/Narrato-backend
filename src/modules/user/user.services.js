const User = require("../auth/auth.model");

const getUser = async (user) => {
  // Check if the user object has a valid _id
  if (!user._id) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      "Access denied. Insufficient permissions."
    );
  }

  const foundUser = await User.findById(user._id);

  if (!foundUser) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found.");
  }

  return foundUser;
};

module.exports = {
  getUser,
};
