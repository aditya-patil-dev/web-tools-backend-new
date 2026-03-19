import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import HttpException from "../exceptions/HttpException";
import DB from "../database/index.schema";

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

/*
====================================================
PUBLIC ROUTES CONFIG (METHOD BASED)
====================================================
*/

const PUBLIC_ROUTES: { path: string; methods: string[] }[] = [
  { path: "/api/v1/users/login", methods: ["POST"] },
  { path: "/api/v1/users/register", methods: ["POST"] },
  { path: "/api/v1/page-components", methods: ["GET"] },
  { path: "/api/v1/tools", methods: ["GET"] },
  { path: "/api/v1/seo", methods: ["GET"] },
  { path: "/api/v1/seo/static", methods: ["GET"] },
  { path: "/api/v1/contact", methods: ["POST"] },
  { path: "/api/v1/uploads", methods: ["GET"] },
  { path: "/api/v1/settings", methods: ["GET"] },
  { path: "/api/v1/keyword", methods: ["GET"] },

  // Legal Pages (ONLY PUBLIC GET, NOT ADMIN)
  { path: "/api/v1/legal-pages", methods: ["GET"] },
];

/*
====================================================
HELPER: CHECK PUBLIC ROUTE
====================================================
*/

const isPublicRoute = (url: string, method: string): boolean => {
  // ❗ Block admin routes explicitly
  if (url.startsWith("/api/v1/legal-pages/admin")) {
    return false;
  }

  return PUBLIC_ROUTES.some(
    (route) => url.startsWith(route.path) && route.methods.includes(method),
  );
};

/*
====================================================
AUTH MIDDLEWARE
====================================================
*/

const authMiddleware: RequestHandler = async (req, res, next) => {
  try {
    await DB.raw("SET search_path TO public");

    const url = req.originalUrl || req.url;
    const method = req.method;

    console.log("URL:", url, "| METHOD:", method);

    /*
    ====================================================
    CHECK PUBLIC ROUTE
    ====================================================
    */

    if (isPublicRoute(url, method)) {
      return next();
    }

    /*
    ====================================================
    GET TOKEN FROM HEADER
    ====================================================
    */

    let token: string | undefined;

    const authHeader = req.headers.authorization;

    if (authHeader) {
      const [scheme, headerToken] = authHeader.split(" ");

      if (scheme === "Bearer" && headerToken && headerToken !== "null") {
        token = headerToken;
      }
    }

    /*
    ====================================================
    FALLBACK TO COOKIE
    ====================================================
    */

    if (!token && req.cookies?.admin_token) {
      token = req.cookies.admin_token;
    }

    if (!token) {
      return next(new HttpException(401, "Authentication token missing"));
    }

    /*
    ====================================================
    VERIFY JWT
    ====================================================
    */

    const secret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;

    if (!secret) {
      return next(new HttpException(500, "JWT secret not configured"));
    }

    const payload = jwt.verify(token, secret) as AuthTokenPayload;

    if (!payload?.sub) {
      return next(new HttpException(401, "Invalid authentication token"));
    }

    /*
    ====================================================
    ATTACH USER TO REQUEST
    ====================================================
    */

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
