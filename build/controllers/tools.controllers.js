"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tools_services_1 = __importDefault(require("../services/tools.services"));
const HttpException_1 = __importDefault(require("../exceptions/HttpException"));
class ToolsController {
    constructor() {
        this.ToolsService = new tools_services_1.default();
        /**
         * GET /tools/all
         * All tools across every category + category list for filter tabs
         */
        this.getAllTools = async (req, res, next) => {
            try {
                const data = await this.ToolsService.getAllTools();
                res.status(200).json({
                    success: true,
                    message: "All tools fetched successfully",
                    data,
                });
            }
            catch (error) {
                next(error);
            }
        };
        /**
         * GET /tools?category=image-tools
         * Listing page (cards only)
         */
        this.getTools = async (req, res, next) => {
            try {
                const { category } = req.query;
                if (!category || typeof category !== "string") {
                    throw new HttpException_1.default(400, "Category is required");
                }
                const [tools, categoryPage] = await Promise.all([
                    this.ToolsService.getToolsByCategory(category),
                    this.ToolsService.getCategoryPage(category),
                ]);
                res.status(200).json({
                    success: true,
                    message: "Tools fetched successfully",
                    data: {
                        category: categoryPage,
                        tools,
                    },
                });
            }
            catch (error) {
                next(error);
            }
        };
        /**
         * GET /tools/:category/:slug
         * Tool page (SEO + content)
         */
        this.getToolPage = async (req, res, next) => {
            try {
                const category = req.params.category;
                const slug = req.params.slug;
                if (!category || !slug) {
                    throw new HttpException_1.default(400, "Category and slug are required");
                }
                const toolPage = await this.ToolsService.getToolPage(category, slug);
                if (!toolPage) {
                    throw new HttpException_1.default(404, "Tool not found");
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
         * POST /tools/speed-test
         */
        this.testWebsiteSpeed = async (req, res, next) => {
            try {
                let { url } = req.body;
                if (!url) {
                    throw new HttpException_1.default(400, "URL is required");
                }
                if (!url.startsWith("http")) {
                    url = `https://${url}`;
                }
                const data = await this.ToolsService.testWebsiteSpeed(url);
                res.status(200).json({
                    success: true,
                    message: "Speed test completed",
                    data,
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.checkOpenGraph = async (req, res, next) => {
            try {
                let { url } = req.body;
                if (!url)
                    throw new HttpException_1.default(400, "URL is required");
                if (!url.startsWith("http"))
                    url = `https://${url}`;
                const data = await this.ToolsService.checkOpenGraph(url);
                res.status(200).json({
                    success: true,
                    message: "OG tags fetched successfully",
                    data,
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.protectPdf = async (req, res, next) => {
            try {
                const file = req.file;
                const { password, ownerPassword, allowPrint, allowCopy, allowModify } = req.body;
                if (!file)
                    throw new HttpException_1.default(400, "PDF file is required");
                if (!password)
                    throw new HttpException_1.default(400, "Password is required");
                if (password.length < 6)
                    throw new HttpException_1.default(400, "Password must be at least 6 characters");
                const { buffer, fileName } = await this.ToolsService.protectPdf({
                    buffer: file.buffer,
                    originalName: file.originalname,
                    password,
                    ownerPassword: ownerPassword || password,
                    allowPrint: allowPrint === "true",
                    allowCopy: allowCopy === "true",
                    allowModify: allowModify === "true",
                });
                res.set({
                    "Content-Type": "application/pdf",
                    "Content-Disposition": `attachment; filename="${fileName}"`,
                    "Content-Length": buffer.length.toString(),
                    "X-File-Name": fileName,
                });
                res.send(buffer);
            }
            catch (error) {
                next(error);
            }
        };
        this.unlockPdf = async (req, res, next) => {
            try {
                const file = req.file;
                const password = req.body.password;
                if (!file)
                    throw new HttpException_1.default(400, "PDF file is required");
                if (!password)
                    throw new HttpException_1.default(400, "Password is required");
                const { buffer, fileName } = await this.ToolsService.unlockPdf({
                    buffer: file.buffer,
                    originalName: file.originalname,
                    password,
                });
                res.set({
                    "Content-Type": "application/pdf",
                    "Content-Disposition": `attachment; filename="${fileName}"`,
                    "Content-Length": buffer.length.toString(),
                    "X-File-Name": fileName,
                });
                res.send(buffer);
            }
            catch (error) {
                next(error);
            }
        };
        /**
         * POST /tools/ai-compress
         */
        this.aiCompressImage = async (req, res, next) => {
            try {
                const file = req.file;
                if (!file) {
                    throw new HttpException_1.default(400, "Image file is required");
                }
                const result = await this.ToolsService.aiCompressImage({
                    buffer: file.buffer,
                    mimeType: file.mimetype,
                    originalName: file.originalname,
                    size: file.size,
                });
                res.status(200).json({
                    success: true,
                    message: "Image optimized successfully",
                    data: result,
                });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.default = ToolsController;
//# sourceMappingURL=tools.controllers.js.map