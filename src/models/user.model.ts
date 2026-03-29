import bcrypt from "bcryptjs";
import { Document, Model, Schema, Types, model } from "mongoose";

export type UserRole = "user" | "admin";

export interface RefreshSession {
  sessionId: string;
  tokenHash: string;
  createdAt: Date;
  expiresAt: Date;
}

export interface UserDocument extends Document<Types.ObjectId> {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  verified: boolean;
  bio?: string;
  avatarUrl?: string;
  socialLinks: {
    website?: string;
    twitter?: string;
    github?: string;
    linkedin?: string;
  };
  refreshSessions: RefreshSession[];
  bannedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  comparePassword: (raw: string) => Promise<boolean>;
}

interface UserModel extends Model<UserDocument> {}

const refreshSessionSchema = new Schema<RefreshSession>(
  {
    sessionId: { type: String, required: true },
    tokenHash: { type: String, required: true },
    createdAt: { type: Date, required: true, default: Date.now },
    expiresAt: { type: Date, required: true },
  },
  { _id: false },
);

const userSchema = new Schema<UserDocument, UserModel>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 8 },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    verified: { type: Boolean, default: false },
    bio: { type: String, default: "" },
    avatarUrl: { type: String, default: "" },
    socialLinks: {
      website: { type: String, default: "" },
      twitter: { type: String, default: "" },
      github: { type: String, default: "" },
      linkedin: { type: String, default: "" },
    },
    refreshSessions: { type: [refreshSessionSchema], default: [] },
    bannedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1, createdAt: -1 });

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) {
    next();
    return;
  }

  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function comparePassword(
  raw: string,
): Promise<boolean> {
  return bcrypt.compare(raw, this.password);
};

export const UserModel = model<UserDocument, UserModel>("User", userSchema);
