"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const import_export_service_1 = __importDefault(require("../services/import-export.service"));
const import_export_registry_1 = require("../config/import-export.registry");
const HttpException_1 = __importDefault(require("../exceptions/HttpException"));
class ImportExportController {
    constructor() {
        this.service = new import_export_service_1.default();
        // ══════════════════════════════════════════════════════════════════════════
        // POST /admin/import-export/export
        // Body: { resource: "tools" }
        // ══════════════════════════════════════════════════════════════════════════
        this.export = async (req, res, next) => {
            try {
                const { resource } = req.body;
                // ── Validate resource name ──
                if (!resource) {
                    throw new HttpException_1.default(400, "resource is required");
                }
                if (!(0, import_export_registry_1.isValidResource)(resource)) {
                    throw new HttpException_1.default(400, `Unknown resource "${resource}". Valid options: tools, tool_categories, tool_pages`);
                }
                const data = await this.service.exportResource(resource);
                res.status(200).json({
                    success: true,
                    message: `${resource} exported successfully`,
                    data,
                    meta: {
                        total: data.length,
                        resource,
                        exported_at: new Date().toISOString(),
                    },
                });
            }
            catch (error) {
                next(error);
            }
        };
        // ══════════════════════════════════════════════════════════════════════════
        // POST /admin/import-export/import
        // Body: { resource: "tools", data: [...], mode: "append" | "update" }
        // ══════════════════════════════════════════════════════════════════════════
        this.import = async (req, res, next) => {
            try {
                const { resource, data, mode } = req.body;
                // ── Validate resource ──
                if (!resource) {
                    throw new HttpException_1.default(400, "resource is required");
                }
                if (!(0, import_export_registry_1.isValidResource)(resource)) {
                    throw new HttpException_1.default(400, `Unknown resource "${resource}". Valid options: tools, tool_categories, tool_pages`);
                }
                // ── Validate data ──
                if (!data || !Array.isArray(data) || data.length === 0) {
                    throw new HttpException_1.default(400, "data must be a non-empty array");
                }
                // ── Validate mode ──
                const importMode = mode === "update" ? "update" : "append";
                // ── Run import ──
                const result = await this.service.importResource(resource, data, importMode);
                const allFailed = result.failed === data.length;
                const status = allFailed ? 422 : 200;
                res.status(status).json({
                    success: !allFailed,
                    message: allFailed
                        ? "Import failed — all rows had errors"
                        : `Import completed for ${resource}`,
                    data: result,
                    meta: {
                        resource,
                        mode: importMode,
                        total_rows: data.length,
                        imported_at: new Date().toISOString(),
                    },
                });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.default = ImportExportController;
//# sourceMappingURL=import-export.controller.js.map