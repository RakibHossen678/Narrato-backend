const mongoose = require("mongoose");
const customIdGenerator = require("../../utils/customIdGenerator");

const ReportSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: [true, "User ID is required"],
    },
    blogId: {
      type: String,
      required: [true, "Blog ID is required"],
      index: true,
    },
    reportId: {
      type: String,
      unique: true,
      required: [true, "Report ID is required"],
      index: true,
    },
    reason: {
      type: String,
      required: [true, "Reason is required"],
    },
  },
  { timestamps: true },
);

ReportSchema.plugin(customIdGenerator, {
  field: "reportId",
  prefix: "RPT",
  enableCondition: (report) => !!report.blogId,
});

const Report = mongoose.model("Report", ReportSchema);

module.exports = Report;
