"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const legal_pages_service_1 = __importDefault(require("../services/legal-pages.service"));
const HttpException_1 = __importDefault(require("../exceptions/HttpException"));
class LegalPagesController {
    constructor() {
        this.LegalPagesService = new legal_pages_service_1.default();
        /* ============================================
           PUBLIC ROUTES
        ============================================ */
        /**
         * GET /legal-pages/:slug
         * Get legal page for frontend
         */
        this.getLegalPageBySlug = async (req, res, next) => {
            try {
                const slug = req.params.slug;
                if (!slug) {
                    throw new HttpException_1.default(400, "Slug is required");
                }
                const page = await this.LegalPagesService.getLegalPageBySlug(slug);
                if (!page) {
                    throw new HttpException_1.default(404, "Legal page not found");
                }
                res.status(200).json({
                    success: true,
                    message: "Legal page fetched successfully",
                    data: page,
                });
            }
            catch (error) {
                next(error);
            }
        };
        /**
         * GET /legal-pages
         * Get all published legal pages (frontend footer use)
         */
        this.getAllPublishedLegalPages = async (req, res, next) => {
            try {
                const pages = await this.LegalPagesService.getAllPublishedLegalPages();
                res.status(200).json({
                    success: true,
                    message: "Legal pages fetched successfully",
                    data: pages,
                });
            }
            catch (error) {
                next(error);
            }
        };
        /* ============================================
           ADMIN ROUTES
        ============================================ */
        /**
         * GET /legal-pages/admin
         * Get all legal pages (admin panel)
         */
        this.getAllLegalPages = async (req, res, next) => {
            try {
                const pages = await this.LegalPagesService.getAllLegalPages();
                res.status(200).json({
                    success: true,
                    message: "Legal pages fetched successfully",
                    data: pages,
                });
            }
            catch (error) {
                next(error);
            }
        };
        /**
         * GET /legal-pages/admin/:id
         * Get single legal page by ID
         */
        this.getLegalPageById = async (req, res, next) => {
            try {
                const { id } = req.params;
                const page = await this.LegalPagesService.getLegalPageById(Number(id));
                if (!page) {
                    throw new HttpException_1.default(404, "Legal page not found");
                }
                res.status(200).json({
                    success: true,
                    message: "Legal page fetched successfully",
                    data: page,
                });
            }
            catch (error) {
                next(error);
            }
        };
        /**
         * POST /legal-pages/admin
         * Create legal page
         */
        this.createLegalPage = async (req, res, next) => {
            try {
                const pageData = req.body;
                const created = await this.LegalPagesService.createLegalPage(pageData);
                res.status(201).json({
                    success: true,
                    message: "Legal page created successfully",
                    data: created,
                });
            }
            catch (error) {
                next(error);
            }
        };
        /**
         * PUT /legal-pages/admin/:id
         * Update legal page
         */
        this.updateLegalPage = async (req, res, next) => {
            try {
                const { id } = req.params;
                const pageData = req.body;
                const updated = await this.LegalPagesService.updateLegalPage(Number(id), pageData);
                if (!updated) {
                    throw new HttpException_1.default(404, "Legal page not found");
                }
                res.status(200).json({
                    success: true,
                    message: "Legal page updated successfully",
                    data: updated,
                });
            }
            catch (error) {
                next(error);
            }
        };
        /**
         * DELETE /legal-pages/admin/:id
         */
        this.deleteLegalPage = async (req, res, next) => {
            try {
                const { id } = req.params;
                const deleted = await this.LegalPagesService.deleteLegalPage(Number(id));
                if (!deleted) {
                    throw new HttpException_1.default(404, "Legal page not found");
                }
                res.status(200).json({
                    success: true,
                    message: "Legal page deleted successfully",
                });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.default = LegalPagesController;
//# sourceMappingURL=legal-pages.controllers.js.map