import { Schema, Types, model } from "mongoose";

export interface FollowerDocument {
  _id: Types.ObjectId;
  followerId: Types.ObjectId;
  followingId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const followerSchema = new Schema<FollowerDocument>(
  {
    followerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    followingId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

followerSchema.index({ followerId: 1, followingId: 1 }, { unique: true });
followerSchema.index({ followingId: 1, createdAt: -1 });

export const FollowerModel = model<FollowerDocument>(
  "Follower",
  followerSchema,
);
