"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const seo_service_1 = __importDefault(require("../services/seo.service"));
const HttpException_1 = __importDefault(require("../exceptions/HttpException"));
class SeoController {
    constructor() {
        this.SeoService = new seo_service_1.default();
        /* ============================================
           PUBLIC ROUTES
        ============================================ */
        /**
         * GET /seo/static/:page_key
         * Get SEO for frontend static page
         */
        this.getStaticPageSEO = async (req, res, next) => {
            try {
                const page_key = req.params.page_key;
                if (!page_key) {
                    throw new HttpException_1.default(400, "Page key is required");
                }
                const seo = await this.SeoService.getStaticPageSEO(page_key);
                if (!seo) {
                    throw new HttpException_1.default(404, "SEO record not found");
                }
                res.status(200).json({
                    success: true,
                    message: "SEO data fetched successfully",
                    data: seo,
                });
            }
            catch (error) {
                next(error);
            }
        };
        /**
         * GET /seo/static/sitemap
         * Get static pages for sitemap.xml
         */
        this.getStaticPagesForSitemap = async (req, res, next) => {
            try {
                const pages = await this.SeoService.getStaticPagesForSitemap();
                res.status(200).json({
                    success: true,
                    message: "Sitemap data fetched successfully",
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
         * GET /seo/admin/static
         * Get all static SEO records (admin panel)
         */
        this.getAllStaticPageSEO = async (req, res, next) => {
            try {
                const pages = await this.SeoService.getAllStaticPageSEO();
                res.status(200).json({
                    success: true,
                    message: "SEO records fetched successfully",
                    data: pages,
                });
            }
            catch (error) {
                next(error);
            }
        };
        /**
         * GET /seo/admin/static/:id
         */
        this.getStaticPageSEOById = async (req, res, next) => {
            try {
                const { id } = req.params;
                const seo = await this.SeoService.getStaticPageSEOById(Number(id));
                if (!seo) {
                    throw new HttpException_1.default(404, "SEO record not found");
                }
                res.status(200).json({
                    success: true,
                    message: "SEO record fetched successfully",
                    data: seo,
                });
            }
            catch (error) {
                next(error);
            }
        };
        /**
         * POST /seo/admin/static
         */
        this.createStaticPageSEO = async (req, res, next) => {
            try {
                const seoData = req.body;
                const created = await this.SeoService.createStaticPageSEO(seoData);
                res.status(201).json({
                    success: true,
                    message: "SEO record created successfully",
                    data: created,
                });
            }
            catch (error) {
                next(error);
            }
        };
        /**
         * PUT /seo/admin/static/:id
         */
        this.updateStaticPageSEO = async (req, res, next) => {
            try {
                const { id } = req.params;
                const seoData = req.body;
                const updated = await this.SeoService.updateStaticPageSEO(Number(id), seoData);
                if (!updated) {
                    throw new HttpException_1.default(404, "SEO record not found");
                }
                res.status(200).json({
                    success: true,
                    message: "SEO record updated successfully",
                    data: updated,
                });
            }
            catch (error) {
                next(error);
            }
        };
        /**
         * DELETE /seo/admin/static/:id
         */
        this.deleteStaticPageSEO = async (req, res, next) => {
            try {
                const { id } = req.params;
                const deleted = await this.SeoService.deleteStaticPageSEO(Number(id));
                if (!deleted) {
                    throw new HttpException_1.default(404, "SEO record not found");
                }
                res.status(200).json({
                    success: true,
                    message: "SEO record deleted successfully",
                });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.default = SeoController;
//# sourceMappingURL=seo.controllers.js.map