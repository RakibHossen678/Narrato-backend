const express = require("express");
const authMiddleware = require("../../middlewares/authMiddleware");
const { getUserHandler } = require("./user.controller");
const router = express.Router();

// Route to get user details
router.get("/me", authMiddleware("user", "admin"), getUserHandler);

module.exports = router;
