"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const admin_tool_pages_services_1 = __importDefault(require("../services/admin-tool-pages.services"));
const HttpException_1 = __importDefault(require("../exceptions/HttpException"));
class AdminToolPagesController {
    constructor() {
        this.service = new admin_tool_pages_services_1.default();
        /**
         * GET /admin/tool-pages
         * Get all tool pages with filtering and pagination
         * Query params:
         *  - page: number (default: 1)
         *  - limit: number (default: 20)
         *  - search: string
         *  - status: draft|published|archived
         *  - tool_slug: string
         *  - sort_by: created_at|updated_at|page_title (default: created_at)
         *  - sort_order: asc|desc (default: desc)
         */
        this.getToolPages = async (req, res, next) => {
            try {
                const filters = {
                    page: parseInt(req.query.page) || 1,
                    limit: parseInt(req.query.limit) || 20,
                    search: req.query.search,
                    status: req.query.status,
                    tool_slug: req.query.tool_slug,
                    sort_by: req.query.sort_by || "created_at",
                    sort_order: req.query.sort_order || "desc",
                };
                const result = await this.service.getToolPages(filters);
                res.status(200).json({
                    success: true,
                    message: "Tool pages fetched successfully",
                    data: result.toolPages,
                    meta: {
                        total: result.total,
                        page: filters.page,
                        limit: filters.limit,
                        total_pages: Math.ceil(result.total / filters.limit),
                    },
                });
            }
            catch (error) {
                next(error);
            }
        };
        /**
         * GET /admin/tool-pages/:slug
         * Get single tool page by tool slug
         */
        this.getToolPageBySlug = async (req, res, next) => {
            try {
                const slug = req.params.slug;
                const toolPage = await this.service.getToolPageBySlug(slug);
                if (!toolPage) {
                    throw new HttpException_1.default(404, "Tool page not found");
                }
                res.status(200).json({
                    success: true,
                    message: "Tool page fetched successfully",
                    data: toolPage,
                });
            }
            catch (error) {
                next(error);
            }
        };
        /**
         * POST /admin/tool-pages
         * Create new tool page
         * Body: {
         *   tool_slug, page_title, page_description, page_intro,
         *   how_to_use, features, pros, cons, meta_title, ...
         * }
         */
        this.createToolPage = async (req, res, next) => {
            try {
                const toolPageData = req.body;
                if (!toolPageData.tool_slug) {
                    throw new HttpException_1.default(400, "Tool slug is required");
                }
                if (!toolPageData.page_title) {
                    throw new HttpException_1.default(400, "Page title is required");
                }
                // Check if tool exists
                const toolExists = await this.service.checkToolExists(toolPageData.tool_slug);
                if (!toolExists) {
                    throw new HttpException_1.default(404, `Tool with slug '${toolPageData.tool_slug}' not found`);
                }
                // Check if tool page already exists
                const pageExists = await this.service.checkToolPageExists(toolPageData.tool_slug);
                if (pageExists) {
                    throw new HttpException_1.default(409, `Tool page for '${toolPageData.tool_slug}' already exists`);
                }
                const result = await this.service.createToolPage(toolPageData);
                res.status(201).json({
                    success: true,
                    message: "Tool page created successfully",
                    data: result,
                });
            }
            catch (error) {
                next(error);
            }
        };
        /**
         * PUT /admin/tool-pages/:slug
         * Update existing tool page
         * Body: Same as create
         */
        this.updateToolPage = async (req, res, next) => {
            try {
                const slug = req.params.slug;
                const toolPageData = req.body;
                // Check if tool page exists
                const existingPage = await this.service.getToolPageBySlug(slug);
                if (!existingPage) {
                    throw new HttpException_1.default(404, "Tool page not found");
                }
                const result = await this.service.updateToolPage(slug, toolPageData);
                res.status(200).json({
                    success: true,
                    message: "Tool page updated successfully",
                    data: result,
                });
            }
            catch (error) {
                next(error);
            }
        };
        /**
         * DELETE /admin/tool-pages/:slug
         * Delete tool page
         */
        this.deleteToolPage = async (req, res, next) => {
            try {
                const slug = req.params.slug;
                await this.service.deleteToolPage(slug);
                res.status(200).json({
                    success: true,
                    message: "Tool page deleted successfully",
                });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.default = AdminToolPagesController;
//# sourceMappingURL=admin-tool-pages.controllers.js.map