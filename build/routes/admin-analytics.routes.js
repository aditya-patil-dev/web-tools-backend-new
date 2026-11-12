"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_analytics_controllers_1 = __importDefault(require("../controllers/admin-analytics.controllers"));
class AdminAnalyticsRoute {
    constructor() {
        this.path = "/admin/analytics";
        this.router = (0, express_1.Router)();
        this.controller = new admin_analytics_controllers_1.default();
        this.initializeRoutes();
    }
    initializeRoutes() {
        // GET /api/v1/admin/analytics/overview
        this.router.get(`/overview`, this.controller.getOverview);
        // GET /api/v1/admin/analytics/tools
        this.router.get(`/tools`, this.controller.getToolsAnalytics);
        // GET /api/v1/admin/analytics/events
        this.router.get(`/events`, this.controller.getEventsTelemetry);
    }
}
exports.default = AdminAnalyticsRoute;
//# sourceMappingURL=admin-analytics.routes.js.map