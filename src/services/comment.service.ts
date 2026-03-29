import { Types } from "mongoose";
import { BlogModel } from "../models/blog.model";
import { CommentDocument, CommentModel } from "../models/comment.model";
import { LikeModel, ReactionType } from "../models/like.model";
import { AppError } from "../utils/AppError";
import { createNotification } from "./notification.service";

export const createComment = async (
  blogId: Types.ObjectId,
  authorId: Types.ObjectId,
  content: string,
  parentId?: Types.ObjectId,
): Promise<CommentDocument> => {
  const blog = await BlogModel.findById(blogId);
  if (!blog) {
    throw new AppError("Blog not found", 404);
  }

  if (parentId) {
    const parent = await CommentModel.findById(parentId);
    if (!parent || String(parent.blogId) !== String(blogId)) {
      throw new AppError("Invalid parent comment", 400);
    }
  }

  const comment = await CommentModel.create({
    blogId,
    authorId,
    parentId: parentId ?? null,
    content,
  });

  await BlogModel.updateOne({ _id: blogId }, { $inc: { commentCount: 1 } });

  if (String(blog.authorId) !== String(authorId)) {
    await createNotification({
      userId: blog.authorId,
      actorId: authorId,
      type: "comment",
      referenceId: comment._id,
      message: "Someone commented on your blog",
    });
  }

  return comment;
};

export const listComments = async (
  blogId: Types.ObjectId,
): Promise<CommentDocument[]> => {
  return CommentModel.find({ blogId }).sort({ createdAt: 1 }).lean();
};

export const softDeleteComment = async (
  commentId: Types.ObjectId,
  userId: Types.ObjectId,
): Promise<void> => {
  const comment = await CommentModel.findById(commentId);
  if (!comment) {
    throw new AppError("Comment not found", 404);
  }

  if (String(comment.authorId) !== String(userId)) {
    throw new AppError("Forbidden", 403);
  }

  if (!comment.deletedAt) {
    comment.deletedAt = new Date();
    comment.content = "[deleted]";
    await comment.save();
  }
};

export const reactToComment = async (
  commentId: Types.ObjectId,
  userId: Types.ObjectId,
  reaction: ReactionType,
): Promise<void> => {
  const comment = await CommentModel.findById(commentId);
  if (!comment) {
    throw new AppError("Comment not found", 404);
  }

  const existing = await LikeModel.findOne({
    userId,
    targetId: commentId,
    targetType: "comment",
  });

  if (!existing) {
    await LikeModel.create({
      userId,
      targetId: commentId,
      targetType: "comment",
      reaction,
    });
    await CommentModel.updateOne(
      { _id: commentId },
      reaction === "like"
        ? { $inc: { likeCount: 1 } }
        : { $inc: { dislikeCount: 1 } },
    );
    return;
  }

  if (existing.reaction === reaction) {
    return;
  }

  await LikeModel.updateOne({ _id: existing._id }, { reaction });
  if (reaction === "like") {
    await CommentModel.updateOne(
      { _id: commentId },
      { $inc: { likeCount: 1, dislikeCount: -1 } },
    );
    return;
  }

  await CommentModel.updateOne(
    { _id: commentId },
    { $inc: { likeCount: -1, dislikeCount: 1 } },
  );
};
