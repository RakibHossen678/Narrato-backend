import { Schema, Types, model } from "mongoose";

export type ReportTargetType = "blog" | "comment" | "user";
export type ReportStatus = "open" | "reviewing" | "resolved" | "rejected";

export interface ReportDocument {
  _id: Types.ObjectId;
  reporterId: Types.ObjectId;
  targetId: Types.ObjectId;
  targetType: ReportTargetType;
  reason: string;
  status: ReportStatus;
  moderatorNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

const reportSchema = new Schema<ReportDocument>(
  {
    reporterId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    targetId: { type: Schema.Types.ObjectId, required: true },
    targetType: {
      type: String,
      enum: ["blog", "comment", "user"],
      required: true,
    },
    reason: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["open", "reviewing", "resolved", "rejected"],
      default: "open",
    },
    moderatorNote: { type: String, default: "" },
  },
  { timestamps: true },
);

reportSchema.index({ status: 1, createdAt: -1 });
reportSchema.index({ targetType: 1, targetId: 1, status: 1 });

export const ReportModel = model<ReportDocument>("Report", reportSchema);
