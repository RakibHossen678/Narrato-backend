import crypto from "crypto";
import bcrypt from "bcryptjs";
import { Types } from "mongoose";
import { env } from "../config/env";
import { mailTransporter } from "../config/mail";
import { emailQueue } from "../config/queue";
import { UserDocument, UserModel } from "../models/user.model";
import { VerificationTokenModel } from "../models/verification-token.model";
import { AppError } from "../utils/AppError";
import {
  createAccessToken,
  createRefreshToken,
  verifyRefreshToken,
} from "../utils/tokens";

interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

const hashToken = (token: string): string =>
  crypto.createHash("sha256").update(token).digest("hex");

const buildVerificationLink = (
  token: string,
  type: "verify-email" | "reset-password",
): string => `${env.appUrl}/auth/${type}?token=${token}`;

const sendEmail = async (
  to: string,
  subject: string,
  html: string,
): Promise<void> => {
  if (emailQueue) {
    await emailQueue.add("send-email", { to, subject, html });
    return;
  }

  await mailTransporter.sendMail({ from: env.smtpFrom, to, subject, html });
};

const issueTokens = async (user: UserDocument): Promise<AuthTokens> => {
  const sessionId = crypto.randomUUID();

  const refreshToken = createRefreshToken({
    sub: String(user._id),
    role: user.role,
    email: user.email,
    verified: user.verified,
    sid: sessionId,
  });

  const accessToken = createAccessToken({
    sub: String(user._id),
    role: user.role,
    email: user.email,
    verified: user.verified,
  });

  user.refreshSessions.push({
    sessionId,
    tokenHash: await bcrypt.hash(refreshToken, 10),
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
  });
  await user.save();

  return { accessToken, refreshToken };
};

export const registerUser = async (payload: RegisterInput): Promise<void> => {
  const existing = await UserModel.findOne({
    email: payload.email.toLowerCase(),
  });
  if (existing) {
    throw new AppError("Email already in use", 409);
  }

  const user = await UserModel.create({
    name: payload.name,
    email: payload.email.toLowerCase(),
    password: payload.password,
  });

  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(rawToken);
  await VerificationTokenModel.create({
    userId: user._id,
    tokenHash,
    tokenType: "verify-email",
    expiresAt: new Date(Date.now() + 1000 * 60 * 30),
  });

  await sendEmail(
    user.email,
    "Verify your Narrato account",
    `<p>Welcome to Narrato. Verify your email:</p><a href=\"${buildVerificationLink(rawToken, "verify-email")}\">Verify email</a>`,
  );
};

export const verifyEmail = async (token: string): Promise<void> => {
  const tokenHash = hashToken(token);
  const doc = await VerificationTokenModel.findOne({
    tokenHash,
    tokenType: "verify-email",
    expiresAt: { $gt: new Date() },
  });

  if (!doc) {
    throw new AppError("Invalid or expired token", 400);
  }

  await UserModel.findByIdAndUpdate(doc.userId, { verified: true });
  await VerificationTokenModel.deleteMany({
    userId: doc.userId,
    tokenType: "verify-email",
  });
};

export const loginUser = async (
  email: string,
  password: string,
): Promise<{ user: UserDocument; tokens: AuthTokens }> => {
  const user = await UserModel.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }

  if (user.bannedAt) {
    throw new AppError("Account is banned", 403);
  }

  const isValid = await user.comparePassword(password);
  if (!isValid) {
    throw new AppError("Invalid credentials", 401);
  }

  const tokens = await issueTokens(user);
  return { user, tokens };
};

export const rotateRefreshToken = async (
  token: string,
): Promise<AuthTokens> => {
  const payload = verifyRefreshToken(token);
  if (!payload.sid) {
    throw new AppError("Malformed refresh token", 401);
  }

  const user = await UserModel.findById(payload.sub);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  const session = user.refreshSessions.find(
    (item) => item.sessionId === payload.sid,
  );
  if (!session) {
    throw new AppError("Session not found", 401);
  }

  const matches = await bcrypt.compare(token, session.tokenHash);
  if (!matches) {
    throw new AppError("Invalid refresh token", 401);
  }

  user.refreshSessions = user.refreshSessions.filter(
    (item) => item.sessionId !== payload.sid,
  );
  await user.save();

  return issueTokens(user);
};

export const logoutUser = async (
  userId: Types.ObjectId,
  sessionId?: string,
): Promise<void> => {
  if (!sessionId) {
    await UserModel.findByIdAndUpdate(userId, { refreshSessions: [] });
    return;
  }

  await UserModel.findByIdAndUpdate(userId, {
    $pull: { refreshSessions: { sessionId } },
  });
};

export const requestPasswordReset = async (email: string): Promise<void> => {
  const user = await UserModel.findOne({ email: email.toLowerCase() });
  if (!user) {
    return;
  }

  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(rawToken);
  await VerificationTokenModel.create({
    userId: user._id,
    tokenHash,
    tokenType: "reset-password",
    expiresAt: new Date(Date.now() + 1000 * 60 * 20),
  });

  await sendEmail(
    user.email,
    "Reset your Narrato password",
    `<p>Reset your password:</p><a href=\"${buildVerificationLink(rawToken, "reset-password")}\">Reset password</a>`,
  );
};

export const resetPassword = async (
  token: string,
  newPassword: string,
): Promise<void> => {
  const tokenHash = hashToken(token);
  const doc = await VerificationTokenModel.findOne({
    tokenHash,
    tokenType: "reset-password",
    expiresAt: { $gt: new Date() },
  });

  if (!doc) {
    throw new AppError("Invalid or expired token", 400);
  }

  const user = await UserModel.findById(doc.userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  user.password = newPassword;
  user.refreshSessions = [];
  await user.save();
  await VerificationTokenModel.deleteMany({
    userId: user._id,
    tokenType: "reset-password",
  });
};
