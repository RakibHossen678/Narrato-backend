const express = require("express");
const authMiddleware = require("../../middlewares/authMiddleware");
const commentsController = require("./comments.controller");

const router = express.Router();

// POST /api/v1/comments
// body: { "blogId": "BLG...", "content": "..." }
router.post("/", authMiddleware(), commentsController.createCommentHandler);

// POST /api/v1/comments/:commentId/replies
// body: { "content": "..." }
router.post(
  "/:commentId/replies",
  authMiddleware(),
  commentsController.replyToCommentHandler,
);

// GET /api/v1/comments?blogId=BLG...&page=1&limit=20
// Lists root comments for a blog (parentCommentId=null)
router.get("/", commentsController.listRootCommentsByBlogHandler);

// GET /api/v1/comments/:commentId/replies?page=1&limit=20
// Lists direct replies to a comment (parentCommentId=:commentId)
router.get("/:commentId/replies", commentsController.listRepliesHandler);

// GET /api/v1/comments/threads/:rootCommentId?page=1&limit=200
// Lists a whole thread by rootCommentId
router.get("/threads/:rootCommentId", commentsController.listThreadHandler);

// PATCH /api/v1/comments/:commentId/vote
// body: { "vote": "up" | "down" }
router.patch(
  "/:commentId/vote",
  authMiddleware(),
  commentsController.voteOnCommentHandler,
);

module.exports = router;
