const mongoose = require("mongoose");
const customIdGenerator = require("../../utils/customIdGenerator");

const NotificationSchema = new mongoose.Schema(
  {
    notificationId: {
      type: String,
      unique: true,
      required: [true, "Notification ID is required"],
      index: true,
    },
    recipientId: {
      type: String,
      required: [true, "Recipient user ID is required"],
      index: true,
    },
    actorId: {
      type: String,
      default: null,
      index: true,
    },
    type: {
      type: String,
      required: [true, "Notification type is required"],
      enum: ["follow", "comment", "like", "share", "report", "system"],
      index: true,
    },
    title: {
      type: String,
      required: [true, "Notification title is required"],
      trim: true,
    },
    message: {
      type: String,
      default: "",
    },
    entityType: {
      type: String,
      default: null,
    },
    entityId: {
      type: String,
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true },
);

NotificationSchema.plugin(customIdGenerator, {
  field: "notificationId",
  prefix: "NTF",
  enableCondition: (doc) => !!doc.recipientId,
});

NotificationSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ recipientId: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", NotificationSchema);

module.exports = Notification;
