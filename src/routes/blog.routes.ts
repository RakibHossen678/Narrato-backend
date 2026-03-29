import { Router } from "express";
import { body } from "express-validator";
import {
  createBlogController,
  deleteBlogController,
  followingFeedController,
  getBlogBySlugController,
  listBlogsController,
  trendingBlogsController,
  updateBlogController,
} from "../controllers/blog.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { validateRequest } from "../middlewares/validation.middleware";

const router = Router();

router.get("/", listBlogsController);
router.get("/trending", trendingBlogsController);
router.get("/feed/following", requireAuth, followingFeedController);
router.get("/:slug", getBlogBySlugController);

router.post(
  "/",
  requireAuth,
  body("title").isLength({ min: 3 }),
  body("summary").isLength({ min: 10 }),
  body("content").isString(),
  body("tags").isArray(),
  validateRequest,
  createBlogController,
);

router.patch("/:blogId", requireAuth, updateBlogController);
router.delete("/:blogId", requireAuth, deleteBlogController);

export default router;
