"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_schema_1 = __importStar(require("../database/index.schema"));
const HttpException_1 = __importDefault(require("../exceptions/HttpException"));
class SettingsService {
    /* =====================================================
         PUBLIC
      ===================================================== */
    /**
     * Get active site settings (Frontend use)
     */
    async getSiteSettings() {
        const settings = await (0, index_schema_1.default)(index_schema_1.T.SITE_SETTINGS).where("is_active", true).first();
        if (!settings)
            throw new HttpException_1.default(404, "Site settings not found");
        return settings;
    }
    /* =====================================================
         ADMIN
      ===================================================== */
    /**
     * Get settings for admin panel
     */
    async getSiteSettingsAdmin() {
        const settings = await (0, index_schema_1.default)(index_schema_1.T.SITE_SETTINGS).first();
        if (!settings)
            throw new HttpException_1.default(404, "Site settings not found");
        return settings;
    }
    /**
     * Update site settings (Single row system)
     */
    async updateSiteSettings(data) {
        const existing = await (0, index_schema_1.default)(index_schema_1.T.SITE_SETTINGS).first();
        if (!existing)
            throw new HttpException_1.default(404, "Site settings not found");
        const updateData = {};
        /*
            SITE IDENTITY
            */
        if (data.site_name !== undefined)
            updateData.site_name = data.site_name;
        if (data.site_tagline !== undefined)
            updateData.site_tagline = data.site_tagline;
        if (data.site_url !== undefined)
            updateData.site_url = data.site_url;
        if (data.site_description !== undefined)
            updateData.site_description = data.site_description;
        if (data.logo_url !== undefined)
            updateData.logo_url = data.logo_url;
        if (data.favicon_url !== undefined)
            updateData.favicon_url = data.favicon_url;
        /*
            ANALYTICS
            */
        if (data.google_analytics_id !== undefined)
            updateData.google_analytics_id = data.google_analytics_id;
        if (data.google_tag_manager_id !== undefined)
            updateData.google_tag_manager_id = data.google_tag_manager_id;
        if (data.google_search_console !== undefined)
            updateData.google_search_console = data.google_search_console;
        if (data.bing_webmaster !== undefined)
            updateData.bing_webmaster = data.bing_webmaster;
        if (data.facebook_pixel_id !== undefined)
            updateData.facebook_pixel_id = data.facebook_pixel_id;
        if (data.hotjar_site_id !== undefined)
            updateData.hotjar_site_id = data.hotjar_site_id;
        /*
            SYSTEM FLAGS
            */
        if (data.maintenance_mode !== undefined)
            updateData.maintenance_mode = data.maintenance_mode;
        if (data.is_active !== undefined)
            updateData.is_active = data.is_active;
        updateData.updated_at = index_schema_1.default.fn.now();
        updateData.updated_by = data.updated_by || null;
        await (0, index_schema_1.default)(index_schema_1.T.SITE_SETTINGS).where("id", existing.id).update(updateData);
        return this.getSiteSettingsAdmin();
    }
}
exports.default = SettingsService;
//# sourceMappingURL=settings.service.js.map