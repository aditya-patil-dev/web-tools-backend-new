"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const seo_robots_controllers_1 = __importDefault(require("../controllers/seo-robots.controllers"));
class SeoRobotsRoute {
    constructor() {
        this.path = "/seo";
        this.router = (0, express_1.Router)();
        this.SeoRobotsController = new seo_robots_controllers_1.default();
        this.initializeRoutes();
    }
    initializeRoutes() {
        /* =========================================
           PUBLIC ROUTE
        ========================================== */
        // Get robots.txt rules (for frontend)
        this.router.get(`/robots`, this.SeoRobotsController.getRobotsRules);
        /* =========================================
           ADMIN ROUTES
        ========================================== */
        // Get all robots rules (admin panel)
        this.router.get(`/admin/robots`, this.SeoRobotsController.getAllRobotsRules);
        // Get single robots rule
        this.router.get(`/admin/robots/:id`, this.SeoRobotsController.getRobotsRuleById);
        // Create robots rule
        this.router.post(`/admin/robots`, this.SeoRobotsController.createRobotsRule);
        // Update robots rule
        this.router.put(`/admin/robots/:id`, this.SeoRobotsController.updateRobotsRule);
        // Delete robots rule
        this.router.delete(`/admin/robots/:id`, this.SeoRobotsController.deleteRobotsRule);
    }
}
exports.default = SeoRobotsRoute;
//# sourceMappingURL=seo-robots.routes.js.map