import { Request, Response, NextFunction } from "express";
import ImportExportService, { ImportMode } from "../services/import-export.service";
import { isValidResource } from "../config/import-export.registry";
import HttpException from "../exceptions/HttpException";

class ImportExportController {

    private service = new ImportExportService();

    // ══════════════════════════════════════════════════════════════════════════
    // POST /admin/import-export/export
    // Body: { resource: "tools" }
    // ══════════════════════════════════════════════════════════════════════════

    public export = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {

        try {

            const { resource } = req.body;

            // ── Validate resource name ──
            if (!resource) {
                throw new HttpException(400, "resource is required");
            }

            if (!isValidResource(resource)) {
                throw new HttpException(
                    400,
                    `Unknown resource "${resource}". Valid options: tools, tool_categories, tool_pages`
                );
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

        } catch (error) {
            next(error);
        }

    };

    // ══════════════════════════════════════════════════════════════════════════
    // POST /admin/import-export/import
    // Body: { resource: "tools", data: [...], mode: "append" | "update" }
    // ══════════════════════════════════════════════════════════════════════════

    public import = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {

        try {

            const { resource, data, mode } = req.body;

            // ── Validate resource ──
            if (!resource) {
                throw new HttpException(400, "resource is required");
            }
            if (!isValidResource(resource)) {
                throw new HttpException(
                    400,
                    `Unknown resource "${resource}". Valid options: tools, tool_categories, tool_pages`
                );
            }

            // ── Validate data ──
            if (!data || !Array.isArray(data) || data.length === 0) {
                throw new HttpException(400, "data must be a non-empty array");
            }

            // ── Validate mode ──
            const importMode: ImportMode = mode === "update" ? "update" : "append";

            // ── Run import ──
            const result = await this.service.importResource(
                resource,
                data,
                importMode
            );

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

        } catch (error) {
            next(error);
        }

    };

}

export default ImportExportController;