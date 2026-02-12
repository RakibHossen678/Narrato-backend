const catchAsync = require("../../helper/utils/catchAsync");
const sendResponse = require("../../helper/utils/sendResponse");
const { getUser } = require("./user.services");

const getUserHandler = catchAsync(async (req, res) => {
  const result = await getUser(req.user);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "User retrieved successfully",
    data: result,
  });
});

module.exports = {
  getUserHandler,
};
