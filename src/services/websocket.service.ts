import http from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { logger } from "../utils/logger";
import {
  WebSocketEvents,
  WebSocketRooms,
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData,
  SocketUser,
} from "../interfaces/websocket.interface";

export type CustomSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

/**
 * WebSocketService
 * High-performance, scalable, singleton WebSocket gateway for the entire application.
 * Manages Socket.IO instance, rooms, authentication, and decoupled event dispatch.
 */
export class WebSocketService {
  private static instance: WebSocketService | null = null;
  private io: SocketIOServer<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  > | null = null;
  private initialized: boolean = false;

  private constructor() {}

  /**
   * Access singleton instance
   */
  public static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  /**
   * Initialize Socket.IO with HTTP Server instance
   */
  public init(httpServer: http.Server): void {
    if (this.initialized) {
      logger.warn("⚠️ WebSocketService is already initialized.");
      return;
    }

    const corsOrigins = this.resolveCorsOrigins();
    const corsCredentials =
      (process.env.CORS_CREDENTIALS ?? "true").toLowerCase() === "true";

    this.io = new SocketIOServer<
      ClientToServerEvents,
      ServerToClientEvents,
      InterServerEvents,
      SocketData
    >(httpServer, {
      path: "/socket.io",
      cors: {
        origin: corsOrigins,
        credentials: corsCredentials,
        methods: ["GET", "POST"],
      },
      transports: ["websocket", "polling"],
      pingTimeout: 30000,
      pingInterval: 25000,
      maxHttpBufferSize: 1e6, // 1MB buffer limit
    });

    this.setupAuthMiddleware();
    this.setupConnectionHandlers();

    this.initialized = true;
    logger.info("🔌 WebSocket Server initialized successfully.");
  }

  /**
   * Determine allowed CORS origins matching app.ts configuration
   */
  private resolveCorsOrigins(): any {
    const rawOrigins = (process.env.CORS_ORIGINS || "").trim();
    if (rawOrigins) {
      const origins = rawOrigins
        .split(",")
        .map((o) => o.trim())
        .filter(Boolean);
      return origins.length > 0 ? origins : "*";
    }

    // In non-production default to reflect origin (all allowed)
    if (process.env.NODE_ENV !== "production") {
      return (
        requestOrigin: string | undefined,
        callback: (err: Error | null, origin?: any) => void
      ) => {
        callback(null, true);
      };
    }

    return false;
  }

  /**
   * Socket Authentication Middleware
   * Validates JWT token from auth handshake, Authorization header, or cookie.
   * Authenticated sockets automatically join their user room and admin room (if admin).
   * Unauthenticated connections remain connected as public/guest sockets.
   */
  private setupAuthMiddleware(): void {
    if (!this.io) return;

    this.io.use((socket: CustomSocket, next) => {
      socket.data.connectedAt = new Date();

      try {
        let token: string | undefined;

        // 1. From handshake auth object (e.g. io({ auth: { token: '...' } }))
        if (socket.handshake.auth && socket.handshake.auth.token) {
          token = socket.handshake.auth.token;
        }

        // 2. From handshake Authorization header (Bearer ...)
        if (!token && socket.handshake.headers.authorization) {
          const parts = socket.handshake.headers.authorization.split(" ");
          if (parts.length === 2 && parts[0] === "Bearer") {
            token = parts[1];
          }
        }

        // 3. Fallback to admin_token cookie
        if (!token && socket.handshake.headers.cookie) {
          const cookies = socket.handshake.headers.cookie
            .split(";")
            .reduce((acc: Record<string, string>, str) => {
              const [k, v] = str.trim().split("=");
              if (k && v) acc[k] = decodeURIComponent(v);
              return acc;
            }, {});
          token = cookies.admin_token;
        }

        if (token) {
          const secret =
            process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;
          if (secret) {
            const payload = jwt.verify(token, secret) as any;
            if (payload && payload.sub) {
              const user: SocketUser = {
                id: payload.sub,
                email: payload.email,
                role: payload.role,
                workspace_id: payload.workspace_id,
                member_role: payload.member_role,
                client: payload.client,
              };
              socket.data.user = user;
            }
          }
        }
      } catch (err: any) {
        // Log authentication error but do not kill public socket unless strict
        logger.debug(
          `Socket handshake token invalid for socket ID ${socket.id}: ${err.message}`
        );
      }

      next();
    });
  }

