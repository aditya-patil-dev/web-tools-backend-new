import { Request, Response, NextFunction } from "express";
import PageComponentsService from "../services/page-components.service";
import HttpException from "../exceptions/HttpException";

class PageComponentsController {
    public pageComponentsService = new PageComponentsService();

    /* ============================================
       PUBLIC ROUTES (Frontend Use)
    ============================================ */

    /**
     * GET /page-components/page/:page_key
     * Get all components for a specific page (Frontend)
     */
    public getPageComponents = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { page_key } = req.params;

            if (!page_key) {
                throw new HttpException(400, "Page key is required");
            }

            const components = await this.pageComponentsService.getPageComponents(page_key);

            res.status(200).json({
                success: true,
                message: "Page components fetched successfully",
                data: components,
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /page-components/page/:page_key/:component_type
     * Get single component by type (Frontend)
     */
    public getComponentByType = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { page_key, component_type } = req.params;

            if (!page_key || !component_type) {
                throw new HttpException(400, "Page key and component type are required");
            }

            const component = await this.pageComponentsService.getComponentByType(
                page_key,
                component_type
            );

            if (!component) {
                throw new HttpException(404, "Component not found");
            }

            res.status(200).json({
                success: true,
                message: "Component fetched successfully",
                data: component,
            });
        } catch (error) {
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
    public getAllComponents = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const filters = {
                page: parseInt(req.query.page as string) || 1,
                limit: parseInt(req.query.limit as string) || 20,
                search: req.query.search as string,
                page_key: req.query.page_key as string,
                component_type: req.query.component_type as string,
                status: req.query.status as string,
                is_active: req.query.is_active === "true" ? true : req.query.is_active === "false" ? false : undefined,
                sort_by: (req.query.sort_by as string) || "component_order",
                sort_order: (req.query.sort_order as string) || "asc",
            };

            const result = await this.pageComponentsService.getAllComponents(filters) as { 
                components: any[]; total: number; page: number; limit: number; 
            };

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
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /page-components/admin/:id
     * Get single component by ID (Admin)
     */
    public getComponentById = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { id } = req.params;

            const component = await this.pageComponentsService.getComponentById(Number(id));

            if (!component) {
                throw new HttpException(404, "Component not found");
            }

            res.status(200).json({
                success: true,
                message: "Component fetched successfully",
                data: component,
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * POST /page-components/admin
     * Create new component (Admin)
     */
    public createComponent = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const componentData = req.body;
            // TODO: Get created_by from auth middleware
            const created_by = (req as any).user?.id;

            const created = await this.pageComponentsService.createComponent(
                componentData,
                created_by
            );

            res.status(201).json({
                success: true,
                message: "Component created successfully",
                data: created,
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * PUT /page-components/admin/:id
     * Update component (Admin)
     */
    public updateComponent = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { id } = req.params;
            const componentData = req.body;
            // TODO: Get updated_by from auth middleware
            const updated_by = (req as any).user?.id;

            const updated = await this.pageComponentsService.updateComponent(
                Number(id),
                componentData,
                updated_by
            );

            if (!updated) {
                throw new HttpException(404, "Component not found");
            }

            res.status(200).json({
                success: true,
                message: "Component updated successfully",
                data: updated,
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * DELETE /page-components/admin/:id
     * Delete component (Admin)
     */
    public deleteComponent = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { id } = req.params;

            const deleted = await this.pageComponentsService.deleteComponent(Number(id));

            if (!deleted) {
                throw new HttpException(404, "Component not found");
            }

            res.status(200).json({
                success: true,
                message: "Component deleted successfully",
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * POST /page-components/admin/reorder
     * Reorder components (Admin)
     */
    public reorderComponents = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { page_key, orders } = req.body;

            if (!page_key || !orders || !Array.isArray(orders)) {
                throw new HttpException(400, "Invalid request data");
            }

            await this.pageComponentsService.reorderComponents(page_key, orders);

            res.status(200).json({
                success: true,
                message: "Components reordered successfully",
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * POST /page-components/admin/:id/duplicate
     * Duplicate component (Admin)
     */
    public duplicateComponent = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { id } = req.params;
            const created_by = (req as any).user?.id;

            const duplicated = await this.pageComponentsService.duplicateComponent(
                Number(id),
                created_by
            );

            res.status(201).json({
                success: true,
                message: "Component duplicated successfully",
                data: duplicated,
            });
        } catch (error) {
            next(error);
        }
    };
}

export default PageComponentsController;