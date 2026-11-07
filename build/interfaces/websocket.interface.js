"use strict";
/**
 * WebSocket Interface & Types Definition
 * Future-proof contract for real-time events, rooms, and socket payloads.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketRooms = exports.WebSocketEvents = void 0;
var WebSocketEvents;
(function (WebSocketEvents) {
    // System & Connection
    WebSocketEvents["CONNECT"] = "connect";
    WebSocketEvents["DISCONNECT"] = "disconnect";
    WebSocketEvents["ERROR"] = "error";
    WebSocketEvents["SYSTEM_ALERT"] = "system:alert";
    WebSocketEvents["SYSTEM_METRICS"] = "system:metrics";
    // Notifications
    WebSocketEvents["NOTIFICATION_NEW"] = "notification:new";
    WebSocketEvents["NOTIFICATION_READ"] = "notification:read";
    // Tool Events
    WebSocketEvents["TOOL_FEEDBACK_CREATED"] = "tool:feedback_created";
    WebSocketEvents["TOOL_CREATED"] = "tool:created";
    WebSocketEvents["TOOL_UPDATED"] = "tool:updated";
    WebSocketEvents["TOOL_DELETED"] = "tool:deleted";
    WebSocketEvents["TOOL_STATUS_CHANGED"] = "tool:status_changed";
    // Contact & Messages
    WebSocketEvents["CONTACT_MESSAGE_RECEIVED"] = "contact:message_received";
    WebSocketEvents["CONTACT_MESSAGE_UPDATED"] = "contact:message_updated";
    // Asynchronous Background Tasks / Jobs (e.g. SEO crawls, PDF conversions, imports)
    WebSocketEvents["JOB_STARTED"] = "job:started";
    WebSocketEvents["JOB_PROGRESS"] = "job:progress";
    WebSocketEvents["JOB_COMPLETED"] = "job:completed";
    WebSocketEvents["JOB_FAILED"] = "job:failed";
})(WebSocketEvents || (exports.WebSocketEvents = WebSocketEvents = {}));
exports.WebSocketRooms = {
    ADMINS: "admins",
    PUBLIC: "public",
    user: (userId) => `user:${userId}`,
    tool: (toolSlug) => `tool:${toolSlug}`,
    job: (jobId) => `job:${jobId}`,
};
//# sourceMappingURL=websocket.interface.js.map