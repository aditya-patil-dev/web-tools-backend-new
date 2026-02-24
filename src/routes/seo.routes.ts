import { Router } from "express";
import Route from "../interfaces/route.interface";
import SeoController from "../controllers/seo.controllers";

class SeoRoute implements Route {
    public path = "/seo";
    public router = Router();
    public SeoController = new SeoController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {

        /* ========================================
           PUBLIC ROUTES (Frontend Use)
        ========================================= */

        // Get SEO data by page_key (home, about, pricing)
        this.router.get(
            `/static/:page_key`,
            this.SeoController.getStaticPageSEO
        );

        // Get sitemap data (static pages only)
        this.router.get(
            `/static/sitemap`,
            this.SeoController.getStaticPagesForSitemap
        );



        /* ========================================
           ADMIN CRUD ROUTES
        ========================================= */

        // Create SEO record
        this.router.post(
            `/admin/static`,
            this.SeoController.createStaticPageSEO
        );

        // Update SEO record
        this.router.put(
            `/admin/static/:id`,
            this.SeoController.updateStaticPageSEO
        );

        // Delete SEO record
        this.router.delete(
            `/admin/static/:id`,
            this.SeoController.deleteStaticPageSEO
        );

        // Get all static SEO records (admin panel listing)
        this.router.get(
            `/admin/static`,
            this.SeoController.getAllStaticPageSEO
        );

        // Get single SEO record by ID (admin edit page)
        this.router.get(
            `/admin/static/:id`,
            this.SeoController.getStaticPageSEOById
        );
    }
}

export default SeoRoute;