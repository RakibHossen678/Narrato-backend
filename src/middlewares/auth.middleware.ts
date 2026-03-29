import { NextFunction, Request, Response } from "express";
import { Types } from "mongoose";
import { AppError } from "../utils/AppError";
import { verifyAccessToken } from "../utils/tokens";

export const requireAuth = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) {
    next(new AppError("Unauthorized", 401));
    return;
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = {
      id: new Types.ObjectId(payload.sub),
      role: payload.role,
      email: payload.email,
      verified: payload.verified,
    };
    next();
  } catch {
    next(new AppError("Invalid access token", 401));
  }
};

export const requireRole = (role: "admin" | "user") => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError("Unauthorized", 401));
      return;
    }

    if (req.user.role !== role) {
      next(new AppError("Forbidden", 403));
      return;
    }

    next();
  };
};
