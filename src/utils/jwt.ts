import jwt, { SignOptions } from "jsonwebtoken";

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

const JWT_ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || "15m";
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "30d";

if (!JWT_ACCESS_SECRET) throw new Error("JWT_ACCESS_SECRET is missing in .env");
if (!JWT_REFRESH_SECRET) throw new Error("JWT_REFRESH_SECRET is missing in .env");

/**
 * Generate Access Token (short-lived)
 */
export const generateAccessToken = (
  payload: object,
  expiresIn: string = JWT_ACCESS_EXPIRES_IN
) => {
  const options: SignOptions = { expiresIn };
  return jwt.sign(payload, JWT_ACCESS_SECRET, options);
};

/**
 * Generate Refresh Token (long-lived)
 */
export const generateRefreshToken = (
  payload: object,
  expiresIn: string = JWT_REFRESH_EXPIRES_IN
) => {
  const options: SignOptions = { expiresIn };
  return jwt.sign(payload, JWT_REFRESH_SECRET, options);
};

/**
 * Verify Access Token
 */
export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, JWT_ACCESS_SECRET);
};

/**
 * Verify Refresh Token
 */
export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, JWT_REFRESH_SECRET);
};

export type JwtPayload = {
  sub: string;
  email: string;
  role: string;
  client: 'admin' | 'customer';
};