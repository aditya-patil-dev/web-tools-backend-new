"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ai_tools_controllers_1 = __importDefault(require("../controllers/ai-tools.controllers"));
class AiToolsRoute {
    constructor() {
        this.path = "/ai-tools";
        this.router = (0, express_1.Router)();
        this.aiToolsController = new ai_tools_controllers_1.default();
        this.initializeRoutes();
    }
    initializeRoutes() {
        // POST /ai-tools/meta-description
        this.router.post("/meta-description", this.aiToolsController.generateMetaDescription);
    }
}
exports.default = AiToolsRoute;
//# sourceMappingURL=ai-tools.routes.js.map