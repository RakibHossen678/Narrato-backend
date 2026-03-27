const express = require("express");
const authMiddleware = require("../../middlewares/authMiddleware");
const subscriberController = require("./subscriber.controller");

const router = express.Router();

router.patch(
  "/:ownerId/toggle",
  authMiddleware("user", "admin"),
  subscriberController.toggleSubscriptionHandler,
);
router.get(
  "/:ownerId/followers",
  subscriberController.getFollowersByOwnerIdHandler,
);
router.get(
  "/:userId/following",
  authMiddleware("user", "admin"),
  subscriberController.getFollowingByUserIdHandler,
);

module.exports = router;
