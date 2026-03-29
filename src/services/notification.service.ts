import { Types } from "mongoose";
import {
  NotificationDocument,
  NotificationModel,
  NotificationType,
} from "../models/notification.model";
import { emitToUser } from "../config/socket";

interface CreateNotificationInput {
  userId: Types.ObjectId;
  actorId?: Types.ObjectId;
  type: NotificationType;
  referenceId?: Types.ObjectId;
  message: string;
}

export const createNotification = async (
  input: CreateNotificationInput,
): Promise<NotificationDocument> => {
  const notification = await NotificationModel.create({
    userId: input.userId,
    actorId: input.actorId ?? null,
    type: input.type,
    referenceId: input.referenceId ?? null,
    message: input.message,
  });

  emitToUser(String(input.userId), "notification:new", notification);
  return notification;
};

export const listNotifications = async (
  userId: Types.ObjectId,
): Promise<NotificationDocument[]> => {
  return NotificationModel.find({ userId })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();
};

export const markNotificationRead = async (
  userId: Types.ObjectId,
  id: Types.ObjectId,
): Promise<NotificationDocument | null> => {
  return NotificationModel.findOneAndUpdate(
    { _id: id, userId },
    { readAt: new Date() },
    { new: true },
  ).lean();
};
