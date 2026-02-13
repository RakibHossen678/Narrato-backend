const { StatusCodes } = require("http-status-codes");
const catchAsync = require("../../helper/utils/catchAsync");
const sendResponse = require("../../helper/utils/sendResponse");
const blogsServices = require("./blogs.services");

const voteOnBlogHandler = catchAsync(async (req, res) => {
  const { blogId } = req.params;
  const { vote } = req.body;

  const result = await blogsServices.voteOnBlog({
    blogId,
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
  voteOnBlogHandler,
};
