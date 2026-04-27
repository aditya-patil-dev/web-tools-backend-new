import { Request, Response, NextFunction } from "express";
import LegalPagesService from "../services/legal-pages.service";
import HttpException from "../exceptions/HttpException";

class LegalPagesController {
    public LegalPagesService = new LegalPagesService();

    /* ============================================
       PUBLIC ROUTES
    ============================================ */

    /**
     * GET /legal-pages/:slug
     * Get legal page for frontend
     */
    public getLegalPageBySlug = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const slug = req.params.slug as string;

            if (!slug) {
                throw new HttpException(400, "Slug is required");
            }

            const page =
                await this.LegalPagesService.getLegalPageBySlug(slug);

            if (!page) {
                throw new HttpException(404, "Legal page not found");
            }

            res.status(200).json({
                success: true,
                message: "Legal page fetched successfully",
                data: page,
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /legal-pages
     * Get all published legal pages (frontend footer use)
     */
    public getAllPublishedLegalPages = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const pages =
                await this.LegalPagesService.getAllPublishedLegalPages();

            res.status(200).json({
                success: true,
                message: "Legal pages fetched successfully",
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
     * GET /legal-pages/admin
     * Get all legal pages (admin panel)
     */
    public getAllLegalPages = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const pages =
                await this.LegalPagesService.getAllLegalPages();

            res.status(200).json({
                success: true,
                message: "Legal pages fetched successfully",
                data: pages,
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /legal-pages/admin/:id
     * Get single legal page by ID
     */
    public getLegalPageById = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const { id } = req.params;

            const page =
                await this.LegalPagesService.getLegalPageById(Number(id));

            if (!page) {
                throw new HttpException(404, "Legal page not found");
            }

            res.status(200).json({
                success: true,
                message: "Legal page fetched successfully",
                data: page,
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * POST /legal-pages/admin
     * Create legal page
     */
    public createLegalPage = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const pageData = req.body;

            const created =
                await this.LegalPagesService.createLegalPage(pageData);

            res.status(201).json({
                success: true,
                message: "Legal page created successfully",
                data: created,
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * PUT /legal-pages/admin/:id
     * Update legal page
     */
    public updateLegalPage = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const { id } = req.params;
            const pageData = req.body;

            const updated =
                await this.LegalPagesService.updateLegalPage(
                    Number(id),
                    pageData,
                );

            if (!updated) {
                throw new HttpException(404, "Legal page not found");
            }

            res.status(200).json({
                success: true,
                message: "Legal page updated successfully",
                data: updated,
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * DELETE /legal-pages/admin/:id
     */
    public deleteLegalPage = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const { id } = req.params;

            const deleted =
                await this.LegalPagesService.deleteLegalPage(Number(id));

            if (!deleted) {
                throw new HttpException(404, "Legal page not found");
            }

            res.status(200).json({
                success: true,
                message: "Legal page deleted successfully",
            });
        } catch (error) {
            next(error);
        }
    };
}

export default LegalPagesController;