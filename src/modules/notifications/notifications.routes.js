const express = require("express");
const authMiddleware = require("../../middlewares/authMiddleware");
const notificationsController = require("./notifications.controller");

const router = express.Router();

router.get(
  "/",
  authMiddleware("user", "admin"),
  notificationsController.listNotificationsHandler,
);
router.patch(
  "/:notificationId/read",
  authMiddleware("user", "admin"),
  notificationsController.markAsReadHandler,
);
router.patch(
  "/read-all",
  authMiddleware("user", "admin"),
  notificationsController.markAllAsReadHandler,
);
router.get(
  "/stream",
  authMiddleware("user", "admin"),
  notificationsController.streamNotificationsHandler,
);

module.exports = router;
