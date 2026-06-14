"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const settings_service_1 = __importDefault(require("../services/settings.service"));
class SettingsController {
    constructor() {
        this.SettingsService = new settings_service_1.default();
        /* ============================================
             PUBLIC
          ============================================ */
        /**
         * GET /settings
         */
        this.getSiteSettings = async (req, res, next) => {
            try {
                const settings = await this.SettingsService.getSiteSettings();
                res.status(200).json({
                    success: true,
                    message: "Site settings fetched successfully",
                    data: settings,
                });
            }
            catch (error) {
                next(error);
            }
        };
        /* ============================================
             ADMIN
          ============================================ */
        /**
         * GET /settings/admin
         */
        this.getSiteSettingsAdmin = async (req, res, next) => {
            try {
                const settings = await this.SettingsService.getSiteSettingsAdmin();
                res.status(200).json({
                    success: true,
                    message: "Site settings fetched successfully",
                    data: settings,
                });
            }
            catch (error) {
                next(error);
            }
        };
        /**
         * PUT /settings/admin
         */
        this.updateSiteSettings = async (req, res, next) => {
            try {
                const updated = await this.SettingsService.updateSiteSettings(req.body);
                res.status(200).json({
                    success: true,
                    message: "Site settings updated successfully",
                    data: updated,
                });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.default = SettingsController;
//# sourceMappingURL=settings.controllers.js.map