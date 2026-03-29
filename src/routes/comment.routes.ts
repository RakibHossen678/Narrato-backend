import { Router } from "express";
import { body } from "express-validator";
import {
  createCommentController,
  deleteCommentController,
  listCommentsController,
  reactCommentController,
} from "../controllers/comment.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { validateRequest } from "../middlewares/validation.middleware";

const router = Router();

router.get("/:blogId", listCommentsController);
router.post(
  "/:blogId",
  requireAuth,
  body("content").isLength({ min: 1 }),
  validateRequest,
  createCommentController,
);
router.delete("/item/:commentId", requireAuth, deleteCommentController);
router.post(
  "/item/:commentId/react",
  requireAuth,
  body("reaction").isIn(["like", "dislike"]),
  validateRequest,
  reactCommentController,
);

export default router;
