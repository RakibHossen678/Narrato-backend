import { Response } from "express";

export const sendResponse = <T>(
  res: Response,
  statusCode: number,
  data: T,
  message = "OK",
): void => {
  res.status(statusCode).json({
    success: statusCode < 400,
    message,
    data,
  });
};
