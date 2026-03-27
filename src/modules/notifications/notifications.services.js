const { StatusCodes } = require("http-status-codes");
const AppError = require("../../errors/AppError");
const Notification = require("./notifications.model");
const { publishToUser } = require("./notifications.stream");

const parsePagination = ({ page = 1, limit = 20 } = {}) => {
  const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
  const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
  const skip = (parsedPage - 1) * parsedLimit;
  return { page: parsedPage, limit: parsedLimit, skip };
};

const createNotification = async (payload) => {
  if (!payload?.recipientId) {
    throw new AppError(StatusCodes.BAD_REQUEST, "recipientId is required.");
  }

  const created = await Notification.create(payload);
  publishToUser(created.recipientId, {
    type: "notification:new",
    data: created,
  });

  return created;
};

const listNotifications = async ({ recipientId, page, limit }) => {
  if (!recipientId) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "Authentication required.");
  }

  const {
    page: currentPage,
    limit: take,
    skip,
  } = parsePagination({ page, limit });

  const filter = { recipientId };
  const [items, total, unreadCount] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(take),
    Notification.countDocuments(filter),
    Notification.countDocuments({ recipientId, isRead: false }),
  ]);

  return {
    meta: {
      page: currentPage,
      limit: take,
      total,
      totalPages: Math.ceil(total / take) || 1,
      unreadCount,
    },
    items,
  };
};

const markAsRead = async ({ recipientId, notificationId }) => {
  const notification = await Notification.findOne({
    notificationId,
    recipientId,
  });
  if (!notification) {
    throw new AppError(StatusCodes.NOT_FOUND, "Notification not found.");
  }

  if (!notification.isRead) {
    notification.isRead = true;
    await notification.save();
  }

  publishToUser(recipientId, {
    type: "notification:read",
    data: { notificationId },
  });

  return notification;
};

const markAllAsRead = async ({ recipientId }) => {
  if (!recipientId) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "Authentication required.");
  }

  await Notification.updateMany(
    { recipientId, isRead: false },
    { isRead: true },
  );

  publishToUser(recipientId, {
    type: "notification:read-all",
    data: { ok: true },
  });

  return { ok: true };
};

module.exports = {
  createNotification,
  listNotifications,
  markAsRead,
  markAllAsRead,
};
