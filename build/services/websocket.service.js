"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketService = void 0;
const socket_io_1 = require("socket.io");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const logger_1 = require("../utils/logger");
const websocket_interface_1 = require("../interfaces/websocket.interface");
/**
 * WebSocketService
 * High-performance, scalable, singleton WebSocket gateway for the entire application.
 * Manages Socket.IO instance, rooms, authentication, and decoupled event dispatch.
 */
class WebSocketService {
    constructor() {
        this.io = null;
        this.initialized = false;
    }
    /**
     * Access singleton instance
     */
    static getInstance() {
        if (!WebSocketService.instance) {
            WebSocketService.instance = new WebSocketService();
        }
        return WebSocketService.instance;
    }
    /**
     * Initialize Socket.IO with HTTP Server instance
     */
    init(httpServer) {
        var _a;
        if (this.initialized) {
            logger_1.logger.warn("⚠️ WebSocketService is already initialized.");
            return;
        }
        const corsOrigins = this.resolveCorsOrigins();
        const corsCredentials = ((_a = process.env.CORS_CREDENTIALS) !== null && _a !== void 0 ? _a : "true").toLowerCase() === "true";
        this.io = new socket_io_1.Server(httpServer, {
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
        logger_1.logger.info("🔌 WebSocket Server initialized successfully.");
    }
    /**
     * Determine allowed CORS origins matching app.ts configuration
     */
    resolveCorsOrigins() {
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
            return (requestOrigin, callback) => {
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
    setupAuthMiddleware() {
        if (!this.io)
            return;
        this.io.use((socket, next) => {
            socket.data.connectedAt = new Date();
            try {
                let token;
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
                        .reduce((acc, str) => {
                        const [k, v] = str.trim().split("=");
                        if (k && v)
                            acc[k] = decodeURIComponent(v);
                        return acc;
                    }, {});
                    token = cookies.admin_token;
                }
                if (token) {
                    const secret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;
                    if (secret) {
                        const payload = jsonwebtoken_1.default.verify(token, secret);
                        if (payload && payload.sub) {
                            const user = {
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
            }
            catch (err) {
                // Log authentication error but do not kill public socket unless strict
                logger_1.logger.debug(`Socket handshake token invalid for socket ID ${socket.id}: ${err.message}`);
            }
            next();
        });
    }
    /**
     * Setup Connection, Room Joining, and Disconnect Handlers
     */
    setupConnectionHandlers() {
        if (!this.io)
            return;
        this.io.on("connection", (socket) => {
            const user = socket.data.user;
            // Always join public room
            socket.join(websocket_interface_1.WebSocketRooms.PUBLIC);
            if (user) {
                // Automatically join user-specific room
                const userRoom = websocket_interface_1.WebSocketRooms.user(user.id);
                socket.join(userRoom);
                // If admin, automatically join admins room
                if (user.role === "admin" || user.member_role === "admin") {
                    socket.join(websocket_interface_1.WebSocketRooms.ADMINS);
                    logger_1.logger.info(`👤 [WS] Admin authenticated (${user.email}) connected: ${socket.id}`);
                }
                else {
                    logger_1.logger.info(`👤 [WS] User authenticated (${user.email}) connected: ${socket.id}`);
                }
            }
            else {
                logger_1.logger.debug(`🌐 [WS] Anonymous client connected: ${socket.id}`);
            }
            // Handle client ping
            socket.on("ping", (ack) => {
                if (typeof ack === "function") {
                    ack("pong");
                }
            });
            // Handle custom room joining with access control
            socket.on("room:join", (room, ack) => {
                var _a, _b, _c;
                if (typeof room !== "string" || !room) {
                    if (ack)
                        ack({ success: false, message: "Invalid room name" });
                    return;
                }
                // Room security checks
                if (room === websocket_interface_1.WebSocketRooms.ADMINS) {
                    const role = (_a = socket.data.user) === null || _a === void 0 ? void 0 : _a.role;
                    const memberRole = (_b = socket.data.user) === null || _b === void 0 ? void 0 : _b.member_role;
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
                    if (String((_c = socket.data.user) === null || _c === void 0 ? void 0 : _c.id) !== targetUserId) {
                        if (ack)
                            ack({
                                success: false,
                                message: "Unauthorized to join private user room",
                            });
                        return;
                    }
                }
                socket.join(room);
                if (ack)
                    ack({ success: true, message: `Joined room: ${room}` });
            });
            // Handle room leaving
            socket.on("room:leave", (room, ack) => {
                if (typeof room === "string" && room) {
                    socket.leave(room);
                    if (ack)
                        ack({ success: true });
                }
            });
            // Handle disconnection
            socket.on("disconnect", (reason) => {
                logger_1.logger.debug(`🔌 [WS] Client disconnected (${socket.id}): ${reason}`);
            });
        });
    }
    // =========================================================================
    // Public Emitter API (Usable across Services, Controllers, and Background Jobs)
    // =========================================================================
    /**
     * Broadcast an event to all connected clients
     */
    broadcast(event, payload) {
        if (!this.io) {
            logger_1.logger.warn(`[WS] Cannot emit '${event}': WebSocket server not initialized.`);
            return false;
        }
        this.io.emit(event, payload);
        return true;
    }
    /**
     * Emit an event to all connected administrators in the 'admins' room
     */
    emitToAdmins(event, payload) {
        if (!this.io) {
            logger_1.logger.warn(`[WS] Cannot emit '${event}' to admins: WebSocket server not initialized.`);
            return false;
        }
        this.io.to(websocket_interface_1.WebSocketRooms.ADMINS).emit(event, payload);
        return true;
    }
    /**
     * Emit an event to a specific user across all their connected devices/tabs
     */
    emitToUser(userId, event, payload) {
        if (!this.io) {
            logger_1.logger.warn(`[WS] Cannot emit '${event}' to user ${userId}: WebSocket server not initialized.`);
            return false;
        }
        const room = websocket_interface_1.WebSocketRooms.user(userId);
        this.io.to(room).emit(event, payload);
        return true;
    }
    /**
     * Emit an event to a list of users
     */
    emitToUsers(userIds, event, payload) {
        if (!this.io)
            return false;
        userIds.forEach((id) => this.emitToUser(id, event, payload));
        return true;
    }
    /**
     * Emit an event to any designated room (e.g. tool channel, job channel)
     */
    emitToRoom(room, event, payload) {
        if (!this.io) {
            logger_1.logger.warn(`[WS] Cannot emit '${event}' to room ${room}: WebSocket server not initialized.`);
            return false;
        }
        this.io.to(room).emit(event, payload);
        return true;
    }
    // =========================================================================
    // Status & Introspection Utilities
    // =========================================================================
    /**
     * Get total number of active socket connections
     */
    getConnectedSocketsCount() {
        var _a, _b, _c;
        return (_c = (_b = (_a = this.io) === null || _a === void 0 ? void 0 : _a.engine) === null || _b === void 0 ? void 0 : _b.clientsCount) !== null && _c !== void 0 ? _c : 0;
    }
    /**
     * Get count of sockets currently joined in a specific room
     */
    async getRoomMembersCount(room) {
        if (!this.io)
            return 0;
        const sockets = await this.io.in(room).fetchSockets();
        return sockets.length;
    }
    /**
     * Returns true if WebSocket server has been initialized
     */
    isReady() {
        return this.initialized && this.io !== null;
    }
    /**
     * Retrieve raw Socket.IO Server instance if low-level operations are needed
     */
    getIO() {
        return this.io;
    }
}
exports.WebSocketService = WebSocketService;
WebSocketService.instance = null;
exports.default = WebSocketService;
//# sourceMappingURL=websocket.service.js.map