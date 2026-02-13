const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: [true, "User ID is required"],
    },
    blogId: {
      type: String,
      unique: true,
      required: [true, "Blog ID is required"],
      index: true,
    },
    commentId: {
      type: String,
      unique: true,
      required: [true, "Comment ID is required"],
      index: true,
    },
    content: {
      type: String,
      required: [true, "Content is required"],
    },
    reply: [
      {
        userId: {
          type: String,
          required: [true, "User ID is required"],
        },
        content: {
          type: String,
          required: [true, "Content is required"],
        },
      },
    ],
    votes: [
      {
        upvote: {
          type: Number,
          default: 0,
        },
        downvote: {
          type: Number,
          default: 0,
        },
      },
    ],
  },
  { timestamps: true },
);

CommentSchema.plugin(customIdGenerator, {
  field: "commentId",
  prefix: "CMT",
  enableCondition: (comment) => !!comment.blogId,
});

const Comment = mongoose.model("Comment", CommentSchema);

module.exports = Comment;
