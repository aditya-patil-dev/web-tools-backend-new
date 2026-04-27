import { Request, Response, NextFunction } from "express";
import SeoService from "../services/seo.service";
import HttpException from "../exceptions/HttpException";

class SeoController {
    public SeoService = new SeoService();

    /* ============================================
       PUBLIC ROUTES
    ============================================ */

    /**
     * GET /seo/static/:page_key
     * Get SEO for frontend static page
     */
    public getStaticPageSEO = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const page_key = req.params.page_key as string;

            if (!page_key) {
                throw new HttpException(400, "Page key is required");
            }

            const seo = await this.SeoService.getStaticPageSEO(page_key);

            if (!seo) {
                throw new HttpException(404, "SEO record not found");
            }

            res.status(200).json({
                success: true,
                message: "SEO data fetched successfully",
                data: seo,
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /seo/static/sitemap
     * Get static pages for sitemap.xml
     */
    public getStaticPagesForSitemap = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const pages = await this.SeoService.getStaticPagesForSitemap();

            res.status(200).json({
                success: true,
                message: "Sitemap data fetched successfully",
                data: pages,
            });
        } catch (error) {
            next(error);
        }
    };

    /* ============================================
       ADMIN ROUTES
    ============================================ */

    /**
     * GET /seo/admin/static
     * Get all static SEO records (admin panel)
     */
    public getAllStaticPageSEO = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const pages = await this.SeoService.getAllStaticPageSEO();

            res.status(200).json({
                success: true,
                message: "SEO records fetched successfully",
                data: pages,
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /seo/admin/static/:id
     */
    public getStaticPageSEOById = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const { id } = req.params;

            const seo = await this.SeoService.getStaticPageSEOById(Number(id));

            if (!seo) {
                throw new HttpException(404, "SEO record not found");
            }

            res.status(200).json({
                success: true,
                message: "SEO record fetched successfully",
                data: seo,
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * POST /seo/admin/static
     */
    public createStaticPageSEO = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const seoData = req.body;

            const created = await this.SeoService.createStaticPageSEO(seoData);

            res.status(201).json({
                success: true,
                message: "SEO record created successfully",
                data: created,
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * PUT /seo/admin/static/:id
     */
    public updateStaticPageSEO = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const { id } = req.params;
            const seoData = req.body;

            const updated = await this.SeoService.updateStaticPageSEO(
                Number(id),
                seoData,
            );

            if (!updated) {
                throw new HttpException(404, "SEO record not found");
            }

            res.status(200).json({
                success: true,
                message: "SEO record updated successfully",
                data: updated,
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * DELETE /seo/admin/static/:id
     */
    public deleteStaticPageSEO = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const { id } = req.params;

            const deleted = await this.SeoService.deleteStaticPageSEO(Number(id));

            if (!deleted) {
                throw new HttpException(404, "SEO record not found");
            }

            res.status(200).json({
                success: true,
                message: "SEO record deleted successfully",
            });
        } catch (error) {
            next(error);
        }
    };
}

export default SeoController;