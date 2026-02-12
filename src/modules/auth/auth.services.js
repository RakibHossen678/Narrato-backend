const { StatusCodes } = require("http-status-codes");
const AppError = require("../../errors/AppError");
const { generateToken } = require("../../helper/utils/tokenUtils");
const User = require("./auth.model");
const OtpModel = require("../../helper/otpSchema");
const { oauth2Client } = require("../../helper/utils/googleConfig");
const { default: axios } = require("axios");
const { sendMailForOTP } = require("../../helper/mailing");
const { htmlTemplate } = require("../../helper/emailTemplate/otpTemplate");
const bcrypt = require("bcryptjs");
const generateRandomPassword = require("../../utils/generateRandomPassword");

// Creates a new user in the database.
const createUser = async (data) => {
  if (!data.password) {
    data.password = generateRandomPassword();
  }
  const user = await User.create(data);
  const token = generateToken(user.userId, user.role);

  return { user, token };
};

// The login data containing email and password.
const userLogin = async (data) => {
  // Find the user by email and explicitly select the password field
  const user = await User.findOne({ email: data.email }).select("+password");

  // If user not found, stop early
  if (!user) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "Invalid email or password.");
  }

  // Compare entered password with stored hashed password
  const isPasswordMatch = await bcrypt.compare(data.password, user.password);

  if (!isPasswordMatch) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "Invalid email or password.");
  }

  // Remove the password field from the returned user object
  const { password, ...userWithoutPassword } = user.toObject();

  const token = generateToken(user.userId, user.role);

  return { token, user: userWithoutPassword };
};

// Logs in or registers a user via Google OAuth.
const loginWithGoogle = async (data) => {
  // Exchange the authorization code for access tokens
  const googleResponse = await oauth2Client.getToken(data.code);
  oauth2Client.setCredentials(googleResponse.tokens); // Set the retrieved tokens for OAuth2 client

  // Fetch user information from Google's API
  const userResponse = await axios.get(
    `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleResponse.tokens.access_token}`,
  );

  const { email, name, id } = userResponse?.data;

  // Check if user already exists in the database
  let user = await User.findOne({ email });

  // If user exists, return existing user and generate a token
  if (user) {
    const token = generateToken(user.userId, user.role);
    return { token, user };
  }

  // If user doesn't exist, create a new one
  const password = generateRandomPassword();
  user = await User.create({ email, name, password, googleId: id });

  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not created successfully");
  }

  const token = generateToken(user.userId, user.role);
  return { token, user };
};

// Get the user profile from database
// The user object containing the user's id and role.
const getUser = async (user) => {
  // Check if the user object has a valid userId
  if (!user.userId) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      "Access denied. Insufficient permissions.",
    );
  }

  const foundUser = await User.findById(user.userId);

  if (!foundUser) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found.");
  }

  return foundUser;
};

// Finds a user by their email.
const findUserWithEmail = async (email) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found");
  }
  return user;
};

// Generates a 6-digit OTP (One Time Password).
const generateOtp = () => {
  // Generate a 6-digit OTP by generating a random number between 100000 and 999999
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Sends an OTP email to the user for password reset.
const sendOtp = async (email) => {
  const otp = generateOtp();

  // OTP expiration time (10 minutes from now)
  const expiresAt = new Date(Date.now() + 10 * 60000);

  const record = new OtpModel({ email, otp, expiresAt });
  await record.save();

  // HTML template for the OTP email

  // Send the OTP email to the user using the sendMailForOTP function
  await sendMailForOTP(
    email,
    "Password Reset OTP",
    `Your OTP is: ${otp}`,
    htmlTemplate(otp),
  );

  return otp;
};

// Function to verify OTP for password reset
const verifyOtp = async (email, otp) => {
  const record = await OtpModel.findOne({ email, otp });

  // Check if the OTP is valid and not expired
  if (record && record.expiresAt > new Date()) {
    // Delete the OTP record after it has been successfully used
    await OtpModel.deleteOne({ userId: record.userId });
    return true;
  }

  // Return false if OTP is invalid or expired
  return false;
};

// function to reset password (securely hashes the new password)
const resetPassword = async (rawEmail, newPassword) => {
  if (!rawEmail || !newPassword) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Invalid request.",
      "Both email and new password are required.",
    );
  }

  // Basic password rule (matches your schema minLength: 8)
  if (newPassword.length < 8) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Password too short.",
      "Password must be at least 8 characters long.",
    );
  }

  const email = String(rawEmail).toLowerCase().trim();

  // Find active user and include password so pre('save') can replace it
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "User not found.",
      `The user with email "${email}" does not exist.`,
    );
  }

  // Assign and save to trigger the pre('save') hash hook
  user.password = newPassword;
  await user.save();

  // (Optional) If you keep OTPs in a separate collection, you could clear any leftovers:
  await OtpModel.deleteMany({ email });

  return {
    status: StatusCodes.OK,
    message: "Password reset successfully.",
    email: user.email,
  };
};

module.exports = {
  createUser,
  userLogin,
  getUser,
  loginWithGoogle,
  sendOtp,
  verifyOtp,
  resetPassword,
  findUserWithEmail,
};
