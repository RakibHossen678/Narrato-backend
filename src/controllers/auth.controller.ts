import { Request, Response } from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
  requestPasswordReset,
  resetPassword,
  rotateRefreshToken,
  verifyEmail,
} from "../services/auth.service";
import { asyncHandler } from "../utils/asyncHandler";
import { sendResponse } from "../utils/response";

export const registerController = asyncHandler(
  async (req: Request, res: Response) => {
    await registerUser(req.body);
    sendResponse(res, 201, null, "Registration successful. Verify your email.");
  },
);

export const verifyEmailController = asyncHandler(
  async (req: Request, res: Response) => {
    await verifyEmail(String(req.query.token ?? ""));
    sendResponse(res, 200, null, "Email verified.");
  },
);

export const loginController = asyncHandler(
  async (req: Request, res: Response) => {
    const { user, tokens } = await loginUser(req.body.email, req.body.password);
    sendResponse(
      res,
      200,
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          verified: user.verified,
          bio: user.bio,
          avatarUrl: user.avatarUrl,
          socialLinks: user.socialLinks,
        },
        ...tokens,
      },
      "Login successful",
    );
  },
);

export const refreshController = asyncHandler(
  async (req: Request, res: Response) => {
    const tokens = await rotateRefreshToken(req.body.refreshToken);
    sendResponse(res, 200, tokens, "Token refreshed");
  },
);

export const logoutController = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      sendResponse(res, 401, null, "Unauthorized");
      return;
    }

    await logoutUser(req.user.id, req.body.sessionId);
    sendResponse(res, 200, null, "Logged out");
  },
);

export const forgotPasswordController = asyncHandler(
  async (req: Request, res: Response) => {
    await requestPasswordReset(req.body.email);
    sendResponse(
      res,
      200,
      null,
      "If the email exists, a reset link has been sent.",
    );
  },
);

export const resetPasswordController = asyncHandler(
  async (req: Request, res: Response) => {
    await resetPassword(req.body.token, req.body.password);
    sendResponse(res, 200, null, "Password reset successful.");
  },
);
