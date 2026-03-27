const { StatusCodes } = require("http-status-codes");
const catchAsync = require("../../helper/utils/catchAsync");
const sendResponse = require("../../helper/utils/sendResponse");
const notificationsServices = require("./notifications.services");
const { addClient, removeClient } = require("./notifications.stream");

const listNotificationsHandler = catchAsync(async (req, res) => {
  const result = await notificationsServices.listNotifications({
    recipientId: req.user?.userId,
    page: req.query.page,
    limit: req.query.limit,
  });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Notifications fetched successfully",
    meta: result.meta,
    data: result.items,
  });
});

const markAsReadHandler = catchAsync(async (req, res) => {
  const result = await notificationsServices.markAsRead({
    recipientId: req.user?.userId,
    notificationId: req.params.notificationId,
  });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Notification marked as read",
    data: result,
  });
});

const markAllAsReadHandler = catchAsync(async (req, res) => {
  const result = await notificationsServices.markAllAsRead({
    recipientId: req.user?.userId,
  });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "All notifications marked as read",
    data: result,
  });
});

const streamNotificationsHandler = (req, res) => {
  const userId = req.user?.userId;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  addClient(userId, res);
  res.write(`data: ${JSON.stringify({ type: "connected" })}\n\n`);

  const heartbeat = setInterval(() => {
    res.write(`data: ${JSON.stringify({ type: "heartbeat" })}\n\n`);
  }, 25000);

  req.on("close", () => {
    clearInterval(heartbeat);
    removeClient(userId, res);
    res.end();
  });
};

module.exports = {
  listNotificationsHandler,
  markAsReadHandler,
  markAllAsReadHandler,
  streamNotificationsHandler,
};
