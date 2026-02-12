const catchAsync = require("../../helper/utils/catchAsync");
const sendResponse = require("../../helper/utils/sendResponse");
const { StatusCodes } = require("http-status-codes");
const userServices = require("./auth.services");

const createUserHandler = catchAsync(async (req, res) => {
  const user = await userServices.createUser(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "User created successfully",
    data: user,
  });
});

const userLoginHandler = catchAsync(async (req, res) => {
  const result = await userServices.userLogin(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "User logged in successfully",
    data: result,
  });
});

const loginWithGoogleHandler = catchAsync(async (req, res) => {
  const result = await userServices.loginWithGoogle(req.query);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "User logged in with google successfully",
    data: result,
  });
});

// Forgot password handler
const forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;
  const user = await userServices.findUserWithEmail(email);

  if (user) {
    await userServices.sendOtp(email);
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "OTP sent to your email.",
      data: email,
    });
  } else {
    sendResponse(res, {
      statusCode: StatusCodes.NOT_FOUND,
      success: false,
      message: "Invalid email address.",
      data: {},
    });
  }
});

// Handler to verify OTP
const verifyOtp = catchAsync(async (req, res) => {
  const { email, otp } = req.body;

  const valid = await userServices.verifyOtp(email, otp);
  if (valid) {
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "OTP verified. You can now reset your password.",
      data: {},
    });
  } else {
    sendResponse(res, {
      statusCode: StatusCodes.BAD_REQUEST,
      success: false,
      message: "Invalid or expired OTP.",
      data: {},
    });
  }
});

// handler to reset password
const resetPassword = catchAsync(async (req, res) => {
  const { email, newPassword } = req.body;
  const result = await userServices.resetPassword(email, newPassword);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: result.message,
    data: result,
  });
});

module.exports = {
  createUserHandler,
  userLoginHandler,
  loginWithGoogleHandler,
  verifyOtp,
  resetPassword,
  forgotPassword,
};
