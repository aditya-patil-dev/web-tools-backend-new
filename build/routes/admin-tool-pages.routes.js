"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_tool_pages_controllers_1 = __importDefault(require("../controllers/admin-tool-pages.controllers"));
// import authMiddleware from "../middlewares/auth.middleware";
// import roleMiddleware from "../middlewares/role.middleware";
class AdminToolPagesRoute {
    constructor() {
        this.path = "/admin/tool-pages";
        this.router = (0, express_1.Router)();
        this.controller = new admin_tool_pages_controllers_1.default();
        this.initializeRoutes();
    }
    initializeRoutes() {
        // ============================================
        // TOOL PAGES CRUD
        // ============================================
        // GET /admin/tool-pages - List all tool pages
        this.router.get(`/`, this.controller.getToolPages);
        // POST /admin/tool-pages - Create new tool page
        this.router.post(`/`, this.controller.createToolPage);
        // GET /admin/tool-pages/:slug - Get single tool page by slug
        this.router.get(`/:slug`, this.controller.getToolPageBySlug);
        // PUT /admin/tool-pages/:slug - Update tool page
        this.router.put(`/:slug`, this.controller.updateToolPage);
        // DELETE /admin/tool-pages/:slug - Delete tool page
        this.router.delete(`/:slug`, this.controller.deleteToolPage);
    }
}
exports.default = AdminToolPagesRoute;
//# sourceMappingURL=admin-tool-pages.routes.js.map