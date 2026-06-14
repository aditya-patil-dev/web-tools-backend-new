"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const settings_controllers_1 = __importDefault(require("../controllers/settings.controllers"));
class SettingsRoute {
    constructor() {
        this.path = "/settings";
        this.router = (0, express_1.Router)();
        this.SettingsController = new settings_controllers_1.default();
        this.initializeRoutes();
    }
    initializeRoutes() {
        /* ========================================
               ADMIN ROUTES (FIRST)
            ========================================= */
        this.router.get(`/admin`, this.SettingsController.getSiteSettingsAdmin);
        this.router.put(`/admin`, this.SettingsController.updateSiteSettings);
        /* ========================================
               PUBLIC ROUTES
            ========================================= */
        this.router.get(`/`, this.SettingsController.getSiteSettings);
    }
}
exports.default = SettingsRoute;
//# sourceMappingURL=settings.routes.js.map