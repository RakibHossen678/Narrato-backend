import { Request, Response } from "express";
import {
  createReport,
  followUser,
  reactToBlog,
  toggleBookmark,
  unfollowUser,
} from "../services/social.service";
import { asyncHandler } from "../utils/asyncHandler";
import { sendResponse } from "../utils/response";
import { paramToString, toObjectId } from "../utils/tokens";

export const followController = asyncHandler(
  async (req: Request, res: Response) => {
    await followUser(
      req.user!.id,
      toObjectId(paramToString(req.params.userId)),
    );
    sendResponse(res, 200, null, "Followed");
  },
);

export const unfollowController = asyncHandler(
  async (req: Request, res: Response) => {
    await unfollowUser(
      req.user!.id,
      toObjectId(paramToString(req.params.userId)),
    );
    sendResponse(res, 200, null, "Unfollowed");
  },
);

export const reactBlogController = asyncHandler(
  async (req: Request, res: Response) => {
    await reactToBlog(
      req.user!.id,
      toObjectId(paramToString(req.params.blogId)),
      req.body.reaction,
    );
    sendResponse(res, 200, null, "Reaction saved");
  },
);

export const bookmarkController = asyncHandler(
  async (req: Request, res: Response) => {
    const bookmarked = await toggleBookmark(
      req.user!.id,
      toObjectId(paramToString(req.params.blogId)),
    );
    sendResponse(
      res,
      200,
      { bookmarked },
      bookmarked ? "Bookmarked" : "Bookmark removed",
    );
  },
);

export const reportController = asyncHandler(
  async (req: Request, res: Response) => {
    const report = await createReport(
      req.user!.id,
      req.body.targetType,
      toObjectId(req.body.targetId),
      req.body.reason,
    );
    sendResponse(res, 201, report, "Report submitted");
  },
);
