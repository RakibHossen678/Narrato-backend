import { Schema, Types, model } from "mongoose";

export interface CommentDocument {
  _id: Types.ObjectId;
  blogId: Types.ObjectId;
  authorId: Types.ObjectId;
  parentId?: Types.ObjectId | null;
  content: string;
  deletedAt?: Date | null;
  likeCount: number;
  dislikeCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<CommentDocument>(
  {
    blogId: {
      type: Schema.Types.ObjectId,
      ref: "Blog",
      required: true,
      index: true,
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
      index: true,
    },
    content: { type: String, required: true, trim: true },
    deletedAt: { type: Date, default: null },
    likeCount: { type: Number, default: 0 },
    dislikeCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

commentSchema.index({ blogId: 1, parentId: 1, createdAt: 1 });
commentSchema.index({ authorId: 1, createdAt: -1 });

export const CommentModel = model<CommentDocument>("Comment", commentSchema);
