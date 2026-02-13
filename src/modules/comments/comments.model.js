const mongoose = require("mongoose");
const customIdGenerator = require("../../utils/customIdGenerator");

const CommentSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: [true, "User ID is required"],
    },
    blogId: {
      type: String,
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
    // Track *who* voted so you can prevent repeat votes and allow undo/switch.
    // (Stored as userId strings to match the rest of the schema.)
    votes: {
      upvoters: {
        type: [String],
        default: [],
      },
      downvoters: {
        type: [String],
        default: [],
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// TODO: User can share a blog post on social media platforms

CommentSchema.plugin(customIdGenerator, {
  field: "commentId",
  prefix: "CMT",
  enableCondition: (comment) => !!comment.blogId,
});

CommentSchema.virtual("upvotesCount").get(function () {
  const upvoters = Array.isArray(this?.votes?.upvoters) ? this.votes.upvoters : [];
  return upvoters.length;
});

CommentSchema.virtual("downvotesCount").get(function () {
  const downvoters = Array.isArray(this?.votes?.downvoters)
    ? this.votes.downvoters
    : [];
  return downvoters.length;
});

CommentSchema.virtual("score").get(function () {
  const up = Array.isArray(this?.votes?.upvoters) ? this.votes.upvoters.length : 0;
  const down = Array.isArray(this?.votes?.downvoters) ? this.votes.downvoters.length : 0;
  return up - down;
});

const Comment = mongoose.model("Comment", CommentSchema);

module.exports = Comment;
