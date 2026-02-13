const { StatusCodes } = require("http-status-codes");
const catchAsync = require("../../helper/utils/catchAsync");
const sendResponse = require("../../helper/utils/sendResponse");
const commentsServices = require("./comments.services");

const createCommentHandler = catchAsync(async (req, res) => {
  const { blogId, content } = req.body;

  const comment = await commentsServices.createComment({
    userId: req.user?.userId,
    blogId,
    content,
  });

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "Comment created successfully",
    data: comment,
  });
});

const replyToCommentHandler = catchAsync(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;

  const reply = await commentsServices.replyToComment({
    userId: req.user?.userId,
    parentCommentId: commentId,
    content,
  });

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "Reply created successfully",
    data: reply,
  });
});

const listRootCommentsByBlogHandler = catchAsync(async (req, res) => {
  const { blogId, page, limit } = req.query;
  const result = await commentsServices.listRootCommentsByBlog({
    blogId,
    page,
    limit,
  });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Comments fetched successfully",
    data: result,
  });
});

const listRepliesHandler = catchAsync(async (req, res) => {
  const { commentId } = req.params;
  const { page, limit } = req.query;
  const result = await commentsServices.listReplies({
    parentCommentId: commentId,
    page,
    limit,
  });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Replies fetched successfully",
    data: result,
  });
});

const listThreadHandler = catchAsync(async (req, res) => {
  const { rootCommentId } = req.params;
  const { page, limit } = req.query;
  const result = await commentsServices.listThread({
    rootCommentId,
    page,
    limit,
  });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Thread fetched successfully",
    data: result,
  });
});

const voteOnCommentHandler = catchAsync(async (req, res) => {
  const { commentId } = req.params;
  const { vote } = req.body;

  const result = await commentsServices.voteOnComment({
    commentId,
    userId: req.user?.userId,
    vote,
  });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: `Vote ${result.action} successfully`,
    data: result,
  });
});

module.exports = {
  createCommentHandler,
  replyToCommentHandler,
  listRootCommentsByBlogHandler,
  listRepliesHandler,
  listThreadHandler,
  voteOnCommentHandler,
};
