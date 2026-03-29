import { Router } from "express";
import {
  listNotificationsController,
  markNotificationReadController,
} from "../controllers/notification.controller";
import { requireAuth } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", requireAuth, listNotificationsController);
router.patch(
  "/:notificationId/read",
  requireAuth,
  markNotificationReadController,
);

export default router;
