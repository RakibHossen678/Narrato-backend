const { StatusCodes } = require("http-status-codes");
const AppError = require("../../errors/AppError");
const Comment = require("./comments.model");

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

const ensureVotesObjectShape = async (commentId, comment) => {
  // If old documents stored votes as an array (previous schema), migrate lazily
  // so vote updates to votes.upvoters/votes.downvoters won't error.
  if (Array.isArray(comment?.votes)) {
    await Comment.updateOne(
      { commentId },
      {
        $set: {
          votes: {
            upvoters: [],
            downvoters: [],
          },
        },
      },
    );
  }
};

const voteOnComment = async ({ commentId, userId, vote: rawVote }) => {
  if (!commentId) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Comment ID is required.",
      "Provide a valid commentId in the route params.",
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

  const comment = await Comment.findOne({ commentId }).select(
    "commentId votes",
  );
  if (!comment) {
    throw new AppError(StatusCodes.NOT_FOUND, "Comment not found.");
  }

  await ensureVotesObjectShape(commentId, comment);

  // Re-fetch after a lazy migration so we can reliably read votes.
  const fresh = Array.isArray(comment?.votes)
    ? await Comment.findOne({ commentId }).select("commentId votes")
    : comment;

  const upvoters = Array.isArray(fresh?.votes?.upvoters)
    ? fresh.votes.upvoters
    : [];
  const downvoters = Array.isArray(fresh?.votes?.downvoters)
    ? fresh.votes.downvoters
    : [];

  const hasUp = upvoters.includes(userId);
  const hasDown = downvoters.includes(userId);
  const currentVote = hasUp ? "up" : hasDown ? "down" : null;

  // Toggle rules:
  // - Same vote again => undo (remove)
  // - Opposite vote => switch sides
  // - No vote yet => add to that side
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

  const updated = await Comment.findOneAndUpdate({ commentId }, update, {
    new: true,
  });

  return {
    comment: updated,
    action:
      currentVote === vote ? "undone" : currentVote ? "switched" : "voted",
    currentVote: currentVote === vote ? null : vote,
  };
};

module.exports = {
  voteOnComment,
};
