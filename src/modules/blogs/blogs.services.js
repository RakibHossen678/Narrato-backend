const { StatusCodes } = require("http-status-codes");
const AppError = require("../../errors/AppError");
const Blog = require("./blogs.model");

const normalizeVoteValue = (rawVote) => {
  const vote = String(rawVote || "")
    .trim()
    .toLowerCase();

  if (vote === "up" || vote === "upvote") return "up";
  if (vote === "down" || vote === "downvote") return "down";

  throw new AppError(
    StatusCodes.BAD_REQUEST,
    "Invalid vote type.",
    "Vote must be either 'up' or 'down'.",
  );
};

const voteOnBlog = async ({ blogId, userId, vote: rawVote }) => {
  if (!blogId) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Blog ID is required.",
      "Provide a valid blogId in the route params.",
    );
  }
  if (!userId) {
    throw new AppError(
      StatusCodes.UNAUTHORIZED,
      "Authentication required.",
      "You must be logged in to vote.",
    );
  }

  const vote = normalizeVoteValue(rawVote);

  const blog = await Blog.findOne({ blogId }).select("blogId votes");
  if (!blog) {
    throw new AppError(StatusCodes.NOT_FOUND, "Blog not found.");
  }

  const upvoters = Array.isArray(blog?.votes?.upvoters)
    ? blog.votes.upvoters
    : [];
  const downvoters = Array.isArray(blog?.votes?.downvoters)
    ? blog.votes.downvoters
    : [];

  const hasUp = upvoters.includes(userId);
  const hasDown = downvoters.includes(userId);
  const currentVote = hasUp ? "up" : hasDown ? "down" : null;

  let update;
  if (vote === "up") {
    update =
      currentVote === "up"
        ? { $pull: { "votes.upvoters": userId } }
        : {
            $pull: { "votes.downvoters": userId },
            $addToSet: { "votes.upvoters": userId },
          };
  } else {
    update =
      currentVote === "down"
        ? { $pull: { "votes.downvoters": userId } }
        : {
            $pull: { "votes.upvoters": userId },
            $addToSet: { "votes.downvoters": userId },
          };
  }

  const updated = await Blog.findOneAndUpdate({ blogId }, update, {
    new: true,
  });

  return {
    blog: updated,
    action:
      currentVote === vote ? "undone" : currentVote ? "switched" : "voted",
    currentVote: currentVote === vote ? null : vote,
  };
};

module.exports = {
  voteOnBlog,
};
