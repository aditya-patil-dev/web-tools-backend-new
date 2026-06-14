"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const legal_pages_controllers_1 = __importDefault(require("../controllers/legal-pages.controllers"));
class LegalPagesRoute {
    constructor() {
        this.path = "/legal-pages";
        this.router = (0, express_1.Router)();
        this.LegalPagesController = new legal_pages_controllers_1.default();
        this.initializeRoutes();
    }
    initializeRoutes() {
        /* ========================================
           ADMIN CRUD ROUTES
        ========================================= */
        // Create legal page
        this.router.post(`/admin`, this.LegalPagesController.createLegalPage);
        // Update legal page
        this.router.put(`/admin/:id`, this.LegalPagesController.updateLegalPage);
        // Delete legal page
        this.router.delete(`/admin/:id`, this.LegalPagesController.deleteLegalPage);
        // Get all legal pages (admin listing)
        this.router.get(`/admin`, this.LegalPagesController.getAllLegalPages);
        // Get single legal page by ID (admin edit)
        this.router.get(`/admin/:id`, this.LegalPagesController.getLegalPageById);
        /* ========================================
           PUBLIC ROUTES (Frontend Use)
        ========================================= */
        // Get legal page by slug
        // Example: /legal-pages/privacy-policy
        this.router.get(`/:slug`, this.LegalPagesController.getLegalPageBySlug);
        // Get all published legal pages (optional for footer links)
        this.router.get(`/`, this.LegalPagesController.getAllPublishedLegalPages);
    }
}
exports.default = LegalPagesRoute;
//# sourceMappingURL=legal-pages.routes.js.map