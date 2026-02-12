const express = require("express");
const {
  createUserHandler,
  userLoginHandler,
  loginWithGoogleHandler,
  forgotPassword,
  verifyOtp,
  resetPassword,
} = require("./auth.controller");
const router = express.Router();

// Route to sign up a new normal user
router.post("/register", createUserHandler);

// Route to sign up a new normal user
router.post("/login", userLoginHandler);

// Route to login or register with google oauth
router.get("/google", loginWithGoogleHandler);

// Route to initiate the forgot password process by sending an OTP
router.post("/forgot-password", forgotPassword);

// Route to verify the OTP sent to the user's email
router.post("/verify-otp", verifyOtp);

// Route to reset the user's password after verifying the OTP
router.post("/reset-password", resetPassword);

module.exports = router;
