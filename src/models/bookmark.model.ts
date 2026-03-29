import { Schema, Types, model } from "mongoose";

export interface BookmarkDocument {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  blogId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const bookmarkSchema = new Schema<BookmarkDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    blogId: { type: Schema.Types.ObjectId, ref: "Blog", required: true },
  },
  { timestamps: true },
);

bookmarkSchema.index({ userId: 1, blogId: 1 }, { unique: true });
bookmarkSchema.index({ userId: 1, createdAt: -1 });

export const BookmarkModel = model<BookmarkDocument>(
  "Bookmark",
  bookmarkSchema,
);
