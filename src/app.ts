import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware";
import { createRedisRateLimiter } from "./middlewares/rate-limit.middleware";
import routes from "./routes";

export const app = express();

app.use(helmet());
app.use(compression());
app.use(
  cors({
    origin: env.clientOrigin,
    credentials: true,
  }),
);
app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));

app.use(
  createRedisRateLimiter({ prefix: "rl:global", windowSec: 60, max: 100 }),
);

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/v1", routes);
app.use(notFoundHandler);
app.use(errorHandler);
