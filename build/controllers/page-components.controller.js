"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const page_components_service_1 = __importDefault(require("../services/page-components.service"));
const HttpException_1 = __importDefault(require("../exceptions/HttpException"));
class PageComponentsController {
    constructor() {
        this.pageComponentsService = new page_components_service_1.default();
        /* ============================================
           PUBLIC ROUTES (Frontend Use)
        ============================================ */
        /**
         * GET /page-components/page/:page_key
         * Get all components for a specific page (Frontend)
         */
        this.getPageComponents = async (req, res, next) => {
            try {
                const { page_key } = req.params;
                if (!page_key) {
                    throw new HttpException_1.default(400, "Page key is required");
                }
                const components = await this.pageComponentsService.getPageComponents(page_key);
                res.status(200).json({
                    success: true,
                    message: "Page components fetched successfully",
                    data: components,
                });
            }
            catch (error) {
                next(error);
            }
        };
        /**
         * GET /page-components/page/:page_key/:component_type
         * Get single component by type (Frontend)
         */
        this.getComponentByType = async (req, res, next) => {
            try {
                const { page_key, component_type } = req.params;
                if (!page_key || !component_type) {
                    throw new HttpException_1.default(400, "Page key and component type are required");
                }
                const component = await this.pageComponentsService.getComponentByType(page_key, component_type);
                if (!component) {
                    throw new HttpException_1.default(404, "Component not found");
                }
                res.status(200).json({
                    success: true,
                    message: "Component fetched successfully",
                    data: component,
                });
            }
            catch (error) {
                next(error);
            }
        };
        /* ============================================
           ADMIN ROUTES
        ============================================ */
        /**
         * GET /page-components/admin
         * Get all components with filters (Admin)
         */
        this.getAllComponents = async (req, res, next) => {
            try {
                const filters = {
                    page: parseInt(req.query.page) || 1,
                    limit: parseInt(req.query.limit) || 20,
                    search: req.query.search,
                    page_key: req.query.page_key,
                    component_type: req.query.component_type,
                    status: req.query.status,
                    is_active: req.query.is_active === "true" ? true : req.query.is_active === "false" ? false : undefined,
                    sort_by: req.query.sort_by || "component_order",
                    sort_order: req.query.sort_order || "asc",
                };
                const result = await this.pageComponentsService.getAllComponents(filters);
                res.status(200).json({
                    success: true,
                    message: "Components fetched successfully",
                    data: result.components,
                    pagination: {
                        total: result.total,
                        page: result.page,
                        limit: result.limit,
                        totalPages: Math.ceil(result.total / result.limit),
                    },
                });
            }
            catch (error) {
                next(error);
            }
        };
        /**
         * GET /page-components/admin/:id
         * Get single component by ID (Admin)
         */
        this.getComponentById = async (req, res, next) => {
            try {
                const { id } = req.params;
                const component = await this.pageComponentsService.getComponentById(Number(id));
                if (!component) {
                    throw new HttpException_1.default(404, "Component not found");
                }
                res.status(200).json({
                    success: true,
                    message: "Component fetched successfully",
                    data: component,
                });
            }
            catch (error) {
                next(error);
            }
        };
        /**
         * POST /page-components/admin
         * Create new component (Admin)
         */
        this.createComponent = async (req, res, next) => {
            var _a;
            try {
                const componentData = req.body;
                // TODO: Get created_by from auth middleware
                const created_by = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const created = await this.pageComponentsService.createComponent(componentData, created_by);
                res.status(201).json({
                    success: true,
                    message: "Component created successfully",
                    data: created,
                });
            }
            catch (error) {
                next(error);
            }
        };
        /**
         * PUT /page-components/admin/:id
         * Update component (Admin)
         */
        this.updateComponent = async (req, res, next) => {
            var _a;
            try {
                const { id } = req.params;
                const componentData = req.body;
                // TODO: Get updated_by from auth middleware
                const updated_by = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const updated = await this.pageComponentsService.updateComponent(Number(id), componentData, updated_by);
                if (!updated) {
                    throw new HttpException_1.default(404, "Component not found");
                }
                res.status(200).json({
                    success: true,
                    message: "Component updated successfully",
                    data: updated,
                });
            }
            catch (error) {
                next(error);
            }
        };
        /**
         * DELETE /page-components/admin/:id
         * Delete component (Admin)
         */
        this.deleteComponent = async (req, res, next) => {
            try {
                const { id } = req.params;
                const deleted = await this.pageComponentsService.deleteComponent(Number(id));
                if (!deleted) {
                    throw new HttpException_1.default(404, "Component not found");
                }
                res.status(200).json({
                    success: true,
                    message: "Component deleted successfully",
                });
            }
            catch (error) {
                next(error);
            }
        };
        /**
         * POST /page-components/admin/reorder
         * Reorder components (Admin)
         */
        this.reorderComponents = async (req, res, next) => {
            try {
                const { page_key, orders } = req.body;
                if (!page_key || !orders || !Array.isArray(orders)) {
                    throw new HttpException_1.default(400, "Invalid request data");
                }
                await this.pageComponentsService.reorderComponents(page_key, orders);
                res.status(200).json({
                    success: true,
                    message: "Components reordered successfully",
                });
            }
            catch (error) {
                next(error);
            }
        };
        /**
         * POST /page-components/admin/:id/duplicate
         * Duplicate component (Admin)
         */
        this.duplicateComponent = async (req, res, next) => {
            var _a;
            try {
                const { id } = req.params;
                const created_by = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const duplicated = await this.pageComponentsService.duplicateComponent(Number(id), created_by);
                res.status(201).json({
                    success: true,
                    message: "Component duplicated successfully",
                    data: duplicated,
                });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.default = PageComponentsController;
//# sourceMappingURL=page-components.controller.js.map