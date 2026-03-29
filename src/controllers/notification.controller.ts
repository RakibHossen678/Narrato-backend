import { Request, Response } from "express";
import {
  listNotifications,
  markNotificationRead,
} from "../services/notification.service";
import { asyncHandler } from "../utils/asyncHandler";
import { sendResponse } from "../utils/response";
import { paramToString, toObjectId } from "../utils/tokens";

export const listNotificationsController = asyncHandler(
  async (req: Request, res: Response) => {
    const notifications = await listNotifications(req.user!.id);
    sendResponse(res, 200, notifications);
  },
);

export const markNotificationReadController = asyncHandler(
  async (req: Request, res: Response) => {
    const notification = await markNotificationRead(
      req.user!.id,
      toObjectId(paramToString(req.params.notificationId)),
    );
    sendResponse(res, 200, notification, "Notification updated");
  },
);
