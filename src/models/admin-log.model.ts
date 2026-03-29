import { Schema, Types, model } from "mongoose";

export interface AdminLogDocument {
  _id: Types.ObjectId;
  adminId: Types.ObjectId;
  action: string;
  targetType: "user" | "blog" | "report" | "system";
  targetId?: Types.ObjectId;
  metadata: Record<string, string | number | boolean>;
  createdAt: Date;
  updatedAt: Date;
}

const adminLogSchema = new Schema<AdminLogDocument>(
  {
    adminId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    action: { type: String, required: true },
    targetType: {
      type: String,
      enum: ["user", "blog", "report", "system"],
      required: true,
    },
    targetId: { type: Schema.Types.ObjectId, default: null },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

adminLogSchema.index({ adminId: 1, createdAt: -1 });
adminLogSchema.index({ targetType: 1, createdAt: -1 });

export const AdminLogModel = model<AdminLogDocument>(
  "AdminLog",
  adminLogSchema,
);
