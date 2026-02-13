const express = require("express");
const authMiddleware = require("../../middlewares/authMiddleware");
const commentsController = require("./comments.controller");

const router = express.Router();

// PATCH /api/v1/comments/:commentId/vote
// body: { "vote": "up" | "down" }
router.patch(
  "/:commentId/vote",
  authMiddleware(),
  commentsController.voteOnCommentHandler,
);

module.exports = router;
