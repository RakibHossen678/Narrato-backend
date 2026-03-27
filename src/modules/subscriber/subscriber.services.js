const { StatusCodes } = require("http-status-codes");
const AppError = require("../../errors/AppError");
const Subscriber = require("./subscriber.model");
const User = require("../auth/auth.model");

const toggleSubscription = async ({ ownerId, subscriberUserId }) => {
  if (!ownerId) {
    throw new AppError(StatusCodes.BAD_REQUEST, "ownerId is required.");
  }
  if (!subscriberUserId) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "Authentication required.");
  }
  if (ownerId === subscriberUserId) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "You cannot subscribe to your own profile.",
    );
  }

  const subscriberUser = await User.findOne({
    userId: subscriberUserId,
  }).select("userId userName photoUrl");
  if (!subscriberUser) {
    throw new AppError(StatusCodes.NOT_FOUND, "Subscriber user not found.");
  }

  const owner = await User.findOne({ userId: ownerId }).select("userId");
  if (!owner) {
    throw new AppError(StatusCodes.NOT_FOUND, "Profile owner not found.");
  }

  let subscription = await Subscriber.findOne({ ownerId });
  if (!subscription) {
    subscription = await Subscriber.create({
      ownerId,
      subscriberId: [],
    });
  }

  const hasSubscribed = (subscription.subscriberId || []).some(
    (item) => item.userId === subscriberUser.userId,
  );

  if (hasSubscribed) {
    await Subscriber.updateOne(
      { ownerId },
      { $pull: { subscriberId: { userId: subscriberUser.userId } } },
    );
  } else {
    await Subscriber.updateOne(
      { ownerId },
      {
        $addToSet: {
          subscriberId: {
            userId: subscriberUser.userId,
            userName: subscriberUser.userName,
            photoUrl: subscriberUser.photoUrl || null,
          },
        },
      },
    );
  }

  const updated = await Subscriber.findOne({ ownerId });

  return {
    action: hasSubscribed ? "unsubscribed" : "subscribed",
    ownerId,
    subscribersCount: updated?.subscriberId?.length || 0,
  };
};

const getFollowersByOwnerId = async ({ ownerId }) => {
  if (!ownerId) {
    throw new AppError(StatusCodes.BAD_REQUEST, "ownerId is required.");
  }

  const row = await Subscriber.findOne({ ownerId }).select(
    "ownerId subscriberId",
  );
  return {
    ownerId,
    subscribers: row?.subscriberId || [],
    total: row?.subscriberId?.length || 0,
  };
};

const getFollowingByUserId = async ({ userId }) => {
  if (!userId) {
    throw new AppError(StatusCodes.BAD_REQUEST, "userId is required.");
  }

  const rows = await Subscriber.find({ "subscriberId.userId": userId }).select(
    "ownerId",
  );
  return {
    userId,
    followingOwnerIds: rows.map((row) => row.ownerId),
    total: rows.length,
  };
};

module.exports = {
  toggleSubscription,
  getFollowersByOwnerId,
  getFollowingByUserId,
};
