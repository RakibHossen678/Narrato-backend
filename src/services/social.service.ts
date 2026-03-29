import { Types } from "mongoose";
import { BlogModel } from "../models/blog.model";
import { BookmarkModel } from "../models/bookmark.model";
import { FollowerModel } from "../models/follower.model";
import { LikeModel, ReactionType } from "../models/like.model";
import { ReportModel } from "../models/report.model";
import { UserModel } from "../models/user.model";
import { AppError } from "../utils/AppError";
import { createNotification } from "./notification.service";

export const followUser = async (
  followerId: Types.ObjectId,
  followingId: Types.ObjectId,
): Promise<void> => {
  if (String(followerId) === String(followingId)) {
    throw new AppError("You cannot follow yourself", 400);
  }

  const followingUser = await UserModel.findById(followingId).lean();
  if (!followingUser) {
    throw new AppError("User not found", 404);
  }

  await FollowerModel.updateOne(
    { followerId, followingId },
    { $setOnInsert: { followerId, followingId } },
    { upsert: true },
  );

  await createNotification({
    userId: followingId,
    actorId: followerId,
    type: "follow",
    referenceId: followerId,
    message: "You have a new follower",
  });
};

export const unfollowUser = async (
  followerId: Types.ObjectId,
  followingId: Types.ObjectId,
): Promise<void> => {
  await FollowerModel.deleteOne({ followerId, followingId });
};

export const toggleBookmark = async (
  userId: Types.ObjectId,
  blogId: Types.ObjectId,
): Promise<boolean> => {
  const blog = await BlogModel.findById(blogId).lean();
  if (!blog) {
    throw new AppError("Blog not found", 404);
  }

  const existing = await BookmarkModel.findOne({ userId, blogId }).lean();
  if (existing) {
    await BookmarkModel.deleteOne({ _id: existing._id });
    await BlogModel.updateOne(
      { _id: blogId },
      { $inc: { bookmarksCount: -1 } },
    );
    return false;
  }

  await BookmarkModel.create({ userId, blogId });
  await BlogModel.updateOne({ _id: blogId }, { $inc: { bookmarksCount: 1 } });

  if (String(blog.authorId) !== String(userId)) {
    await createNotification({
      userId: blog.authorId,
      actorId: userId,
      type: "bookmark",
      referenceId: blogId,
      message: "Your blog was bookmarked",
    });
  }

  return true;
};

export const reactToBlog = async (
  userId: Types.ObjectId,
  blogId: Types.ObjectId,
  reaction: ReactionType,
): Promise<void> => {
  const blog = await BlogModel.findById(blogId).lean();
  if (!blog) {
    throw new AppError("Blog not found", 404);
  }

  const existing = await LikeModel.findOne({
    userId,
    targetId: blogId,
    targetType: "blog",
  });
  if (!existing) {
    await LikeModel.create({
      userId,
      targetId: blogId,
      targetType: "blog",
      reaction,
    });
    if (reaction === "like") {
      await BlogModel.updateOne({ _id: blogId }, { $inc: { likeCount: 1 } });
    }
  } else if (existing.reaction !== reaction) {
    await LikeModel.updateOne({ _id: existing._id }, { reaction });
    if (reaction === "like") {
      await BlogModel.updateOne({ _id: blogId }, { $inc: { likeCount: 1 } });
    } else {
      await BlogModel.updateOne({ _id: blogId }, { $inc: { likeCount: -1 } });
    }
  }

  if (String(blog.authorId) !== String(userId) && reaction === "like") {
    await createNotification({
      userId: blog.authorId,
      actorId: userId,
      type: "like",
      referenceId: blogId,
      message: "Someone liked your blog",
    });
  }
};

export const createReport = async (
  reporterId: Types.ObjectId,
  targetType: "blog" | "comment" | "user",
  targetId: Types.ObjectId,
  reason: string,
) => {
  return ReportModel.create({
    reporterId,
    targetType,
    targetId,
    reason,
  });
};
