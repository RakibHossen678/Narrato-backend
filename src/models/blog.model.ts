import { Schema, Types, model } from "mongoose";

export interface BlogDocument {
  _id: Types.ObjectId;
  authorId: Types.ObjectId;
  title: string;
  slug: string;
  summary: string;
  content: string;
  tags: string[];
  coverImage?: string;
  published: boolean;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  bookmarksCount: number;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const blogSchema = new Schema<BlogDocument>(
  {
    authorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    summary: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    tags: { type: [String], default: [], index: true },
    coverImage: { type: String, default: "" },
    published: { type: Boolean, default: false, index: true },
    viewCount: { type: Number, default: 0 },
    likeCount: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },
    shareCount: { type: Number, default: 0 },
    bookmarksCount: { type: Number, default: 0 },
    featured: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

blogSchema.index({ published: 1, createdAt: -1 });
blogSchema.index({ tags: 1, published: 1, createdAt: -1 });
blogSchema.index({ authorId: 1, published: 1, createdAt: -1 });
blogSchema.index({
  published: 1,
  likeCount: -1,
  commentCount: -1,
  viewCount: -1,
});

export const BlogModel = model<BlogDocument>("Blog", blogSchema);
