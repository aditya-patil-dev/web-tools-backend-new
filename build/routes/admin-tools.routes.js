"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_tools_controllers_1 = __importDefault(require("../controllers/admin-tools.controllers"));
// import authMiddleware from "../middlewares/auth.middleware";
// import roleMiddleware from "../middlewares/role.middleware";
class AdminToolsRoute {
    constructor() {
        this.path = "/admin/tools";
        this.router = (0, express_1.Router)();
        this.controller = new admin_tools_controllers_1.default();
        this.initializeRoutes();
    }
    initializeRoutes() {
        // this.router.use(authMiddleware);
        // this.router.use(roleMiddleware(['admin', 'editor']));
        // ============================================
        // IMPORTANT: ROUTE ORDER MATTERS
        //
        // Express matches routes top-to-bottom. Any route with a dynamic
        // segment like /:id will greedily match paths that come after it
        // if registered first.
        //
        // For example, registering GET /:id before GET /categories/list
        // causes "categories" to be treated as an id value. All static
        // path segments (/bulk/*, /categories/*, /check/*) MUST be
        // registered BEFORE any /:id routes.
        // ============================================
        // ============================================
        // BULK OPERATIONS  (register before /:id)
        // ============================================
        // PATCH /admin/tools/bulk/update
        this.router.patch(`/bulk/update`, this.controller.bulkUpdate);
        // POST /admin/tools/bulk/delete
        this.router.post(`/bulk/delete`, this.controller.bulkDelete);
        // ============================================
        // CATEGORY OPERATIONS  (register before /:id)
        // ============================================
        // GET /admin/tools/categories/list
        this.router.get(`/categories/list`, this.controller.getCategories);
        // GET /admin/tools/categories/:slug
        this.router.get(`/categories/:slug`, this.controller.getCategoryBySlug);
        // POST /admin/tools/categories  (create or update)
        this.router.post(`/categories`, this.controller.upsertCategory);
        // DELETE /admin/tools/categories/:slug
        this.router.delete(`/categories/:slug`, this.controller.deleteCategory);
        // ============================================
        // SLUG CHECK  (register before /:id)
        // ============================================
        // GET /admin/tools/check/slug/:slug
        this.router.get(`/check/slug/:slug`, this.controller.checkSlugAvailability);
        // ============================================
        // ROOT COLLECTION OPERATIONS
        // ============================================
        // GET /admin/tools
        this.router.get(`/`, this.controller.getTools);
        // POST /admin/tools
        this.router.post(`/`, this.controller.createTool);
        // ============================================
        // TOOL CRUD — dynamic /:id routes LAST
        // ============================================
        // GET /admin/tools/:id
        this.router.get(`/:id`, this.controller.getToolById);
        // PUT /admin/tools/:id
        this.router.put(`/:id`, this.controller.updateTool);
        // DELETE /admin/tools/:id  (soft delete)
        this.router.delete(`/:id`, this.controller.deleteTool);
        // ============================================
        // TOOL SUB-RESOURCE ROUTES  (/:id/*)
        // These are fine after /:id because Express distinguishes
        // /:id from /:id/something by segment count.
        // ============================================
        // DELETE /admin/tools/:id/permanent  (hard delete)
        this.router.delete(`/:id/permanent`, this.controller.hardDeleteTool);
        // GET /admin/tools/:id/analytics
        this.router.get(`/:id/analytics`, this.controller.getToolAnalytics);
        // POST /admin/tools/:id/duplicate
        this.router.post(`/:id/duplicate`, this.controller.duplicateTool);
        // POST /admin/tools/:id/restore
        this.router.post(`/:id/restore`, this.controller.restoreTool);
    }
}
exports.default = AdminToolsRoute;
//# sourceMappingURL=admin-tools.routes.js.map