  /**
   * Setup Connection, Room Joining, and Disconnect Handlers
   */
  private setupConnectionHandlers(): void {
    if (!this.io) return;

    this.io.on("connection", (socket: CustomSocket) => {
      const user = socket.data.user;

      // Always join public room
      socket.join(WebSocketRooms.PUBLIC);

      if (user) {
        // Automatically join user-specific room
        const userRoom = WebSocketRooms.user(user.id);
        socket.join(userRoom);

        // If admin, automatically join admins room
        if (user.role === "admin" || user.member_role === "admin") {
          socket.join(WebSocketRooms.ADMINS);
          logger.info(
            `👤 [WS] Admin authenticated (${user.email}) connected: ${socket.id}`
          );
        } else {
          logger.info(
            `👤 [WS] User authenticated (${user.email}) connected: ${socket.id}`
          );
        }
      } else {
        logger.debug(`🌐 [WS] Anonymous client connected: ${socket.id}`);
      }

      // Handle client ping
      socket.on("ping", (ack) => {
        if (typeof ack === "function") {
          ack("pong");
        }
      });

      // Handle custom room joining with access control
      socket.on("room:join", (room: string, ack) => {
        if (typeof room !== "string" || !room) {
          if (ack) ack({ success: false, message: "Invalid room name" });
          return;
        }

        // Room security checks
        if (room === WebSocketRooms.ADMINS) {
          const role = socket.data.user?.role;
          const memberRole = socket.data.user?.member_role;
          if (role !== "admin" && memberRole !== "admin") {
            if (ack)
              ack({
                success: false,
                message: "Unauthorized to join admin room",
              });
            return;
          }
        }

        if (room.startsWith("user:")) {
          const targetUserId = room.replace("user:", "");
          if (String(socket.data.user?.id) !== targetUserId) {
            if (ack)
              ack({
                success: false,
                message: "Unauthorized to join private user room",
              });
            return;
          }
        }

        socket.join(room);
        if (ack) ack({ success: true, message: `Joined room: ${room}` });
      });

      // Handle room leaving
      socket.on("room:leave", (room: string, ack) => {
        if (typeof room === "string" && room) {
          socket.leave(room);
          if (ack) ack({ success: true });
        }
      });

      // Handle disconnection
      socket.on("disconnect", (reason) => {
        logger.debug(`🔌 [WS] Client disconnected (${socket.id}): ${reason}`);
      });
    });
  }

  // =========================================================================
  // Public Emitter API (Usable across Services, Controllers, and Background Jobs)
  // =========================================================================

  /**
   * Broadcast an event to all connected clients
   */
  public broadcast<T = any>(event: WebSocketEvents | string, payload: T): boolean {
    if (!this.io) {
      logger.warn(`[WS] Cannot emit '${event}': WebSocket server not initialized.`);
      return false;
    }
    this.io.emit(event as any, payload as any);
    return true;
  }

  /**
   * Emit an event to all connected administrators in the 'admins' room
   */
  public emitToAdmins<T = any>(event: WebSocketEvents | string, payload: T): boolean {
    if (!this.io) {
      logger.warn(`[WS] Cannot emit '${event}' to admins: WebSocket server not initialized.`);
      return false;
    }
    this.io.to(WebSocketRooms.ADMINS).emit(event as any, payload as any);
    return true;
  }

  /**
   * Emit an event to a specific user across all their connected devices/tabs
   */
  public emitToUser<T = any>(
    userId: number | string,
    event: WebSocketEvents | string,
    payload: T
  ): boolean {
    if (!this.io) {
      logger.warn(`[WS] Cannot emit '${event}' to user ${userId}: WebSocket server not initialized.`);
      return false;
    }
    const room = WebSocketRooms.user(userId);
    this.io.to(room).emit(event as any, payload as any);
    return true;
  }

  /**
   * Emit an event to a list of users
   */
  public emitToUsers<T = any>(
    userIds: (number | string)[],
    event: WebSocketEvents | string,
    payload: T
  ): boolean {
    if (!this.io) return false;
    userIds.forEach((id) => this.emitToUser(id, event, payload));
    return true;
  }

  /**
   * Emit an event to any designated room (e.g. tool channel, job channel)
   */
  public emitToRoom<T = any>(
    room: string,
    event: WebSocketEvents | string,
    payload: T
  ): boolean {
    if (!this.io) {
      logger.warn(`[WS] Cannot emit '${event}' to room ${room}: WebSocket server not initialized.`);
      return false;
    }
    this.io.to(room).emit(event as any, payload as any);
    return true;
  }

  // =========================================================================
  // Status & Introspection Utilities
  // =========================================================================

  /**
   * Get total number of active socket connections
   */
  public getConnectedSocketsCount(): number {
    return this.io?.engine?.clientsCount ?? 0;
  }

  /**
   * Get count of sockets currently joined in a specific room
   */
  public async getRoomMembersCount(room: string): Promise<number> {
    if (!this.io) return 0;
    const sockets = await this.io.in(room).fetchSockets();
    return sockets.length;
  }

  /**
   * Returns true if WebSocket server has been initialized
   */
  public isReady(): boolean {
    return this.initialized && this.io !== null;
  }

  /**
   * Retrieve raw Socket.IO Server instance if low-level operations are needed
   */
  public getIO(): SocketIOServer<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  > | null {
    return this.io;
  }
}

export default WebSocketService;

