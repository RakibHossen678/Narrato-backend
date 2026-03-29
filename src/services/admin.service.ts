import { Types } from "mongoose";
import { BlogModel } from "../models/blog.model";
import { ReportModel } from "../models/report.model";
import { UserModel } from "../models/user.model";
import { AdminLogModel } from "../models/admin-log.model";
import { redis } from "../config/redis";

export const banUser = async (
  adminId: Types.ObjectId,
  userId: Types.ObjectId,
): Promise<void> => {
  await UserModel.updateOne({ _id: userId }, { bannedAt: new Date() });
  await AdminLogModel.create({
    adminId,
    action: "ban-user",
    targetType: "user",
    targetId: userId,
    metadata: {},
  });
};

export const unbanUser = async (
  adminId: Types.ObjectId,
  userId: Types.ObjectId,
): Promise<void> => {
  await UserModel.updateOne({ _id: userId }, { bannedAt: null });
  await AdminLogModel.create({
    adminId,
    action: "unban-user",
    targetType: "user",
    targetId: userId,
    metadata: {},
  });
};

export const featureBlog = async (
  adminId: Types.ObjectId,
  blogId: Types.ObjectId,
  featured: boolean,
): Promise<void> => {
  await BlogModel.updateOne({ _id: blogId }, { featured });
  await AdminLogModel.create({
    adminId,
    action: featured ? "feature-blog" : "unfeature-blog",
    targetType: "blog",
    targetId: blogId,
    metadata: { featured },
  });
};

export const deleteBlogByAdmin = async (
  adminId: Types.ObjectId,
  blogId: Types.ObjectId,
): Promise<void> => {
  await BlogModel.deleteOne({ _id: blogId });
  await AdminLogModel.create({
    adminId,
    action: "delete-blog",
    targetType: "blog",
    targetId: blogId,
    metadata: {},
  });
};

export const resolveReport = async (
  adminId: Types.ObjectId,
  reportId: Types.ObjectId,
  status: "resolved" | "rejected",
  moderatorNote: string,
): Promise<void> => {
  await ReportModel.updateOne({ _id: reportId }, { status, moderatorNote });
  await AdminLogModel.create({
    adminId,
    action: "resolve-report",
    targetType: "report",
    targetId: reportId,
    metadata: { status },
  });
};

export const getAnalytics = async () => {
  const [users, blogs, reportsOpen, reportedContent] = await Promise.all([
    UserModel.countDocuments(),
    BlogModel.countDocuments(),
    ReportModel.countDocuments({ status: "open" }),
    ReportModel.countDocuments(),
  ]);

  const redisInfo = redis ? await redis.info("stats") : "redis_disabled";

  return {
    totals: {
      users,
      blogs,
      reportsOpen,
      reportedContent,
    },
    redisStats: redisInfo,
  };
};
