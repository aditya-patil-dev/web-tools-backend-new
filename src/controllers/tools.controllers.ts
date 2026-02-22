import { Request, Response, NextFunction } from "express";
import ToolsService from "../services/tools.services";
import HttpException from "../exceptions/HttpException";

class ToolsController {
    public ToolsService = new ToolsService();

    /**
     * GET /tools?category=image-tools
     * Listing page (cards only)
     */
    /**
     * GET /tools?category=image-tools
     * Listing page + category SEO
     */
    public getTools = async (req, res, next) => {
        try {
            const { category } = req.query;

            if (!category || typeof category !== "string") {
                throw new HttpException(400, "Category is required");
            }

            const [tools, categoryPage] = await Promise.all([
                this.ToolsService.getToolsByCategory(category),
                this.ToolsService.getCategoryPage(category),
            ]);

            res.status(200).json({
                success: true,
                message: "Tools fetched successfully",
                data: {
                    category: categoryPage,
                    tools,
                },
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /tools/:category/:slug
     * Tool page (SEO + content)
     */
    public getToolPage = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const { category, slug } = req.params;

            if (!category || !slug) {
                throw new HttpException(400, "Category and slug are required");
            }

            const toolPage = await this.ToolsService.getToolPage(category, slug);

            if (!toolPage) {
                throw new HttpException(404, "Tool not found");
            }

            res.status(200).json({
                success: true,
                message: "Tool page fetched successfully",
                data: toolPage,
            });
        } catch (error) {
            next(error);
        }
    };
}

export default ToolsController;