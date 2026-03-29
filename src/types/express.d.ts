import { Types } from "mongoose";

declare global {
  namespace Express {
    interface UserPayload {
      id: Types.ObjectId;
      role: "user" | "admin";
      email: string;
      verified: boolean;
    }

    interface Request {
      user?: UserPayload;
    }
  }
}

export {};
