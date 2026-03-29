import { NextFunction, Request, Response } from "express";
import { redis } from "../config/redis";

interface RateLimitConfig {
  windowSec: number;
  max: number;
  prefix: string;
}

export const createRedisRateLimiter = (config: RateLimitConfig) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    if (!redis) {
      next();
      return;
    }

    const key = `${config.prefix}:${req.ip}`;
    const count = await redis.incr(key);
    if (count === 1) {
      await redis.expire(key, config.windowSec);
    }

    if (count > config.max) {
      res.status(429).json({ success: false, message: "Too many requests" });
      return;
    }

    next();
  };
};
