"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const page_components_controller_1 = __importDefault(require("../controllers/page-components.controller"));
class PageComponentsRoute {
    constructor() {
        this.path = "/page-components";
        this.router = (0, express_1.Router)();
        this.pageComponentsController = new page_components_controller_1.default();
        this.initializeRoutes();
    }
    initializeRoutes() {
        /* ========================================
           PUBLIC ROUTES (Frontend Use)
        ========================================= */
        // Get all components for a specific page
        this.router.get(`/page/:page_key`, this.pageComponentsController.getPageComponents);
        // Get single component by type
        this.router.get(`/page/:page_key/:component_type`, this.pageComponentsController.getComponentByType);
        /* ========================================
           ADMIN CRUD ROUTES
        ========================================= */
        // Get all components with filters
        this.router.get(`/admin`, this.pageComponentsController.getAllComponents);
        // Get single component by ID
        this.router.get(`/admin/:id`, this.pageComponentsController.getComponentById);
        // Create new component
        this.router.post(`/admin`, this.pageComponentsController.createComponent);
        // Update component
        this.router.put(`/admin/:id`, this.pageComponentsController.updateComponent);
        // Delete component
        this.router.delete(`/admin/:id`, this.pageComponentsController.deleteComponent);
        // Reorder components
        this.router.post(`/admin/reorder`, this.pageComponentsController.reorderComponents);
        // Duplicate component
        this.router.post(`/admin/:id/duplicate`, this.pageComponentsController.duplicateComponent);
    }
}
exports.default = PageComponentsRoute;
//# sourceMappingURL=page-components.routes.js.map