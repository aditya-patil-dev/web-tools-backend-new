"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const hpp_1 = __importDefault(require("hpp"));
const morgan_1 = __importDefault(require("morgan"));
const compression_1 = __importDefault(require("compression"));
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
const error_middleware_1 = __importDefault(require("./middlewares/error.middleware"));
const logger_1 = require("./utils/logger");
const auth_middleware_1 = __importDefault(require("./middlewares/auth.middleware"));
class App {
    constructor(routes) {
        var _a, _b;
        this.app = (0, express_1.default)();
        this.port = Number((_a = process.env.PORT) !== null && _a !== void 0 ? _a : 8000);
        this.env = (_b = process.env.NODE_ENV) !== null && _b !== void 0 ? _b : "development";
        this.initializeCoreMiddlewares();
        this.initializeStaticServing();
        this.initializeHealthRoutes();
        this.initializeRoutes(routes);
        this.initializeSwagger();
        this.initializeErrorHandling();
    }
    listen() {
        const server = this.app.listen(this.port, () => {
            logger_1.logger.info(`🚀 App listening on port ${this.port}. Environment: ${this.env}.`);
        });
        // Future-proof: graceful shutdown hooks (doesn't break if unused)
        const shutdown = (signal) => {
            logger_1.logger.info(`🛑 Received ${signal}. Shutting down...`);
            server.close((err) => {
                if (err) {
                    logger_1.logger.error("Error while closing server", err);
                    process.exit(1);
                }
                process.exit(0);
            });
        };
        process.on("SIGTERM", () => shutdown("SIGTERM"));
        process.on("SIGINT", () => shutdown("SIGINT"));
    }
    getServer() {
        return this.app;
    }
    // ----------------------------
    // Core middleware
    // ----------------------------
    initializeCoreMiddlewares() {
        // 1) Request ID for tracing/log correlation
        this.app.use((req, res, next) => {
            const incoming = req.headers["x-request-id"] || "";
            const requestId = incoming.trim() || crypto_1.default.randomUUID();
            req.requestId = requestId;
            res.setHeader("x-request-id", requestId);
            next();
        });
        // 2) Logging
        if (this.env === "production") {
            this.app.use((0, morgan_1.default)("combined", { stream: logger_1.stream }));
        }
        else {
            this.app.use((0, morgan_1.default)("dev", { stream: logger_1.stream }));
        }
        // 3) Security
        this.app.use((0, helmet_1.default)());
        this.app.use((0, hpp_1.default)());
        // 4) Compression
        this.app.use((0, compression_1.default)());
        // 5) Cookies (once, in one place)
        this.app.use((0, cookie_parser_1.default)());
        // 6) CORS (future-proof + correct with credentials)
        this.app.use((0, cors_1.default)(this.getCorsOptions()));
        // 7) Body parsing (safe defaults)
        // NOTE: 2gb is unsafe for public APIs. Increase per-route only if needed.
        const jsonLimit = process.env.JSON_BODY_LIMIT || "5mb";
        const urlEncodedLimit = process.env.URLENCODED_BODY_LIMIT || "5mb";
        this.app.use(express_1.default.json({ limit: jsonLimit }));
        this.app.use(express_1.default.urlencoded({ limit: urlEncodedLimit, extended: true }));
        // 8) Basic hardening headers (optional)
        this.app.disable("x-powered-by");
    }
    getCorsOptions() {
        var _a;
        /**
         * CORS strategy:
         * - If you use cookies/sessions: you MUST NOT use origin="*"
         * - Use allowlist (comma-separated)
         *
         * Example:
         *   CORS_ORIGINS=http://localhost:3000,https://yourdomain.com
         *   CORS_CREDENTIALS=true
         */
        const rawOrigins = (process.env.CORS_ORIGINS || "").trim();
        const allowlist = rawOrigins
            ? rawOrigins.split(",").map((o) => o.trim()).filter(Boolean)
            : [];
        const credentials = ((_a = process.env.CORS_CREDENTIALS) !== null && _a !== void 0 ? _a : "true").toLowerCase() === "true";
        // If no allowlist provided:
        // - In dev: allow all (without credentials if needed)
        // - In prod: block by default (safe)
        if (allowlist.length === 0) {
            if (this.env !== "production") {
                return {
                    origin: true, // reflect request origin
                    credentials,
                };
            }
            return {
                origin: false,
                credentials,
            };
        }
        return {
            origin: (origin, cb) => {
                // Allow same-origin / server-to-server / tools without Origin header
                if (!origin)
                    return cb(null, true);
                if (allowlist.includes(origin))
                    return cb(null, true);
                return cb(new Error("CORS: Origin not allowed"), false);
            },
            credentials,
        };
    }
    // ----------------------------
    // Static serving (optional)
    // ----------------------------
    initializeStaticServing() {
        var _a, _b;
        /**
         * If you still want local uploads:
         * - Prefer env-driven absolute path
         * - In production, consider S3 instead of local disk
         */
        const uploadsDir = ((_a = process.env.UPLOADS_DIR) === null || _a === void 0 ? void 0 : _a.trim()) ||
            path_1.default.resolve(process.cwd(), "uploads");
        // Only enable if explicitly allowed (safer default)
        const serveUploads = ((_b = process.env.SERVE_UPLOADS) !== null && _b !== void 0 ? _b : "true").toLowerCase() === "true";
        if (serveUploads) {
            this.app.use("/uploads", express_1.default.static(uploadsDir));
            logger_1.logger.info(`📦 Serving uploads from: ${uploadsDir}`);
        }
    }
    // ----------------------------
    // Health routes
    // ----------------------------
    initializeHealthRoutes() {
        this.app.get("/health", (req, res) => {
            res.status(200).json({
                ok: true,
                env: this.env,
                uptime: process.uptime(),
                timestamp: new Date().toISOString(),
            });
        });
        // Optional: lightweight root for load balancers
        this.app.get("/", (req, res) => {
            res.status(200).json({
                name: process.env.APP_NAME || "api",
                status: "running",
                version: process.env.APP_VERSION || "1.0.0",
            });
        });
    }
    // ----------------------------
    // Routes
    // ----------------------------
    initializeRoutes(routes) {
        /**
         * Future-proof route structure:
         * - Public routes should NOT be forced behind auth
         * - Protected routes should be behind auth
         *
         * Convention (recommended):
         * - Public: /api/v1/auth, /api/v1/public, /webhooks, etc.
         * - Protected: /api/v1/* (everything else)
         *
         * Since your Routes[] interface doesn't classify them yet,
         * we support a simple convention:
         *   If route.path starts with "/auth" or "/public" => public
         *   else => protected
         */
        const base = "/api/v1";
        const publicRouter = express_1.default.Router();
        const protectedRouter = express_1.default.Router();
        // Apply auth only to protected router (NOT globally)
        protectedRouter.use(auth_middleware_1.default);
        routes.forEach((route) => {
            const routePath = route.path;
            const isPublic = typeof routePath === "string" &&
                (routePath.startsWith("/auth") || routePath.startsWith("/public"));
            if (isPublic) {
                publicRouter.use(routePath, route.router);
            }
            else if (typeof routePath === "string") {
                protectedRouter.use(routePath, route.router);
            }
            else {
                // Backward-compatible: if no route.path exists, default to protected
                protectedRouter.use(route.router);
            }
        });
        this.app.use(base, publicRouter);
        this.app.use(base, protectedRouter);
    }
    // ----------------------------
    // Swagger (optional / stub)
    // ----------------------------
    initializeSwagger() {
        var _a;
        /**
         * Keep docs optional and behind a flag so it’s production-safe.
         * Implement later when you add swaggerJSDoc + swagger-ui-express.
         */
        const enableSwagger = ((_a = process.env.ENABLE_SWAGGER) !== null && _a !== void 0 ? _a : "false").toLowerCase() === "true";
        if (!enableSwagger)
            return;
        // Example placeholder response (until you wire swagger)
        this.app.get("/api-docs", (req, res) => {
            res.status(200).json({
                ok: true,
                message: "Swagger is enabled, but swagger UI is not wired yet. Add swaggerJSDoc + swagger-ui-express.",
            });
        });
    }
    // ----------------------------
    // Error handling
    // ----------------------------
    initializeErrorHandling() {
        this.app.use(error_middleware_1.default);
    }
}
exports.default = App;
//# sourceMappingURL=app.js.map