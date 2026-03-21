"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const import_export_controller_1 = __importDefault(require("../controllers/import-export.controller"));
class ImportExportRoute {
    constructor() {
        this.path = "/admin/import-export";
        this.router = (0, express_1.Router)();
        this.controller = new import_export_controller_1.default();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.post(`/export`, this.controller.export);
        this.router.post(`/import`, this.controller.import);
    }
}
exports.default = ImportExportRoute;
//# sourceMappingURL=import-export.routes.js.map