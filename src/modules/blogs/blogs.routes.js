const express = require("express");
const multer = require("multer");

const authMiddleware = require("../../middlewares/authMiddleware");
const blogsController = require("./blogs.controller");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Blog CRUD + feed routes
router.post(
  "/",
  authMiddleware("user", "admin"),
  blogsController.createBlogHandler,
);
router.get("/", blogsController.getAllBlogsHandler);
router.get("/:blogId", blogsController.getSingleBlogHandler);
router.get("/slug/:slug", blogsController.getSingleBlogHandlerBySlug);
router.put(
  "/:blogId",
  authMiddleware("user", "admin"),
  blogsController.updateBlogHandler,
);
router.delete(
  "/:blogId",
  authMiddleware("user", "admin"),
  blogsController.deleteBlogHandler,
);

// Interaction routes
router.patch(
  "/:blogId/bookmark",
  authMiddleware("user", "admin"),
  blogsController.toggleBookmarkHandler,
);
router.post("/:blogId/share", blogsController.incrementShareHandler);
router.post(
  "/upload-image",
  authMiddleware("user", "admin"),
  upload.single("image"),
  blogsController.uploadBlogImageHandler,
);

// PATCH /api/v1/blogs/:blogId/vote
// body: { "vote": "up" | "down" }
router.patch(
  "/:blogId/vote",
  authMiddleware(),
  blogsController.voteOnBlogHandler,
);

module.exports = router;
