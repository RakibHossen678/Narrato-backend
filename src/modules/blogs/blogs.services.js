const { StatusCodes } = require("http-status-codes");
const AppError = require("../../errors/AppError");
const Blog = require("./blogs.model");
const User = require("../auth/auth.model");
const { getCache, setCache } = require("../../config/cacheClient");

const parsePagination = ({ page = 1, limit = 10 } = {}) => {
  const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
  const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50);
  const skip = (parsedPage - 1) * parsedLimit;

  return { page: parsedPage, limit: parsedLimit, skip };
};

const sanitizeTags = (tags) => {
  if (!Array.isArray(tags)) return [];
  return tags
    .map((tag) =>
      String(tag || "")
        .trim()
        .toLowerCase(),
    )
    .filter(Boolean);
};

const buildFeedFilter = ({
  tag,
  authorId,
  from,
  to,
  isPublished = "true",
  search,
}) => {
  const filter = {};

  if (isPublished === "true") filter.isPublished = true;
  if (isPublished === "false") filter.isPublished = false;

  if (tag) filter.tags = String(tag).trim().toLowerCase();
  if (authorId) filter.userId = String(authorId).trim();

  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to) filter.createdAt.$lte = new Date(to);
  }

  if (search && String(search).trim()) {
    filter.$text = { $search: String(search).trim() };
  }

  return filter;
};

const ensureBlogAccess = ({ blog, user, write = false }) => {
  if (!blog) {
    throw new AppError(StatusCodes.NOT_FOUND, "Blog not found.");
  }

  if (!write) return;

  const isOwner = blog.userId === user?.userId;
  const isAdmin = user?.role === "admin";

  if (!isOwner && !isAdmin) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      "Access denied.",
      "You can only manage your own blog posts.",
    );
  }
};

const createBlog = async ({ user, payload }) => {
  if (!user?.userId) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "Authentication required.");
  }

  if (!payload?.title || !payload?.content) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Title and content are required.",
    );
  }

  const author = await User.findOne({ userId: user.userId }).select(
    "userName firstName lastName",
  );

  const fullName =
    `${author?.firstName || ""} ${author?.lastName || ""}`.trim();

  const created = await Blog.create({
    userId: user.userId,
    title: String(payload.title).trim(),
    excerpt: String(payload.excerpt || "").trim(),
    content: String(payload.content).trim(),
    tags: sanitizeTags(payload.tags),
    image: payload.image || "",
    isPublished: Boolean(payload.isPublished),
    isPaid: Boolean(payload.isPaid),
    price: Number(payload.price || 0),
    author: author?.userName || fullName || user.userId,
    authorBio: String(payload.authorBio || "").trim(),
    designation: String(payload.designation || "").trim(),
    facebook: String(payload.facebook || "").trim(),
    linkedin: String(payload.linkedin || "").trim(),
  });

  return created;
};

const updateBlog = async ({ blogId, user, payload }) => {
  const blog = await Blog.findOne({ blogId });
  ensureBlogAccess({ blog, user, write: true });

  const update = {};
  const fields = [
    "title",
    "excerpt",
    "content",
    "image",
    "isPublished",
    "isPaid",
    "price",
    "authorBio",
    "designation",
    "facebook",
    "linkedin",
  ];

  fields.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(payload, field)) {
      update[field] = payload[field];
    }
  });

  if (Object.prototype.hasOwnProperty.call(payload, "tags")) {
    update.tags = sanitizeTags(payload.tags);
  }

  const updated = await Blog.findOneAndUpdate({ blogId }, update, {
    new: true,
    runValidators: true,
  });

  return updated;
};

const deleteBlog = async ({ blogId, user }) => {
  const blog = await Blog.findOne({ blogId });
  ensureBlogAccess({ blog, user, write: true });

  await Blog.deleteOne({ blogId });
  return { blogId };
};

const getBlogById = async ({ blogId, user }) => {
  const blog = await Blog.findOne({ blogId });
  ensureBlogAccess({ blog, user, write: false });

  if (
    !blog.isPublished &&
    blog.userId !== user?.userId &&
    user?.role !== "admin"
  ) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      "This blog is not published yet.",
    );
  }

  return blog;
};

const getBlogBySlug = async ({ slug, user }) => {
  const blog = await Blog.findOne({ slug });
  ensureBlogAccess({ blog, user, write: false });

  if (
    !blog.isPublished &&
    blog.userId !== user?.userId &&
    user?.role !== "admin"
  ) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      "This blog is not published yet.",
    );
  }

  return blog;
};

const listBlogs = async (query = {}) => {
  const { page, limit, skip } = parsePagination(query);
  const filter = buildFeedFilter(query);
  const isPopularSort = query.sortBy === "popular";
  const cacheKey = isPopularSort
    ? `blogs:popular:${JSON.stringify({ filter, page, limit })}`
    : null;

  if (cacheKey) {
    const cached = await getCache(cacheKey);
    if (cached) {
      return cached;
    }
  }

  const sort = isPopularSort
    ? { shareCount: -1, viewCount: -1, createdAt: -1 }
    : { publishedAt: -1, createdAt: -1 };

  const [items, total] = await Promise.all([
    Blog.find(filter).sort(sort).skip(skip).limit(limit),
    Blog.countDocuments(filter),
  ]);

  const result = {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
      hasMore: skip + items.length < total,
    },
    items,
  };

  if (cacheKey) {
    await setCache(cacheKey, result, 90);
  }

  return result;
};

const toggleBookmark = async ({ blogId, userId }) => {
  if (!userId) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "Authentication required.");
  }

  const blog = await Blog.findOne({ blogId }).select("blogId bookmarkedBy");
  if (!blog) {
    throw new AppError(StatusCodes.NOT_FOUND, "Blog not found.");
  }

  const hasBookmarked = Array.isArray(blog.bookmarkedBy)
    ? blog.bookmarkedBy.includes(userId)
    : false;

  const update = hasBookmarked
    ? {
        $pull: { bookmarkedBy: userId },
        $inc: { bookmarkCount: -1 },
      }
    : {
        $addToSet: { bookmarkedBy: userId },
        $inc: { bookmarkCount: 1 },
      };

  const updated = await Blog.findOneAndUpdate({ blogId }, update, {
    new: true,
  });

  return {
    blog: updated,
    action: hasBookmarked ? "removed" : "added",
  };
};

const incrementShareCount = async ({ blogId }) => {
  const updated = await Blog.findOneAndUpdate(
    { blogId },
    { $inc: { shareCount: 1 } },
    { new: true },
  );

  if (!updated) {
    throw new AppError(StatusCodes.NOT_FOUND, "Blog not found.");
  }

  return updated;
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
  createBlog,
  updateBlog,
  deleteBlog,
  getBlogById,
  getBlogBySlug,
  listBlogs,
  toggleBookmark,
  incrementShareCount,
  voteOnBlog,
};
