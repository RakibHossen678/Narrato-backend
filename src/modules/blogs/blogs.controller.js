const { StatusCodes } = require("http-status-codes");
const catchAsync = require("../../helper/utils/catchAsync");
const sendResponse = require("../../helper/utils/sendResponse");
const blogsServices = require("./blogs.services");
const { uploadBufferToCloudinary } = require("../../helper/utils/cloudinary");

const createBlogHandler = catchAsync(async (req, res) => {
  const blog = await blogsServices.createBlog({
    user: req.user,
    payload: req.body,
  });

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "Blog created successfully",
    data: blog,
  });
});

const updateBlogHandler = catchAsync(async (req, res) => {
  const { blogId } = req.params;
  const blog = await blogsServices.updateBlog({
    blogId,
    user: req.user,
    payload: req.body,
  });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Blog updated successfully",
    data: blog,
  });
});

const deleteBlogHandler = catchAsync(async (req, res) => {
  const { blogId } = req.params;
  const result = await blogsServices.deleteBlog({
    blogId,
    user: req.user,
  });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Blog deleted successfully",
    data: result,
  });
});

const getSingleBlogHandler = catchAsync(async (req, res) => {
  const { blogId } = req.params;
  const blog = await blogsServices.getBlogById({
    blogId,
    user: req.user,
  });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Blog fetched successfully",
    data: blog,
  });
});

const getSingleBlogHandlerBySlug = catchAsync(async (req, res) => {
  const { slug } = req.params;
  const blog = await blogsServices.getBlogBySlug({
    slug,
    user: req.user,
  });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Blog fetched successfully",
    data: blog,
  });
});

const getAllBlogsHandler = catchAsync(async (req, res) => {
  const result = await blogsServices.listBlogs(req.query);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Blogs fetched successfully",
    meta: result.meta,
    data: result.items,
  });
});

const toggleBookmarkHandler = catchAsync(async (req, res) => {
  const { blogId } = req.params;
  const result = await blogsServices.toggleBookmark({
    blogId,
    userId: req.user?.userId,
  });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: `Bookmark ${result.action} successfully`,
    data: result,
  });
});

const incrementShareHandler = catchAsync(async (req, res) => {
  const { blogId } = req.params;
  const result = await blogsServices.incrementShareCount({ blogId });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Blog shared successfully",
    data: result,
  });
});

const uploadBlogImageHandler = catchAsync(async (req, res) => {
  if (!req.file?.buffer) {
    sendResponse(res, {
      statusCode: StatusCodes.BAD_REQUEST,
      success: false,
      message: "Image file is required",
      data: null,
    });
    return;
  }

  const uploaded = await uploadBufferToCloudinary(req.file.buffer);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "Image uploaded successfully",
    data: {
      url: uploaded.secure_url,
      publicId: uploaded.public_id,
      width: uploaded.width,
      height: uploaded.height,
    },
  });
});

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
  createBlogHandler,
  updateBlogHandler,
  deleteBlogHandler,
  getSingleBlogHandler,
  getSingleBlogHandlerBySlug,
  getAllBlogsHandler,
  toggleBookmarkHandler,
  incrementShareHandler,
  uploadBlogImageHandler,
  voteOnBlogHandler,
};
