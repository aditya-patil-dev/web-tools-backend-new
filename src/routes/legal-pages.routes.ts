import { Router } from "express";
import Route from "../interfaces/route.interface";
import LegalPagesController from "../controllers/legal-pages.controllers";

class LegalPagesRoute implements Route {
    public path = "/legal-pages";
    public router = Router();
    public LegalPagesController = new LegalPagesController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {

        /* ========================================
           ADMIN CRUD ROUTES
        ========================================= */

        // Create legal page
        this.router.post(
            `/admin`,
            this.LegalPagesController.createLegalPage
        );

        // Update legal page
        this.router.put(
            `/admin/:id`,
            this.LegalPagesController.updateLegalPage
        );

        // Delete legal page
        this.router.delete(
            `/admin/:id`,
            this.LegalPagesController.deleteLegalPage
        );

        // Get all legal pages (admin listing)
        this.router.get(
            `/admin`,
            this.LegalPagesController.getAllLegalPages
        );

        // Get single legal page by ID (admin edit)
        this.router.get(
            `/admin/:id`,
            this.LegalPagesController.getLegalPageById
        );

        /* ========================================
           PUBLIC ROUTES (Frontend Use)
        ========================================= */

        // Get legal page by slug
        // Example: /legal-pages/privacy-policy
        this.router.get(
            `/:slug`,
            this.LegalPagesController.getLegalPageBySlug
        );

        // Get all published legal pages (optional for footer links)
        this.router.get(
            `/`,
            this.LegalPagesController.getAllPublishedLegalPages
        );

    }
}

export default LegalPagesRoute;