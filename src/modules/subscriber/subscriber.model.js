const mongoose = require("mongoose");
const customIdGenerator = require("../../utils/customIdGenerator");

const SubscriberSchema = new mongoose.Schema(
  {
    subscriptionId: {
      type: String,
      unique: true,
      required: [true, "Subscription ID is required"],
      index: true,
    },
    ownerId: {
      type: String,
      required: [true, "Owner ID is required"],
    },
    subscriberId: [
      {
        userId: {
          type: String,
          required: [true, "Subscriber ID is required"],
        },
        userName: {
          type: String,
          required: [true, "Subscriber Name is required"],
        },
        photoUrl: {
          type: String,
          default: null,
        },
      },
    ],
  },
  { timestamps: true },
);

SubscriberSchema.plugin(customIdGenerator, {
  field: "subscriptionId",
  prefix: "SUB",
  enableCondition: (subscriber) => !!subscriber.ownerId,
});

const Subscriber = mongoose.model("Subscriber", SubscriberSchema);

module.exports = Subscriber;
