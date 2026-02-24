import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import HttpException from "../exceptions/HttpException";
import DB from "../database/index.schema";

/**
 * Add more public endpoints here if needed
 * These routes will bypass JWT auth
 */
const PUBLIC_PATHS: string[] = [
  "/api/v1/users/login",
  "/api/v1/users/register",
  "/api/v1/tools",
  "/api/v1/admin/tools",
  "/api/v1/admin/tool-pages",
  "/api/v1/seo",
  "/api/v1/seo/static",
  "/api/v1/page-components",
  // "/api/v1/users/forgot-password",
];

type AuthTokenPayload = {
  sub: number;
  email: string;
  role: string;
  workspace_id: number;
  member_role?: string;
  client?: string;
  iat?: number;
  exp?: number;
};

const authMiddleware: RequestHandler = async (req, res, next) => {
  try {
    await DB.raw("SET search_path TO public");

    const url = req.originalUrl || req.url;

    if (PUBLIC_PATHS.some((p) => url.startsWith(p))) {
      return next();
    }

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return next(new HttpException(401, "Authentication token missing"));
    }

    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token || token === "null") {
      return next(new HttpException(401, "Invalid Authorization header"));
    }

    // 3) Verify JWT
    const secret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;
    if (!secret) {
      return next(new HttpException(500, "JWT secret is not configured"));
    }

    const payload = jwt.verify(token, secret) as AuthTokenPayload;

    if (!payload?.sub) {
      return next(new HttpException(401, "Invalid authentication token"));
    }

    (req as any).user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      workspace_id: payload.workspace_id,
      member_role: payload.member_role,
      client: payload.client,
    };

    return next();
  } catch (err) {
    return next(new HttpException(401, "Wrong authentication token"));
  }
};

export default authMiddleware;
