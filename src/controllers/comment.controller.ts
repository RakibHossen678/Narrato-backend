import { Request, Response } from "express";
import {
  createComment,
  listComments,
  reactToComment,
  softDeleteComment,
} from "../services/comment.service";
import { asyncHandler } from "../utils/asyncHandler";
import { sendResponse } from "../utils/response";
import { paramToString, toObjectId } from "../utils/tokens";

export const createCommentController = asyncHandler(
  async (req: Request, res: Response) => {
    const comment = await createComment(
      toObjectId(paramToString(req.params.blogId)),
      req.user!.id,
      req.body.content,
      req.body.parentId ? toObjectId(req.body.parentId) : undefined,
    );
    sendResponse(res, 201, comment, "Comment created");
  },
);

export const listCommentsController = asyncHandler(
  async (req: Request, res: Response) => {
    const comments = await listComments(
      toObjectId(paramToString(req.params.blogId)),
    );
    sendResponse(res, 200, comments);
  },
);

export const deleteCommentController = asyncHandler(
  async (req: Request, res: Response) => {
    await softDeleteComment(
      toObjectId(paramToString(req.params.commentId)),
      req.user!.id,
    );
    sendResponse(res, 200, null, "Comment deleted");
  },
);

export const reactCommentController = asyncHandler(
  async (req: Request, res: Response) => {
    await reactToComment(
      toObjectId(paramToString(req.params.commentId)),
      req.user!.id,
      req.body.reaction,
    );
    sendResponse(res, 200, null, "Comment reaction saved");
  },
);
