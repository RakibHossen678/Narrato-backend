import Redis from "ioredis";
import { env } from "./env";

export const redis = env.redisUrl
  ? new Redis(env.redisUrl, {
      maxRetriesPerRequest: 2,
      enableReadyCheck: false,
    })
  : null;

if (redis) {
  redis.on("error", (error) => {
    // Keep server healthy; logging here is enough when Redis is unavailable.
    console.error("Redis error:", error.message);
  });
}
