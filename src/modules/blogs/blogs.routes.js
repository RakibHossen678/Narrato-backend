const express = require("express");

const authMiddleware = require("../../middlewares/authMiddleware");
const blogsController = require("./blogs.controller");

const router = express.Router();

// Routes
// router.post("/save-blog", saveBlogHandler);
// router.get("/get-all-blogs", getAllBlogsHandler);
// router.get("/get-single-blog/:blogId", getSingleBlogHandler);
// router.get("/get-single-blog-by-title/:slug", getSingleBlogHandlerBySlug);
// router.put("/update-blog/:blogId", updateBlogHandler);
// router.delete("/delete-blog/:blogId", deleteBlogHandler);

// PATCH /api/v1/blogs/:blogId/vote
// body: { "vote": "up" | "down" }
router.patch(
  "/:blogId/vote",
  authMiddleware(),
  blogsController.voteOnBlogHandler,
);

module.exports = router;
