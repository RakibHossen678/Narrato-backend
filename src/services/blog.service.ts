import { FilterQuery, PipelineStage, Types } from "mongoose";
import { redis } from "../config/redis";
import { BlogDocument, BlogModel } from "../models/blog.model";
import { BookmarkModel } from "../models/bookmark.model";
import { FollowerModel } from "../models/follower.model";
import { LikeModel } from "../models/like.model";
import { AppError } from "../utils/AppError";
import { parsePagination } from "../utils/pagination";
import { createSlug } from "../utils/slug";

interface BlogListFilters {
  page?: string;
  limit?: string;
  q?: string;
  tag?: string;
  authorId?: string;
  sort?: "newest" | "trending" | "most-liked";
}

interface BlogInput {
  title: string;
  summary: string;
  content: string;
  tags: string[];
  coverImage?: string;
  published: boolean;
}

const TRENDING_CACHE_KEY = "blogs:trending";

const parseTags = (tags: string[]): string[] =>
  tags.map((tag) => tag.trim().toLowerCase()).filter(Boolean);

export const createBlog = async (
  authorId: Types.ObjectId,
  payload: BlogInput,
): Promise<BlogDocument> => {
  const baseSlug = createSlug(payload.title);
  const slug = `${baseSlug}-${Date.now().toString(36)}`;

  const blog = await BlogModel.create({
    authorId,
    title: payload.title,
    slug,
    summary: payload.summary,
    content: payload.content,
    tags: parseTags(payload.tags),
    coverImage: payload.coverImage ?? "",
    published: payload.published,
  });

  if (redis) {
    await redis.del(TRENDING_CACHE_KEY);
  }

  return blog;
};

export const updateBlog = async (
  blogId: Types.ObjectId,
  userId: Types.ObjectId,
  payload: Partial<BlogInput>,
): Promise<BlogDocument> => {
  const blog = await BlogModel.findById(blogId);
  if (!blog) {
    throw new AppError("Blog not found", 404);
  }

  if (String(blog.authorId) !== String(userId)) {
    throw new AppError("Forbidden", 403);
  }

  if (payload.title) {
    blog.title = payload.title;
    blog.slug = `${createSlug(payload.title)}-${Date.now().toString(36)}`;
  }
  if (payload.summary) blog.summary = payload.summary;
  if (payload.content) blog.content = payload.content;
  if (payload.tags) blog.tags = parseTags(payload.tags);
  if (payload.coverImage !== undefined) blog.coverImage = payload.coverImage;
  if (payload.published !== undefined) blog.published = payload.published;

  await blog.save();

  if (redis) {
    await redis.del(TRENDING_CACHE_KEY);
  }

  return blog;
};

export const deleteBlog = async (
  blogId: Types.ObjectId,
  userId: Types.ObjectId,
): Promise<void> => {
  const blog = await BlogModel.findById(blogId);
  if (!blog) {
    throw new AppError("Blog not found", 404);
  }

  if (String(blog.authorId) !== String(userId)) {
    throw new AppError("Forbidden", 403);
  }

  await BlogModel.deleteOne({ _id: blogId });
  await LikeModel.deleteMany({ targetType: "blog", targetId: blogId });
  await BookmarkModel.deleteMany({ blogId });

  if (redis) {
    await redis.del(TRENDING_CACHE_KEY);
  }
};

export const listBlogs = async (filters: BlogListFilters) => {
  const { page, limit, skip } = parsePagination(filters);

  const query: FilterQuery<BlogDocument> = { published: true };
  if (filters.tag) query.tags = filters.tag.toLowerCase();
  if (filters.authorId) query.authorId = new Types.ObjectId(filters.authorId);
  if (filters.q) {
    query.$or = [
      { title: { $regex: filters.q, $options: "i" } },
      { content: { $regex: filters.q, $options: "i" } },
    ];
  }

  const sortMap = {
    newest: { createdAt: -1 },
    trending: { likeCount: -1, commentCount: -1, viewCount: -1, createdAt: -1 },
    "most-liked": { likeCount: -1, createdAt: -1 },
  } as const;

  const sort = sortMap[filters.sort ?? "newest"];

  const [items, total] = await Promise.all([
    BlogModel.find(query).sort(sort).skip(skip).limit(limit).lean(),
    BlogModel.countDocuments(query),
  ]);

  return {
    items,
    meta: { page, limit, total, hasMore: skip + items.length < total },
  };
};

export const getBlogBySlug = async (slug: string): Promise<BlogDocument> => {
  const blog = await BlogModel.findOneAndUpdate(
    { slug, published: true },
    { $inc: { viewCount: 1 } },
    { new: true },
  ).lean();

  if (!blog) {
    throw new AppError("Blog not found", 404);
  }

  return blog;
};

export const listTrendingBlogs = async (): Promise<BlogDocument[]> => {
  if (redis) {
    const cached = await redis.get(TRENDING_CACHE_KEY);
    if (cached) {
      return JSON.parse(cached) as BlogDocument[];
    }
  }

  const items = await BlogModel.find({ published: true })
    .sort({ likeCount: -1, commentCount: -1, viewCount: -1, createdAt: -1 })
    .limit(10)
    .lean();

  if (redis) {
    await redis.set(TRENDING_CACHE_KEY, JSON.stringify(items), "EX", 300);
  }

  return items;
};

export const listFollowingFeed = async (
  userId: Types.ObjectId,
  page?: string,
  limit?: string,
) => {
  const pagination = parsePagination({ page, limit });
  const following = await FollowerModel.find({ followerId: userId })
    .select("followingId")
    .lean();

  const authorIds = following.map((item) => item.followingId);

  const query: FilterQuery<BlogDocument> = {
    published: true,
    authorId: { $in: authorIds },
  };

  const [items, total] = await Promise.all([
    BlogModel.find(query)
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit)
      .lean(),
    BlogModel.countDocuments(query),
  ]);

  return {
    items,
    meta: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      hasMore: pagination.skip + items.length < total,
    },
  };
};
