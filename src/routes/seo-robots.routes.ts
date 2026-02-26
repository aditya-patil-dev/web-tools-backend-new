import { Router } from "express";
import Route from "../interfaces/route.interface";
import SeoRobotsController from "../controllers/seo-robots.controllers";

class SeoRobotsRoute implements Route {
    public path = "/seo";
    public router = Router();
    public SeoRobotsController = new SeoRobotsController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        /* =========================================
           PUBLIC ROUTE
        ========================================== */

        // Get robots.txt rules (for frontend)
        this.router.get(
            `/robots`,
            this.SeoRobotsController.getRobotsRules,
        );

        /* =========================================
           ADMIN ROUTES
        ========================================== */

        // Get all robots rules (admin panel)
        this.router.get(
            `/admin/robots`,
            this.SeoRobotsController.getAllRobotsRules,
        );

        // Get single robots rule
        this.router.get(
            `/admin/robots/:id`,
            this.SeoRobotsController.getRobotsRuleById,
        );

        // Create robots rule
        this.router.post(
            `/admin/robots`,
            this.SeoRobotsController.createRobotsRule,
        );

        // Update robots rule
        this.router.put(
            `/admin/robots/:id`,
            this.SeoRobotsController.updateRobotsRule,
        );

        // Delete robots rule
        this.router.delete(
            `/admin/robots/:id`,
            this.SeoRobotsController.deleteRobotsRule,
        );
    }
}

export default SeoRobotsRoute;