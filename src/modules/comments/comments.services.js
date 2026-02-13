const { StatusCodes } = require("http-status-codes");
const AppError = require("../../errors/AppError");
const Comment = require("./comments.model");

const parsePagination = ({ page = 1, limit = 20 } = {}) => {
  const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
  const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
  const skip = (parsedPage - 1) * parsedLimit;
  return { page: parsedPage, limit: parsedLimit, skip };
};

const createComment = async ({ userId, blogId, content }) => {
  if (!userId) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "Authentication required.");
  }
  if (!blogId) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Blog ID is required.",
      "Provide a valid blogId.",
    );
  }
  if (!content || !String(content).trim()) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Content is required.",
      "Provide non-empty comment content.",
    );
  }

  const comment = await Comment.create({
    userId,
    blogId,
    content: String(content).trim(),
    parentCommentId: null,
  });

  return comment;
};

const replyToComment = async ({ userId, parentCommentId, content }) => {
  if (!userId) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "Authentication required.");
  }
  if (!parentCommentId) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Parent comment ID is required.",
      "Provide a valid parent commentId.",
    );
  }
  if (!content || !String(content).trim()) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Content is required.",
      "Provide non-empty reply content.",
    );
  }

  const parent = await Comment.findOne({ commentId: parentCommentId }).select(
    "commentId blogId rootCommentId",
  );
  if (!parent) {
    throw new AppError(StatusCodes.NOT_FOUND, "Parent comment not found.");
  }

  const reply = await Comment.create({
    userId,
    blogId: parent.blogId,
    content: String(content).trim(),
    parentCommentId: parent.commentId,
    rootCommentId: parent.rootCommentId || parent.commentId,
  });

  await Comment.updateOne(
    { commentId: parent.commentId },
    { $inc: { replyCount: 1 } },
  );

  return reply;
};

const listRootCommentsByBlog = async ({ blogId, page, limit }) => {
  if (!blogId) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Blog ID is required.",
      "Provide a valid blogId.",
    );
  }

  const {
    skip,
    limit: take,
    page: currentPage,
  } = parsePagination({
    page,
    limit,
  });

  const filter = { blogId, parentCommentId: null };
  const [items, total] = await Promise.all([
    Comment.find(filter).sort({ createdAt: -1 }).skip(skip).limit(take),
    Comment.countDocuments(filter),
  ]);

  return {
    meta: {
      page: currentPage,
      limit: take,
      total,
      totalPages: Math.ceil(total / take) || 1,
    },
    items,
  };
};

const listReplies = async ({ parentCommentId, page, limit }) => {
  if (!parentCommentId) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Parent comment ID is required.",
      "Provide a valid parent commentId.",
    );
  }

  const {
    skip,
    limit: take,
    page: currentPage,
  } = parsePagination({
    page,
    limit,
  });

  const filter = { parentCommentId };
  const [items, total] = await Promise.all([
    Comment.find(filter).sort({ createdAt: 1 }).skip(skip).limit(take),
    Comment.countDocuments(filter),
  ]);

  return {
    meta: {
      page: currentPage,
      limit: take,
      total,
      totalPages: Math.ceil(total / take) || 1,
    },
    items,
  };
};

const listThread = async ({ rootCommentId, page, limit }) => {
  if (!rootCommentId) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Root comment ID is required.",
      "Provide a valid rootCommentId.",
    );
  }

  const {
    skip,
    limit: take,
    page: currentPage,
  } = parsePagination({
    page,
    limit,
  });

  const filter = { rootCommentId };
  const [items, total] = await Promise.all([
    Comment.find(filter).sort({ createdAt: 1 }).skip(skip).limit(take),
    Comment.countDocuments(filter),
  ]);

  return {
    meta: {
      page: currentPage,
      limit: take,
      total,
      totalPages: Math.ceil(total / take) || 1,
    },
    items,
  };
};

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
  createComment,
  replyToComment,
  listRootCommentsByBlog,
  listReplies,
  listThread,
  voteOnComment,
};
