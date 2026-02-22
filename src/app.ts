import express from "express";
import cookieParser from "cookie-parser";
import cors, { CorsOptions } from "cors";
import helmet from "helmet";
import hpp from "hpp";
import morgan from "morgan";
import compression from "compression";
import path from "path";
import crypto from "crypto";

import Routes from "./interfaces/route.interface";
import errorMiddleware from "./middlewares/error.middleware";
import { logger, stream } from "./utils/logger";
import authMiddleware from "./middlewares/auth.middleware";

class App {
  public app: express.Application;
  public port: number;
  public env: string;

  constructor(routes: Routes[]) {
    this.app = express();

    this.port = Number(process.env.PORT ?? 8000);
    this.env = process.env.NODE_ENV ?? "development";

    this.initializeCoreMiddlewares();
    this.initializeStaticServing();
    this.initializeHealthRoutes();
    this.initializeRoutes(routes);
    this.initializeSwagger();
    this.initializeErrorHandling();
  }

  public listen() {
    const server = this.app.listen(this.port, () => {
      logger.info(
        `🚀 App listening on port ${this.port}. Environment: ${this.env}.`
      );
    });

    // Future-proof: graceful shutdown hooks (doesn't break if unused)
    const shutdown = (signal: string) => {
      logger.info(`🛑 Received ${signal}. Shutting down...`);
      server.close((err) => {
        if (err) {
          logger.error("Error while closing server", err);
          process.exit(1);
        }
        process.exit(0);
      });
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  }

  public getServer() {
    return this.app;
  }

  // ----------------------------
  // Core middleware
  // ----------------------------
  private initializeCoreMiddlewares() {
    // 1) Request ID for tracing/log correlation
    this.app.use((req, res, next) => {
      const incoming =
        (req.headers["x-request-id"] as string | undefined) || "";
      const requestId = incoming.trim() || crypto.randomUUID();
      (req as any).requestId = requestId;
      res.setHeader("x-request-id", requestId);
      next();
    });

    // 2) Logging
    if (this.env === "production") {
      this.app.use(morgan("combined", { stream }));
    } else {
      this.app.use(morgan("dev", { stream }));
    }

    // 3) Security
    this.app.use(helmet());
    this.app.use(hpp());

    // 4) Compression
    this.app.use(compression());

    // 5) Cookies (once, in one place)
    this.app.use(cookieParser());

    // 6) CORS (future-proof + correct with credentials)
    this.app.use(cors(this.getCorsOptions()));

    // 7) Body parsing (safe defaults)
    // NOTE: 2gb is unsafe for public APIs. Increase per-route only if needed.
    const jsonLimit = process.env.JSON_BODY_LIMIT || "5mb";
    const urlEncodedLimit = process.env.URLENCODED_BODY_LIMIT || "5mb";

    this.app.use(express.json({ limit: jsonLimit }));
    this.app.use(express.urlencoded({ limit: urlEncodedLimit, extended: true }));

    // 8) Basic hardening headers (optional)
    this.app.disable("x-powered-by");
  }

  private getCorsOptions(): CorsOptions {
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

    const credentials =
      (process.env.CORS_CREDENTIALS ?? "true").toLowerCase() === "true";

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
        if (!origin) return cb(null, true);
        if (allowlist.includes(origin)) return cb(null, true);
        return cb(new Error("CORS: Origin not allowed"), false);
      },
      credentials,
    };
  }

  // ----------------------------
  // Static serving (optional)
  // ----------------------------
  private initializeStaticServing() {
    /**
     * If you still want local uploads:
     * - Prefer env-driven absolute path
     * - In production, consider S3 instead of local disk
     */
    const uploadsDir =
      process.env.UPLOADS_DIR?.trim() ||
      path.resolve(process.cwd(), "uploads");

    // Only enable if explicitly allowed (safer default)
    const serveUploads =
      (process.env.SERVE_UPLOADS ?? "true").toLowerCase() === "true";

    if (serveUploads) {
      this.app.use("/uploads", express.static(uploadsDir));
      logger.info(`📦 Serving uploads from: ${uploadsDir}`);
    }
  }

  // ----------------------------
  // Health routes
  // ----------------------------
  private initializeHealthRoutes() {
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
  private initializeRoutes(routes: Routes[]) {
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

    const publicRouter = express.Router();
    const protectedRouter = express.Router();

    // Apply auth only to protected router (NOT globally)
    protectedRouter.use(authMiddleware);

    routes.forEach((route) => {
      const routePath = (route as any).path as string | undefined;

      const isPublic =
        typeof routePath === "string" &&
        (routePath.startsWith("/auth") || routePath.startsWith("/public"));

      if (isPublic) {
        publicRouter.use(routePath, route.router);
      } else if (typeof routePath === "string") {
        protectedRouter.use(routePath, route.router);
      } else {
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
  private initializeSwagger() {
    /**
     * Keep docs optional and behind a flag so it’s production-safe.
     * Implement later when you add swaggerJSDoc + swagger-ui-express.
     */
    const enableSwagger =
      (process.env.ENABLE_SWAGGER ?? "false").toLowerCase() === "true";

    if (!enableSwagger) return;

    // Example placeholder response (until you wire swagger)
    this.app.get("/api-docs", (req, res) => {
      res.status(200).json({
        ok: true,
        message:
          "Swagger is enabled, but swagger UI is not wired yet. Add swaggerJSDoc + swagger-ui-express.",
      });
    });
  }

  // ----------------------------
  // Error handling
  // ----------------------------
  private initializeErrorHandling() {
    this.app.use(errorMiddleware);
  }
}

export default App;
