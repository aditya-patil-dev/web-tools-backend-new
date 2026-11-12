"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const admin_analytics_services_1 = __importDefault(require("../services/admin-analytics.services"));
class AdminAnalyticsController {
    constructor() {
        this.analyticsService = new admin_analytics_services_1.default();
        /**
         * GET /admin/analytics/overview
         */
        this.getOverview = async (req, res, next) => {
            try {
                const { range, start_date, end_date, category } = req.query;
                const data = await this.analyticsService.getOverviewAnalytics({
                    range: range,
                    start_date: start_date,
                    end_date: end_date,
                    category: category,
                });
                res.status(200).json({
                    success: true,
                    message: "Analytics overview fetched successfully",
                    data,
                });
            }
            catch (error) {
                next(error);
            }
        };
        /**
         * GET /admin/analytics/tools
         */
        this.getToolsAnalytics = async (req, res, next) => {
            try {
                const { page, limit, search, category, health_tier, sort_by, sort_order, range, start_date, end_date, } = req.query;
                const data = await this.analyticsService.getToolsAnalytics({
                    page: page ? Number(page) : undefined,
                    limit: limit ? Number(limit) : undefined,
                    search: search,
                    category: category,
                    health_tier: health_tier,
                    sort_by: sort_by,
                    sort_order: sort_order,
                    range: range,
                    start_date: start_date,
                    end_date: end_date,
                });
                res.status(200).json({
                    success: true,
                    message: "Tool performance analytics fetched successfully",
                    data: data.tools,
                    meta: data.meta,
                });
            }
            catch (error) {
                next(error);
            }
        };
        /**
         * GET /admin/analytics/events
         */
        this.getEventsTelemetry = async (req, res, next) => {
            try {
                const { page, limit, event_type, tool_id, session_id, start_date, end_date, } = req.query;
                const data = await this.analyticsService.getEventsTelemetry({
                    page: page ? Number(page) : undefined,
                    limit: limit ? Number(limit) : undefined,
                    event_type: event_type,
                    tool_id: tool_id ? Number(tool_id) : undefined,
                    session_id: session_id,
                    start_date: start_date,
                    end_date: end_date,
                });
                res.status(200).json({
                    success: true,
                    message: "Events telemetry fetched successfully",
                    data: data.events,
                    meta: data.meta,
                });
            }
            catch (error) {
                next(error);
            }
        };
        /**
         * POST /tools/events/track (Public Tracking Endpoint)
         */
        this.trackEvent = async (req, res, next) => {
            try {
                const { tool_slug, tool_id, event_type, session_id, ref_tool_slug, ref_tool_id, meta, } = req.body;
                if (!event_type || !session_id) {
                    res.status(400).json({
                        success: false,
                        message: "event_type and session_id are required",
                    });
                    return;
                }
                const event = await this.analyticsService.trackEvent({
                    tool_slug,
                    tool_id,
                    event_type,
                    session_id,
                    ref_tool_slug,
                    ref_tool_id,
                    meta,
                });
                res.status(201).json({
                    success: true,
                    message: "Event tracked successfully",
                    data: event,
                });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.default = AdminAnalyticsController;
//# sourceMappingURL=admin-analytics.controllers.js.map