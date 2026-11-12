"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_schema_1 = __importStar(require("../database/index.schema"));
const HttpException_1 = __importDefault(require("../exceptions/HttpException"));
const websocket_service_1 = __importDefault(require("./websocket.service"));
const websocket_interface_1 = require("../interfaces/websocket.interface");
class AdminAnalyticsService {
    /**
     * Resolve start and end Date objects based on filter range
     */
    resolveDateRange(range, start_date, end_date) {
        const now = new Date();
        // Default to "all" (from 2020-01-01) so all platform history is immediately visible
        let currentStart = new Date("2020-01-01");
        let currentEnd = now;
        const r = (range || "all").toLowerCase();
        if (r === "today" || r === "24h") {
            currentStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
            currentEnd = now;
        }
        else if (r === "yesterday") {
            currentStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0);
            currentEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59, 999);
        }
        else if (r === "7d" || r === "last_7_days") {
            currentStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            currentEnd = now;
        }
        else if (r === "30d" || r === "last_30_days") {
            currentStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            currentEnd = now;
        }
        else if (r === "month" || r === "this_month") {
            currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
            currentEnd = now;
        }
        else if (r === "last_month") {
            currentStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            currentEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        }
        else if (r === "quarter" || r === "this_quarter") {
            const q = Math.floor(now.getMonth() / 3);
            currentStart = new Date(now.getFullYear(), q * 3, 1);
            currentEnd = now;
        }
        else if (r === "ytd" || r === "year_to_date") {
            currentStart = new Date(now.getFullYear(), 0, 1);
            currentEnd = now;
        }
        else if (r === "all" || r === "all_time") {
            currentStart = new Date("2020-01-01");
            currentEnd = now;
        }
        else if (r === "custom" || start_date) {
            if (start_date) {
                currentStart = new Date(start_date);
                if (end_date) {
                    const e = new Date(end_date);
                    if (end_date.length <= 10)
                        e.setHours(23, 59, 59, 999);
                    currentEnd = e;
                }
            }
        }
        const duration = currentEnd.getTime() - currentStart.getTime();
        const prevStart = new Date(currentStart.getTime() - duration);
        const prevEnd = new Date(currentStart.getTime());
        return { currentStart, currentEnd, prevStart, prevEnd };
    }
    /**
     * 1. Overview Analytics Dashboard (KPIs, Trends, Top Tools, Category Breakdown)
     */
    async getOverviewAnalytics(filters) {
        const { currentStart, currentEnd, prevStart, prevEnd } = this.resolveDateRange(filters.range, filters.start_date, filters.end_date);
        // Current period metrics query
        let currentEventsQuery = (0, index_schema_1.default)(index_schema_1.T.TOOL_EVENTS)
            .whereBetween("created_at", [currentStart, currentEnd]);
        if (filters.category) {
            currentEventsQuery = currentEventsQuery.whereIn("tool_id", (0, index_schema_1.default)(index_schema_1.T.TOOLS).select("id").where({ category_slug: filters.category }));
        }
        const [currentStats] = await currentEventsQuery.select([
            index_schema_1.default.raw("COUNT(*)::int as total_events"),
            index_schema_1.default.raw("COUNT(CASE WHEN event_type = 'PAGE_VIEW' THEN 1 END)::int as total_views"),
            index_schema_1.default.raw("COUNT(CASE WHEN event_type = 'TOOL_RUN' THEN 1 END)::int as total_runs"),
            index_schema_1.default.raw("COUNT(CASE WHEN event_type = 'RECOMMENDATION_CLICK' THEN 1 END)::int as total_recommendation_clicks"),
            index_schema_1.default.raw("COUNT(DISTINCT session_id)::int as unique_sessions"),
        ]);
        // Previous period metrics query (for trend % comparisons)
        let prevEventsQuery = (0, index_schema_1.default)(index_schema_1.T.TOOL_EVENTS)
            .whereBetween("created_at", [prevStart, prevEnd]);
        if (filters.category) {
            prevEventsQuery = prevEventsQuery.whereIn("tool_id", (0, index_schema_1.default)(index_schema_1.T.TOOLS).select("id").where({ category_slug: filters.category }));
        }
        const [prevStats] = await prevEventsQuery.select([
            index_schema_1.default.raw("COUNT(CASE WHEN event_type = 'PAGE_VIEW' THEN 1 END)::int as prev_views"),
            index_schema_1.default.raw("COUNT(CASE WHEN event_type = 'TOOL_RUN' THEN 1 END)::int as prev_runs"),
            index_schema_1.default.raw("COUNT(DISTINCT session_id)::int as prev_sessions"),
        ]);
        const totalViews = (currentStats === null || currentStats === void 0 ? void 0 : currentStats.total_views) || 0;
        const totalRuns = (currentStats === null || currentStats === void 0 ? void 0 : currentStats.total_runs) || 0;
        const uniqueSessions = (currentStats === null || currentStats === void 0 ? void 0 : currentStats.unique_sessions) || 0;
        const recommendationClicks = (currentStats === null || currentStats === void 0 ? void 0 : currentStats.total_recommendation_clicks) || 0;
        const prevViews = (prevStats === null || prevStats === void 0 ? void 0 : prevStats.prev_views) || 0;
        const prevRuns = (prevStats === null || prevStats === void 0 ? void 0 : prevStats.prev_runs) || 0;
        const prevSessions = (prevStats === null || prevStats === void 0 ? void 0 : prevStats.prev_sessions) || 0;
        const conversionRate = totalViews > 0 ? Number(((totalRuns / totalViews) * 100).toFixed(1)) : 0;
        const prevConversionRate = prevViews > 0 ? Number(((prevRuns / prevViews) * 100).toFixed(1)) : 0;
        const computeChange = (curr, prev) => {
            if (prev === 0)
                return curr > 0 ? 100 : 0;
            return Number((((curr - prev) / prev) * 100).toFixed(1));
        };
        // Feedback summary
        const [feedbackStats] = await (0, index_schema_1.default)(index_schema_1.T.TOOL_FEEDBACK)
            .whereBetween("created_at", [currentStart, currentEnd])
            .select([
            index_schema_1.default.raw("COUNT(*)::int as total_feedback"),
            index_schema_1.default.raw("COUNT(CASE WHEN rating = 'like' THEN 1 END)::int as likes"),
            index_schema_1.default.raw("COUNT(CASE WHEN rating = 'dislike' THEN 1 END)::int as dislikes"),
        ]);
        const likes = (feedbackStats === null || feedbackStats === void 0 ? void 0 : feedbackStats.likes) || 0;
        const totalFeedback = (feedbackStats === null || feedbackStats === void 0 ? void 0 : feedbackStats.total_feedback) || 0;
        const satisfactionRate = totalFeedback > 0 ? Number(((likes / totalFeedback) * 100).toFixed(1)) : 100;
        // Time-series trend chart data
        const truncUnit = filters.range === "today" || filters.range === "24h" ? "hour" : "day";
        const trendRows = await (0, index_schema_1.default)(index_schema_1.T.TOOL_EVENTS)
            .whereBetween("created_at", [currentStart, currentEnd])
            .select([
            index_schema_1.default.raw(`DATE_TRUNC('${truncUnit}', created_at) as timestamp`),
            index_schema_1.default.raw("COUNT(CASE WHEN event_type = 'PAGE_VIEW' THEN 1 END)::int as views"),
            index_schema_1.default.raw("COUNT(CASE WHEN event_type = 'TOOL_RUN' THEN 1 END)::int as runs"),
            index_schema_1.default.raw("COUNT(CASE WHEN event_type = 'RECOMMENDATION_CLICK' THEN 1 END)::int as rec_clicks"),
        ])
            .groupBy("timestamp")
            .orderBy("timestamp", "asc");
        const timeSeries = trendRows.map((r) => ({
            timestamp: r.timestamp,
            views: Number(r.views || 0),
            runs: Number(r.runs || 0),
            rec_clicks: Number(r.rec_clicks || 0),
            conversion_rate: r.views > 0 ? Number(((r.runs / r.views) * 100).toFixed(1)) : 0,
        }));
        // Top 5 Most Executed Tools
        const topExecuted = await (0, index_schema_1.default)(`${index_schema_1.T.TOOL_EVENTS} as e`)
            .join(`${index_schema_1.T.TOOLS} as t`, "t.id", "e.tool_id")
            .whereBetween("e.created_at", [currentStart, currentEnd])
            .select([
            "t.id",
            "t.title",
            "t.slug",
            "t.category_slug",
            "t.badge",
            index_schema_1.default.raw("COUNT(CASE WHEN e.event_type = 'TOOL_RUN' THEN 1 END)::int as runs"),
            index_schema_1.default.raw("COUNT(CASE WHEN e.event_type = 'PAGE_VIEW' THEN 1 END)::int as views"),
        ])
            .groupBy("t.id", "t.title", "t.slug", "t.category_slug", "t.badge")
            .orderBy([{ column: "runs", order: "desc" }, { column: "views", order: "desc" }])
            .limit(5);
        const topTools = topExecuted.map((t) => (Object.assign(Object.assign({}, t), { conversion_rate: t.views > 0 ? Number(((t.runs / t.views) * 100).toFixed(1)) : 0 })));
        // Top 5 High Drop-off Tools (High Views, Lowest Conversion)
        const dropoffCandidates = await (0, index_schema_1.default)(`${index_schema_1.T.TOOL_EVENTS} as e`)
            .join(`${index_schema_1.T.TOOLS} as t`, "t.id", "e.tool_id")
            .whereBetween("e.created_at", [currentStart, currentEnd])
            .select([
            "t.id",
            "t.title",
            "t.slug",
            "t.category_slug",
            index_schema_1.default.raw("COUNT(CASE WHEN e.event_type = 'TOOL_RUN' THEN 1 END)::int as runs"),
            index_schema_1.default.raw("COUNT(CASE WHEN e.event_type = 'PAGE_VIEW' THEN 1 END)::int as views"),
        ])
            .groupBy("t.id", "t.title", "t.slug", "t.category_slug")
            .having(index_schema_1.default.raw("COUNT(CASE WHEN e.event_type = 'PAGE_VIEW' THEN 1 END) >= 5"))
            .orderBy(index_schema_1.default.raw("(COUNT(CASE WHEN e.event_type = 'TOOL_RUN' THEN 1 END)::float / NULLIF(COUNT(CASE WHEN e.event_type = 'PAGE_VIEW' THEN 1 END), 0))"), "asc")
            .limit(5);
        const underperformingTools = dropoffCandidates.map((t) => (Object.assign(Object.assign({}, t), { conversion_rate: t.views > 0 ? Number(((t.runs / t.views) * 100).toFixed(1)) : 0 })));
        // Category distribution breakdown
        const categoryStats = await (0, index_schema_1.default)(`${index_schema_1.T.TOOL_EVENTS} as e`)
            .join(`${index_schema_1.T.TOOLS} as t`, "t.id", "e.tool_id")
            .whereBetween("e.created_at", [currentStart, currentEnd])
            .select([
            "t.category_slug",
            index_schema_1.default.raw("COUNT(CASE WHEN e.event_type = 'PAGE_VIEW' THEN 1 END)::int as views"),
            index_schema_1.default.raw("COUNT(CASE WHEN e.event_type = 'TOOL_RUN' THEN 1 END)::int as runs"),
        ])
            .groupBy("t.category_slug")
            .orderBy([{ column: "runs", order: "desc" }, { column: "views", order: "desc" }]);
        return {
            kpis: {
                total_views: totalViews,
                views_change: computeChange(totalViews, prevViews),
                total_runs: totalRuns,
                runs_change: computeChange(totalRuns, prevRuns),
                conversion_rate: conversionRate,
                conversion_change: Number((conversionRate - prevConversionRate).toFixed(1)),
                unique_sessions: uniqueSessions,
                sessions_change: computeChange(uniqueSessions, prevSessions),
                recommendation_clicks: recommendationClicks,
                satisfaction_rate: satisfactionRate,
                total_feedback: totalFeedback,
            },
            time_series: timeSeries,
            top_tools: topTools,
            underperforming_tools: underperformingTools,
            categories: categoryStats,
            date_range: {
                start: currentStart.toISOString(),
                end: currentEnd.toISOString(),
            },
        };
    }
    /**
     * 2. Detailed Tool Performance List (with advanced filters, health tier, sort, pagination)
     */
    async getToolsAnalytics(params) {
        const page = Math.max(1, Number(params.page || 1));
        const limit = Math.min(100, Math.max(1, Number(params.limit || 15)));
        const offset = (page - 1) * limit;
        const { currentStart, currentEnd } = this.resolveDateRange(params.range, params.start_date, params.end_date);
        // Subquery aggregating events for the date window
        const eventsSubquery = (0, index_schema_1.default)(index_schema_1.T.TOOL_EVENTS)
            .whereBetween("created_at", [currentStart, currentEnd])
            .select([
            "tool_id",
            index_schema_1.default.raw("COUNT(CASE WHEN event_type = 'PAGE_VIEW' THEN 1 END)::int as views"),
            index_schema_1.default.raw("COUNT(CASE WHEN event_type = 'TOOL_RUN' THEN 1 END)::int as runs"),
            index_schema_1.default.raw("COUNT(CASE WHEN event_type = 'RECOMMENDATION_CLICK' THEN 1 END)::int as ref_clicks"),
        ])
            .groupBy("tool_id")
            .as("ev");
        // Subquery aggregating feedback
        const feedbackSubquery = (0, index_schema_1.default)(index_schema_1.T.TOOL_FEEDBACK)
            .select([
            "tool_id",
            index_schema_1.default.raw("COUNT(CASE WHEN rating = 'like' THEN 1 END)::int as likes"),
            index_schema_1.default.raw("COUNT(CASE WHEN rating = 'dislike' THEN 1 END)::int as dislikes"),
        ])
            .groupBy("tool_id")
            .as("fb");
        let query = (0, index_schema_1.default)(`${index_schema_1.T.TOOLS} as t`)
            .leftJoin(eventsSubquery, "ev.tool_id", "t.id")
            .leftJoin(feedbackSubquery, "fb.tool_id", "t.id")
            .select([
            "t.id",
            "t.title",
            "t.slug",
            "t.category_slug",
            "t.tool_type",
            "t.badge",
            "t.is_featured",
            "t.status",
            "t.last_used_at",
            "t.created_at",
            index_schema_1.default.raw("COALESCE(ev.views, 0)::int as views"),
            index_schema_1.default.raw("COALESCE(ev.runs, 0)::int as runs"),
            index_schema_1.default.raw("COALESCE(ev.ref_clicks, 0)::int as ref_clicks"),
            index_schema_1.default.raw("COALESCE(fb.likes, 0)::int as feedback_likes"),
            index_schema_1.default.raw("COALESCE(fb.dislikes, 0)::int as feedback_dislikes"),
            index_schema_1.default.raw("CASE WHEN COALESCE(ev.views, 0) > 0 THEN ROUND((COALESCE(ev.runs, 0)::numeric / ev.views) * 100, 1) ELSE 0 END as conversion_rate"),
        ]);
        // Filter: search
        if (params.search) {
            const q = `%${params.search.toLowerCase()}%`;
            query = query.where((qb) => {
                qb.whereRaw("LOWER(t.title) LIKE ?", [q])
                    .orWhereRaw("LOWER(t.slug) LIKE ?", [q])
                    .orWhereRaw("LOWER(t.category_slug) LIKE ?", [q]);
            });
        }
        // Filter: category
        if (params.category && params.category !== "all") {
            query = query.where("t.category_slug", params.category);
        }
        // Filter: health tier
        if (params.health_tier && params.health_tier !== "all") {
            if (params.health_tier === "star") {
                query = query
                    .whereRaw("COALESCE(ev.runs, 0) >= 10")
                    .whereRaw("CASE WHEN COALESCE(ev.views, 0) > 0 THEN (COALESCE(ev.runs, 0)::numeric / ev.views) * 100 ELSE 0 END >= 60");
            }
            else if (params.health_tier === "high_potential") {
                query = query
                    .whereRaw("COALESCE(ev.runs, 0) < 10")
                    .whereRaw("CASE WHEN COALESCE(ev.views, 0) > 0 THEN (COALESCE(ev.runs, 0)::numeric / ev.views) * 100 ELSE 0 END >= 60");
            }
            else if (params.health_tier === "needs_optimization") {
                query = query
                    .whereRaw("COALESCE(ev.views, 0) >= 5")
                    .whereRaw("CASE WHEN COALESCE(ev.views, 0) > 0 THEN (COALESCE(ev.runs, 0)::numeric / ev.views) * 100 ELSE 0 END < 30");
            }
            else if (params.health_tier === "dormant") {
                query = query
                    .whereRaw("COALESCE(ev.runs, 0) = 0")
                    .whereRaw("COALESCE(ev.views, 0) = 0");
            }
        }
        // Clone query for total count
        const countQuery = index_schema_1.default.from(query.clone().as("sub")).count("* as total");
        const [countResult] = await countQuery;
        const total = Number((countResult === null || countResult === void 0 ? void 0 : countResult.total) || 0);
        // Sorting
        const allowedSortColumns = {
            views: "views",
            runs: "runs",
            conversion_rate: "conversion_rate",
            title: "t.title",
            last_used_at: "t.last_used_at",
            created_at: "t.created_at",
        };
        const sortBy = allowedSortColumns[params.sort_by || "runs"] || "runs";
        const sortOrder = params.sort_order === "asc" ? "asc" : "desc";
        query = query.orderBy(sortBy, sortOrder).offset(offset).limit(limit);
        const rows = await query;
        const tools = rows.map((r) => {
            const views = Number(r.views || 0);
            const runs = Number(r.runs || 0);
            const conversionRate = Number(r.conversion_rate || 0);
            const likes = Number(r.feedback_likes || 0);
            const dislikes = Number(r.feedback_dislikes || 0);
            const totalFb = likes + dislikes;
            const satisfactionRate = totalFb > 0 ? Number(((likes / totalFb) * 100).toFixed(0)) : null;
            let healthTier = "normal";
            if (runs >= 10 && conversionRate >= 60)
                healthTier = "star";
            else if (runs < 10 && conversionRate >= 60 && views > 0)
                healthTier = "high_potential";
            else if (views >= 5 && conversionRate < 30)
                healthTier = "needs_optimization";
            else if (runs === 0 && views === 0)
                healthTier = "dormant";
            return Object.assign(Object.assign({}, r), { views,
                runs, ref_clicks: Number(r.ref_clicks || 0), conversion_rate: conversionRate, satisfaction_rate: satisfactionRate, feedback_total: totalFb, health_tier: healthTier });
        });
        return {
            tools,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit) || 1,
            },
        };
    }
    /**
     * 3. Live Telemetry & Event Stream (Raw tool_events with filters)
     */
    async getEventsTelemetry(params) {
        const page = Math.max(1, Number(params.page || 1));
        const limit = Math.min(100, Math.max(1, Number(params.limit || 25)));
        const offset = (page - 1) * limit;
        let query = (0, index_schema_1.default)(`${index_schema_1.T.TOOL_EVENTS} as e`)
            .leftJoin(`${index_schema_1.T.TOOLS} as t`, "t.id", "e.tool_id")
            .leftJoin(`${index_schema_1.T.TOOLS} as ref_t`, "ref_t.id", "e.ref_tool_id")
            .select([
            "e.id",
            "e.tool_id",
            "t.title as tool_title",
            "t.slug as tool_slug",
            "t.category_slug",
            "e.event_type",
            "e.session_id",
            "e.user_id",
            "e.ref_tool_id",
            "ref_t.title as ref_tool_title",
            "ref_t.slug as ref_tool_slug",
            "e.meta",
            "e.created_at",
        ]);
        if (params.event_type && params.event_type !== "all") {
            query = query.where("e.event_type", params.event_type);
        }
        if (params.tool_id) {
            query = query.where("e.tool_id", params.tool_id);
        }
        if (params.session_id) {
            query = query.where("e.session_id", params.session_id.trim());
        }
        if (params.start_date) {
            query = query.where("e.created_at", ">=", new Date(params.start_date));
        }
        if (params.end_date) {
            query = query.where("e.created_at", "<=", new Date(params.end_date));
        }
        const countQuery = index_schema_1.default.from(query.clone().as("sub")).count("* as total");
        const [countResult] = await countQuery;
        const total = Number((countResult === null || countResult === void 0 ? void 0 : countResult.total) || 0);
        query = query.orderBy("e.created_at", "desc").offset(offset).limit(limit);
        const events = await query;
        return {
            events,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit) || 1,
            },
        };
    }
    /**
     * 4. Ingest Event Telemetry (Public tracking called by client)
     */
    async trackEvent(data) {
        let resolvedToolId = data.tool_id;
        if (!resolvedToolId && data.tool_slug) {
            const tool = await (0, index_schema_1.default)(index_schema_1.T.TOOLS).select("id").where({ slug: data.tool_slug }).first();
            if (tool)
                resolvedToolId = tool.id;
        }
        if (!resolvedToolId) {
            throw new HttpException_1.default(400, "Valid tool_id or tool_slug is required to track event");
        }
        let resolvedRefToolId = data.ref_tool_id || null;
        if (!resolvedRefToolId && data.ref_tool_slug) {
            const refTool = await (0, index_schema_1.default)(index_schema_1.T.TOOLS).select("id").where({ slug: data.ref_tool_slug }).first();
            if (refTool)
                resolvedRefToolId = refTool.id;
        }
        const [event] = await (0, index_schema_1.default)(index_schema_1.T.TOOL_EVENTS)
            .insert({
            tool_id: resolvedToolId,
            event_type: data.event_type,
            session_id: data.session_id,
            ref_tool_id: resolvedRefToolId,
            user_id: data.user_id || null,
            meta: data.meta ? JSON.stringify(data.meta) : "{}",
        })
            .returning("*");
        // Update counters on tools table
        if (data.event_type === "TOOL_RUN") {
            await (0, index_schema_1.default)(index_schema_1.T.TOOLS)
                .where({ id: resolvedToolId })
                .update({
                users_count: index_schema_1.default.raw("COALESCE(users_count, 0) + 1"),
                last_used_at: index_schema_1.default.fn.now(),
            });
        }
        else if (data.event_type === "PAGE_VIEW") {
            await (0, index_schema_1.default)(index_schema_1.T.TOOLS)
                .where({ id: resolvedToolId })
                .update({
                views: index_schema_1.default.raw("COALESCE(views, 0) + 1"),
            });
        }
        // Realtime broadcast to connected admin telemetry dashboards
        websocket_service_1.default.getInstance().emitToAdmins(websocket_interface_1.WebSocketEvents.TOOL_EVENT_CREATED, event);
        return event;
    }
}
exports.default = AdminAnalyticsService;
//# sourceMappingURL=admin-analytics.services.js.map