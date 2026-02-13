const mongoose = require("mongoose");

const EngagementSchema = new mongoose.Schema(
  {
    engagementId: {
      type: String,
      unique: true,
      required: [true, "Engagement ID is required"],
      index: true,
    },
    blogId: {
      type: String,
      required: [true, "Blog ID is required"],
    },
    viewCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

EngagementSchema.plugin(customIdGenerator, {
  field: "engagementId",
  prefix: "ENG",
  enableCondition: (engagement) => !!engagement.blogId,
});

const Engagement = mongoose.model("Engagement", EngagementSchema);

module.exports = Engagement;
