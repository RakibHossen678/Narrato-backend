const { StatusCodes } = require("http-status-codes");
const catchAsync = require("../../helper/utils/catchAsync");
const sendResponse = require("../../helper/utils/sendResponse");
const commentsServices = require("./comments.services");

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
  voteOnCommentHandler,
};
