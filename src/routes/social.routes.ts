import { Router } from "express";
import { body } from "express-validator";
import {
  bookmarkController,
  followController,
  reactBlogController,
  reportController,
  unfollowController,
} from "../controllers/social.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { validateRequest } from "../middlewares/validation.middleware";

const router = Router();

router.post("/follow/:userId", requireAuth, followController);
router.delete("/follow/:userId", requireAuth, unfollowController);
router.post(
  "/blog/:blogId/react",
  requireAuth,
  body("reaction").isIn(["like", "dislike"]),
  validateRequest,
  reactBlogController,
);
router.post("/blog/:blogId/bookmark", requireAuth, bookmarkController);
router.post(
  "/report",
  requireAuth,
  body("targetType").isIn(["blog", "comment", "user"]),
  body("targetId").isString(),
  body("reason").isLength({ min: 4 }),
  validateRequest,
  reportController,
);

export default router;
