import { Schema, Types, model } from "mongoose";

export type TokenType = "verify-email" | "reset-password";

export interface VerificationTokenDocument {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  tokenHash: string;
  tokenType: TokenType;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const verificationTokenSchema = new Schema<VerificationTokenDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    tokenHash: { type: String, required: true },
    tokenType: {
      type: String,
      enum: ["verify-email", "reset-password"],
      required: true,
    },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);

verificationTokenSchema.index({ userId: 1, tokenType: 1 });
verificationTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const VerificationTokenModel = model<VerificationTokenDocument>(
  "VerificationToken",
  verificationTokenSchema,
);
