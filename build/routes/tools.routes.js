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
class ToolsRoute {
    constructor() {
        this.path = "/tools";
        this.router = (0, express_1.Router)();
        this.ToolsController = new tools_controllers_1.default();
        this.initializeRoutes();
    }
    initializeRoutes() {
        // All tools listing
        this.router.get(`/all`, this.ToolsController.getAllTools);
        // Listing page (cards)
        this.router.get(`/`, this.ToolsController.getTools);
        // Tool detail page
        this.router.get(`/:category/:slug`, this.ToolsController.getToolPage);
        // speed test route
        this.router.post("/speed-test", this.ToolsController.testWebsiteSpeed);
        // TOOL EVENT TRACKING
        this.router.post("/events/track", this.ToolsController.trackToolEvent);
        // Open Graph Checker
        this.router.post("/og-check", this.ToolsController.checkOpenGraph);
        // PDF protection
        this.router.post("/protect-pdf", upload.single("pdf"), this.ToolsController.protectPdf);
    }
}
exports.default = ToolsRoute;
//# sourceMappingURL=tools.routes.js.map