import { Router } from "express";
import Route from "../interfaces/route.interface";
import PageComponentsController from "../controllers/page-components.controller";

class PageComponentsRoute implements Route {
    public path = "/page-components";
    public router = Router();
    public pageComponentsController = new PageComponentsController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        /* ========================================
           PUBLIC ROUTES (Frontend Use)
        ========================================= */

        // Get all components for a specific page
        this.router.get(
            `/page/:page_key`,
            this.pageComponentsController.getPageComponents
        );

        // Get single component by type
        this.router.get(
            `/page/:page_key/:component_type`,
            this.pageComponentsController.getComponentByType
        );

        /* ========================================
           ADMIN CRUD ROUTES
        ========================================= */

        // Get all components with filters
        this.router.get(
            `/admin`,
            this.pageComponentsController.getAllComponents
        );

        // Get single component by ID
        this.router.get(
            `/admin/:id`,
            this.pageComponentsController.getComponentById
        );

        // Create new component
        this.router.post(
            `/admin`,
            this.pageComponentsController.createComponent
        );

        // Update component
        this.router.put(
            `/admin/:id`,
            this.pageComponentsController.updateComponent
        );

        // Delete component
        this.router.delete(
            `/admin/:id`,
            this.pageComponentsController.deleteComponent
        );

        // Reorder components
        this.router.post(
            `/admin/reorder`,
            this.pageComponentsController.reorderComponents
        );

        // Duplicate component
        this.router.post(
            `/admin/:id/duplicate`,
            this.pageComponentsController.duplicateComponent
        );
    }
}

export default PageComponentsRoute;