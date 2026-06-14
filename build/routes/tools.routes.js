"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const tools_controllers_1 = __importDefault(require("../controllers/tools.controllers"));
// Memory storage — keeps file as a Buffer (no disk writes)
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB max
    fileFilter: (_req, file, cb) => {
        if (file.mimetype === "application/pdf")
            cb(null, true);
        else
            cb(new Error("Only PDF files are allowed"));
    },
});
// Image upload — separate multer instance for image routes
const imageUpload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB max
    fileFilter: (_req, file, cb) => {
        const ALLOWED = [
            "image/png",
            "image/jpeg",
            "image/jpg",
            "image/webp",
            "image/gif",
            "image/bmp",
        ];
        if (ALLOWED.includes(file.mimetype))
            cb(null, true);
        else
            cb(new Error("Only image files (PNG, JPG, WebP, GIF, BMP) are allowed"));
    },
});
class ToolsRoute {
    constructor() {
        this.path = "/tools";
        this.router = (0, express_1.Router)();
        this.ToolsController = new tools_controllers_1.default();
        this.initializeRoutes();
    }
    initializeRoutes() {
        // ── Listing & detail ───────────────────────────────────────────────
        this.router.get(`/all`, this.ToolsController.getAllTools);
        this.router.get(`/`, this.ToolsController.getTools);
        this.router.get(`/:category/:slug`, this.ToolsController.getToolPage);
        // ── Utility tools ──────────────────────────────────────────────────
        this.router.post("/speed-test", this.ToolsController.testWebsiteSpeed);
        this.router.post("/og-check", this.ToolsController.checkOpenGraph);
        // ── PDF tools ──────────────────────────────────────────────────────
        this.router.post("/protect-pdf", upload.single("pdf"), this.ToolsController.protectPdf);
        this.router.post("/unlock-pdf", upload.single("pdf"), this.ToolsController.unlockPdf);
        // ── AI Image Optimizer ─────────────────────────────────────────────
        this.router.post("/ai-compress", imageUpload.single("image"), this.ToolsController.aiCompressImage);
    }
}
exports.default = ToolsRoute;
//# sourceMappingURL=tools.routes.js.map