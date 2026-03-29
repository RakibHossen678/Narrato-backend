import { Request, Response } from "express";
import {
  banUser,
  deleteBlogByAdmin,
  featureBlog,
  getAnalytics,
  resolveReport,
  unbanUser,
} from "../services/admin.service";
import { asyncHandler } from "../utils/asyncHandler";
import { sendResponse } from "../utils/response";
import { paramToString, toObjectId } from "../utils/tokens";

export const banUserController = asyncHandler(
  async (req: Request, res: Response) => {
    await banUser(req.user!.id, toObjectId(paramToString(req.params.userId)));
    sendResponse(res, 200, null, "User banned");
  },
);

export const unbanUserController = asyncHandler(
  async (req: Request, res: Response) => {
    await unbanUser(req.user!.id, toObjectId(paramToString(req.params.userId)));
    sendResponse(res, 200, null, "User unbanned");
  },
);

export const featureBlogController = asyncHandler(
  async (req: Request, res: Response) => {
    await featureBlog(
      req.user!.id,
      toObjectId(paramToString(req.params.blogId)),
      Boolean(req.body.featured),
    );
    sendResponse(res, 200, null, "Blog moderation updated");
  },
);

export const deleteBlogAdminController = asyncHandler(
  async (req: Request, res: Response) => {
    await deleteBlogByAdmin(
      req.user!.id,
      toObjectId(paramToString(req.params.blogId)),
    );
    sendResponse(res, 200, null, "Blog deleted");
  },
);

export const resolveReportController = asyncHandler(
  async (req: Request, res: Response) => {
    await resolveReport(
      req.user!.id,
      toObjectId(paramToString(req.params.reportId)),
      req.body.status,
      req.body.moderatorNote,
    );
    sendResponse(res, 200, null, "Report updated");
  },
);

export const analyticsController = asyncHandler(
  async (_req: Request, res: Response) => {
    const analytics = await getAnalytics();
    sendResponse(res, 200, analytics);
  },
);
