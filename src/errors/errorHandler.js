const { StatusCodes } = require("http-status-codes");

const globalErrorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  let message = err.message || "Internal Server Error";
  let description =
    err.description || "An unexpected error occurred. Please try again later.";
  let errors = {};

  // Extract file + line + column from stack
  let file = null;
  let line = null;
  let column = null;

  if (err.stack) {
    const stackLines = err.stack.split("\n");
    // typical format: at filePath:line:column
    const match = stackLines[1]?.match(/\((.*):(\d+):(\d+)\)/);

    if (match) {
      file = match[1];
      line = match[2];
      column = match[3];
    }
  }

  // 🔹 Mongoose Validation Errors
  if (err.name === "ValidationError") {
    statusCode = StatusCodes.BAD_REQUEST;
    message = "Validation Error";
    description =
      "One or more required fields are invalid or missing. Please check the request body.";
    errors = Object.keys(err.errors).reduce((acc, key) => {
      acc[key] = err.errors[key].message;
      return acc;
    }, {});
  }

  // 🔹 Duplicate key
  if (err.code === 11000) {
    statusCode = StatusCodes.BAD_REQUEST;
    message = "Duplicate Key Error";
    description = `Duplicate value exists for '${Object.keys(err.keyValue).join(
      ", "
    )}'`;
    errors = Object.keys(err.keyValue).reduce((acc, key) => {
      acc[
        key
      ] = `${key} must be unique. '${err.keyValue[key]}' already exists.`;
      return acc;
    }, {});
  }

  // 🔹 CastError (invalid ObjectId)
  if (err.name === "CastError") {
    statusCode = StatusCodes.BAD_REQUEST;
    message = `Invalid ${err.path}: ${err.value}`;
    description = `The provided ${err.path} value is not valid.`;
    errors[err.path] = `Invalid ${err.path}: ${err.value}`;
  }

  // 🔹 DB Connection Errors
  if (
    err.name === "MongoNetworkError" ||
    err.name === "MongooseServerSelectionError"
  ) {
    statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    message = "Database Connection Error";
    description = "Unable to connect to database. Check server/network.";
  }

  // 🔹 Timeout
  if (err.name === "MongoTimeoutError") {
    statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    message = "Database Timeout";
    description = "Database request timed out.";
  }

  // 🔹 Other Mongo errors
  if (err.name === "MongoError") {
    statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    message = "Database Error";
    description = "Unknown database error occurred.";
  }

  res.status(statusCode).json({
    success: false,
    message,
    error: {
      code: statusCode,
      description: err._message || description,
      details: Object.keys(errors).length ? errors : undefined,
      location: file
        ? {
            file,
            line: Number(line),
            column: Number(column),
          }
        : undefined,
    },
  });
};

module.exports = globalErrorHandler;
