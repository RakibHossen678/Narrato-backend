import { Schema, Types, model } from "mongoose";

export type LikeTargetType = "blog" | "comment";
export type ReactionType = "like" | "dislike";

export interface LikeDocument {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  targetId: Types.ObjectId;
  targetType: LikeTargetType;
  reaction: ReactionType;
  createdAt: Date;
  updatedAt: Date;
}

const likeSchema = new Schema<LikeDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    targetId: { type: Schema.Types.ObjectId, required: true },
    targetType: { type: String, enum: ["blog", "comment"], required: true },
    reaction: { type: String, enum: ["like", "dislike"], default: "like" },
  },
  { timestamps: true },
);

likeSchema.index({ userId: 1, targetType: 1, targetId: 1 }, { unique: true });
likeSchema.index({ targetType: 1, targetId: 1, reaction: 1 });

export const LikeModel = model<LikeDocument>("Like", likeSchema);
