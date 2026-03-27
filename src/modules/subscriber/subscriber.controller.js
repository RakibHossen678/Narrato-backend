const { StatusCodes } = require("http-status-codes");
const catchAsync = require("../../helper/utils/catchAsync");
const sendResponse = require("../../helper/utils/sendResponse");
const subscriberServices = require("./subscriber.services");
const notificationsServices = require("../notifications/notifications.services");

const toggleSubscriptionHandler = catchAsync(async (req, res) => {
  const { ownerId } = req.params;
  const result = await subscriberServices.toggleSubscription({
    ownerId,
    subscriberUserId: req.user?.userId,
  });

  if (result.action === "subscribed") {
    await notificationsServices.createNotification({
      recipientId: ownerId,
      actorId: req.user?.userId,
      type: "follow",
      title: "New follower",
      message: "Someone subscribed to your profile.",
      entityType: "user",
      entityId: req.user?.userId,
    });
  }

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: `User ${result.action} successfully`,
    data: result,
  });
});

const getFollowersByOwnerIdHandler = catchAsync(async (req, res) => {
  const result = await subscriberServices.getFollowersByOwnerId({
    ownerId: req.params.ownerId,
  });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Followers fetched successfully",
    data: result,
  });
});

const getFollowingByUserIdHandler = catchAsync(async (req, res) => {
  const userId = req.params.userId || req.user?.userId;
  const result = await subscriberServices.getFollowingByUserId({ userId });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Following fetched successfully",
    data: result,
  });
});

module.exports = {
  toggleSubscriptionHandler,
  getFollowersByOwnerIdHandler,
  getFollowingByUserIdHandler,
};
