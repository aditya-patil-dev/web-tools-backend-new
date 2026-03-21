"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const seo_controllers_1 = __importDefault(require("../controllers/seo.controllers"));
class SeoRoute {
    constructor() {
        this.path = "/seo";
        this.router = (0, express_1.Router)();
        this.SeoController = new seo_controllers_1.default();
        this.initializeRoutes();
    }
    initializeRoutes() {
        /* ========================================
           PUBLIC ROUTES (Frontend Use)
        ========================================= */
        // Get SEO data by page_key (home, about, pricing)
        this.router.get(`/static/:page_key`, this.SeoController.getStaticPageSEO);
        // Get sitemap data (static pages only)
        this.router.get(`/static/sitemap`, this.SeoController.getStaticPagesForSitemap);
        /* ========================================
           ADMIN CRUD ROUTES
        ========================================= */
        // Create SEO record
        this.router.post(`/admin/static`, this.SeoController.createStaticPageSEO);
        // Update SEO record
        this.router.put(`/admin/static/:id`, this.SeoController.updateStaticPageSEO);
        // Delete SEO record
        this.router.delete(`/admin/static/:id`, this.SeoController.deleteStaticPageSEO);
        // Get all static SEO records (admin panel listing)
        this.router.get(`/admin/static`, this.SeoController.getAllStaticPageSEO);
        // Get single SEO record by ID (admin edit page)
        this.router.get(`/admin/static/:id`, this.SeoController.getStaticPageSEOById);
    }
}
exports.default = SeoRoute;
//# sourceMappingURL=seo.routes.js.map