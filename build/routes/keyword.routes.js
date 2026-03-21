"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const keyword_controllers_1 = __importDefault(require("../controllers/keyword.controllers"));
class KeywordRoute {
    constructor() {
        this.path = "/keyword";
        this.router = (0, express_1.Router)();
        this.KeywordController = new keyword_controllers_1.default();
        this.initializeRoutes();
    }
    initializeRoutes() {
        // POST /keyword/research
        this.router.post("/research", this.KeywordController.doKeywordResearch);
    }
}
exports.default = KeywordRoute;
//# sourceMappingURL=keyword.routes.js.map