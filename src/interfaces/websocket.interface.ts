/**
 * WebSocket Interface & Types Definition
 * Future-proof contract for real-time events, rooms, and socket payloads.
 */

export enum WebSocketEvents {
  // System & Connection
  CONNECT = "connect",
  DISCONNECT = "disconnect",
  ERROR = "error",
  SYSTEM_ALERT = "system:alert",
  SYSTEM_METRICS = "system:metrics",

  // Notifications
  NOTIFICATION_NEW = "notification:new",
  NOTIFICATION_READ = "notification:read",

  // Tool Events
  TOOL_FEEDBACK_CREATED = "tool:feedback_created",
  TOOL_CREATED = "tool:created",
  TOOL_UPDATED = "tool:updated",
  TOOL_DELETED = "tool:deleted",
  TOOL_STATUS_CHANGED = "tool:status_changed",

  // Contact & Messages
  CONTACT_MESSAGE_RECEIVED = "contact:message_received",
  CONTACT_MESSAGE_UPDATED = "contact:message_updated",

  // Asynchronous Background Tasks / Jobs (e.g. SEO crawls, PDF conversions, imports)
  JOB_STARTED = "job:started",
  JOB_PROGRESS = "job:progress",
  JOB_COMPLETED = "job:completed",
  JOB_FAILED = "job:failed",
}

export const WebSocketRooms = {
  ADMINS: "admins",
  PUBLIC: "public",
  user: (userId: number | string) => `user:${userId}`,
  tool: (toolSlug: string) => `tool:${toolSlug}`,
  job: (jobId: string) => `job:${jobId}`,
};

export interface SocketUser {
  id: number;
  email: string;
  role: string;
  workspace_id?: number;
  member_role?: string;
  client?: string;
}

export interface SocketData {
  user?: SocketUser;
  sessionId?: string;
  connectedAt: Date;
}

export interface NotificationPayload {
  id?: string | number;
  title: string;
  message: string;
  type?: "info" | "success" | "warning" | "error";
  link?: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface ToolFeedbackPayload {
  id: number | string;
  tool_slug: string;
  tool_id?: number | null;
  rating: string;
  reason?: string | null;
  session_id?: string | null;
  user_agent?: string | null;
  ip_address?: string | null;
  created_at?: string;
}

export interface ContactMessagePayload {
  id: number | string;
  first_name: string;
  last_name?: string;
  email: string;
  topic?: string;
  subject?: string;
  message: string;
  created_at?: string;
}

export interface JobProgressPayload {
  jobId: string;
  jobType: string;
  progress: number; // 0 - 100
  status: "queued" | "running" | "completed" | "failed";
  message?: string;
  result?: any;
  error?: string;
}

export interface SystemAlertPayload {
  level: "info" | "warning" | "error" | "critical";
  title: string;
  message: string;
  timestamp: string;
}

/**
 * Type map for Events emitted from Server to Client
 */
export interface ServerToClientEvents {
  [WebSocketEvents.SYSTEM_ALERT]: (payload: SystemAlertPayload) => void;
  [WebSocketEvents.SYSTEM_METRICS]: (payload: Record<string, any>) => void;
  [WebSocketEvents.NOTIFICATION_NEW]: (payload: NotificationPayload) => void;
  [WebSocketEvents.NOTIFICATION_READ]: (payload: { id: string | number }) => void;
  [WebSocketEvents.TOOL_FEEDBACK_CREATED]: (payload: ToolFeedbackPayload) => void;
  [WebSocketEvents.TOOL_CREATED]: (payload: any) => void;
  [WebSocketEvents.TOOL_UPDATED]: (payload: any) => void;
  [WebSocketEvents.TOOL_DELETED]: (payload: { id: number | string; slug?: string }) => void;
  [WebSocketEvents.TOOL_STATUS_CHANGED]: (payload: { slug: string; status: string }) => void;
  [WebSocketEvents.CONTACT_MESSAGE_RECEIVED]: (payload: ContactMessagePayload) => void;
  [WebSocketEvents.CONTACT_MESSAGE_UPDATED]: (payload: any) => void;
  [WebSocketEvents.JOB_STARTED]: (payload: { jobId: string; jobType: string }) => void;
  [WebSocketEvents.JOB_PROGRESS]: (payload: JobProgressPayload) => void;
  [WebSocketEvents.JOB_COMPLETED]: (payload: JobProgressPayload) => void;
  [WebSocketEvents.JOB_FAILED]: (payload: JobProgressPayload) => void;
  // Dynamic fallback for custom events
  [event: string]: (payload: any) => void;
}

/**
 * Type map for Events sent from Client to Server
 */
export interface ClientToServerEvents {
  "room:join": (room: string, ack?: (response: { success: boolean; message?: string }) => void) => void;
  "room:leave": (room: string, ack?: (response: { success: boolean }) => void) => void;
  "ping": (ack?: (pong: string) => void) => void;
  // Dynamic fallback for custom events
  [event: string]: (payload: any, ack?: any) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

