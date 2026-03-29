import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { Types } from "mongoose";
import { env } from "../config/env";

interface TokenPayload {
  sub: string;
  role: "user" | "admin";
  email: string;
  verified: boolean;
  sid?: string;
}

const sign = (
  payload: TokenPayload,
  secret: string,
  expiresIn: string,
): string => {
  const options: SignOptions = {
    expiresIn: expiresIn as SignOptions["expiresIn"],
  };
  return jwt.sign(payload, secret as Secret, options);
};

export const createAccessToken = (
  payload: Omit<TokenPayload, "sid">,
): string => {
  return sign(payload, env.jwtAccessSecret, env.accessTokenTtl);
};

export const createRefreshToken = (payload: TokenPayload): string => {
  return sign(payload, env.jwtRefreshSecret, env.refreshTokenTtl);
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, env.jwtAccessSecret) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, env.jwtRefreshSecret) as TokenPayload;
};

export const toObjectId = (id: string): Types.ObjectId =>
  new Types.ObjectId(id);

export const paramToString = (value: string | string[]): string =>
  Array.isArray(value) ? value[0] : value;
