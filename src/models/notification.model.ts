import { Schema, Types, model } from "mongoose";

export type NotificationType =
  | "comment"
  | "like"
  | "follow"
  | "report"
  | "admin"
  | "bookmark";

export interface NotificationDocument {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  actorId?: Types.ObjectId;
  type: NotificationType;
  referenceId?: Types.ObjectId;
  message: string;
  readAt?: Date | null;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<NotificationDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    actorId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    type: {
      type: String,
      enum: ["comment", "like", "follow", "report", "admin", "bookmark"],
      required: true,
    },
    referenceId: { type: Schema.Types.ObjectId, default: null },
    message: { type: String, required: true, trim: true },
    readAt: { type: Date, default: null },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    },
  },
  { timestamps: true },
);

notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const NotificationModel = model<NotificationDocument>(
  "Notification",
  notificationSchema,
);
