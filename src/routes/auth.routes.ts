import { Router } from "express";
import { body, query } from "express-validator";
import {
  forgotPasswordController,
  loginController,
  logoutController,
  refreshController,
  registerController,
  resetPasswordController,
  verifyEmailController,
} from "../controllers/auth.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { createRedisRateLimiter } from "../middlewares/rate-limit.middleware";
import { validateRequest } from "../middlewares/validation.middleware";

const router = Router();
const authLimiter = createRedisRateLimiter({
  prefix: "rl:auth",
  windowSec: 60,
  max: 20,
});

router.post(
  "/register",
  authLimiter,
  body("name").isLength({ min: 2 }),
  body("email").isEmail(),
  body("password").isLength({ min: 8 }),
  validateRequest,
  registerController,
);

router.get(
  "/verify-email",
  authLimiter,
  query("token").isString(),
  validateRequest,
  verifyEmailController,
);
router.post(
  "/login",
  authLimiter,
  body("email").isEmail(),
  body("password").isString(),
  validateRequest,
  loginController,
);
router.post(
  "/refresh",
  authLimiter,
  body("refreshToken").isString(),
  validateRequest,
  refreshController,
);
router.post("/logout", requireAuth, logoutController);
router.post(
  "/forgot-password",
  authLimiter,
  body("email").isEmail(),
  validateRequest,
  forgotPasswordController,
);
router.post(
  "/reset-password",
  authLimiter,
  body("token").isString(),
  body("password").isLength({ min: 8 }),
  validateRequest,
  resetPasswordController,
);

export default router;
