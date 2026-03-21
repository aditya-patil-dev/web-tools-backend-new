"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const HttpException_1 = __importDefault(require("../exceptions/HttpException"));
const index_schema_1 = __importDefault(require("../database/index.schema"));
/*
====================================================
PUBLIC ROUTES CONFIG (METHOD BASED)
====================================================
*/
const PUBLIC_ROUTES = [
    { path: "/api/v1/users/login", methods: ["POST"] },
    { path: "/api/v1/users/register", methods: ["POST"] },
    { path: "/api/v1/page-components", methods: ["GET"] },
    { path: "/api/v1/tools", methods: ["GET"] },
    { path: "/api/v1/tools", methods: ["POST"] },
    { path: "/api/v1/seo", methods: ["GET"] },
    { path: "/api/v1/seo/static", methods: ["GET"] },
    { path: "/api/v1/contact", methods: ["POST"] },
    { path: "/api/v1/uploads", methods: ["GET"] },
    { path: "/api/v1/settings", methods: ["GET"] },
    { path: "/api/v1/keyword", methods: ["GET"] },
    // Legal Pages (ONLY PUBLIC GET, NOT ADMIN)
    { path: "/api/v1/legal-pages", methods: ["GET"] },
    // Public tool actions — called by unauthenticated visitors
    { path: "/api/v1/tools/events/track", methods: ["POST"] },
    { path: "/api/v1/tools/speed-test", methods: ["POST"] },
    { path: "/api/v1/tools/og-check", methods: ["POST"] },
];
/*
====================================================
HELPER: CHECK PUBLIC ROUTE
====================================================
*/
const isPublicRoute = (url, method) => {
    // ❗ Block admin routes explicitly
    if (url.startsWith("/api/v1/legal-pages/admin")) {
        return false;
    }
    return PUBLIC_ROUTES.some((route) => url.startsWith(route.path) && route.methods.includes(method));
};
/*
====================================================
AUTH MIDDLEWARE
====================================================
*/
const authMiddleware = async (req, res, next) => {
    var _a;
    try {
        await index_schema_1.default.raw("SET search_path TO public");
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
        let token;
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
        if (!token && ((_a = req.cookies) === null || _a === void 0 ? void 0 : _a.admin_token)) {
            token = req.cookies.admin_token;
        }
        if (!token) {
            return next(new HttpException_1.default(401, "Authentication token missing"));
        }
        /*
        ====================================================
        VERIFY JWT
        ====================================================
        */
        const secret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;
        if (!secret) {
            return next(new HttpException_1.default(500, "JWT secret not configured"));
        }
        const payload = jsonwebtoken_1.default.verify(token, secret);
        if (!(payload === null || payload === void 0 ? void 0 : payload.sub)) {
            return next(new HttpException_1.default(401, "Invalid authentication token"));
        }
        /*
        ====================================================
        ATTACH USER TO REQUEST
        ====================================================
        */
        req.user = {
            id: payload.sub,
            email: payload.email,
            role: payload.role,
            workspace_id: payload.workspace_id,
            member_role: payload.member_role,
            client: payload.client,
        };
        return next();
    }
    catch (err) {
        return next(new HttpException_1.default(401, "Wrong authentication token"));
    }
};
exports.default = authMiddleware;
//# sourceMappingURL=auth.middleware.js.map