import { Request, Response } from "express";
import {
  createBlog,
  deleteBlog,
  getBlogBySlug,
  listBlogs,
  listFollowingFeed,
  listTrendingBlogs,
  updateBlog,
} from "../services/blog.service";
import { asyncHandler } from "../utils/asyncHandler";
import { sendResponse } from "../utils/response";
import { paramToString, toObjectId } from "../utils/tokens";

export const createBlogController = asyncHandler(
  async (req: Request, res: Response) => {
    const blog = await createBlog(req.user!.id, req.body);
    sendResponse(res, 201, blog, "Blog created");
  },
);

export const updateBlogController = asyncHandler(
  async (req: Request, res: Response) => {
    const blog = await updateBlog(
      toObjectId(paramToString(req.params.blogId)),
      req.user!.id,
      req.body,
    );
    sendResponse(res, 200, blog, "Blog updated");
  },
);

export const deleteBlogController = asyncHandler(
  async (req: Request, res: Response) => {
    await deleteBlog(
      toObjectId(paramToString(req.params.blogId)),
      req.user!.id,
    );
    sendResponse(res, 200, null, "Blog deleted");
  },
);

export const listBlogsController = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await listBlogs(req.query as Record<string, string>);
    sendResponse(res, 200, result);
  },
);

export const getBlogBySlugController = asyncHandler(
  async (req: Request, res: Response) => {
    const blog = await getBlogBySlug(paramToString(req.params.slug));
    sendResponse(res, 200, blog);
  },
);

export const trendingBlogsController = asyncHandler(
  async (_req: Request, res: Response) => {
    const blogs = await listTrendingBlogs();
    sendResponse(res, 200, blogs);
  },
);

export const followingFeedController = asyncHandler(
  async (req: Request, res: Response) => {
    const feed = await listFollowingFeed(
      req.user!.id,
      String(req.query.page ?? "1"),
      String(req.query.limit ?? "10"),
    );
    sendResponse(res, 200, feed);
  },
);
