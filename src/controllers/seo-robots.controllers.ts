import { Request, Response, NextFunction } from "express";
import SeoRobotsService from "../services/seo-robots.services";
import HttpException from "../exceptions/HttpException";

class SeoRobotsController {
    public SeoRobotsService = new SeoRobotsService();

    /* =========================================
       PUBLIC ROUTE
    ========================================== */

    /**
     * GET /seo/robots
     * Returns formatted robots.txt data
     */
    public getRobotsRules = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const rules = await this.SeoRobotsService.getFormattedRobots();

            res.status(200).type("text/plain").send(rules);
        } catch (error) {
            next(error);
        }
    };

    /* =========================================
       ADMIN ROUTES
    ========================================== */

    /**
     * GET /seo/admin/robots
     */
    public getAllRobotsRules = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const rules = await this.SeoRobotsService.getAllRobotsRules();

            res.status(200).json({
                success: true,
                message: "Robots rules fetched successfully",
                data: rules,
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /seo/admin/robots/:id
     */
    public getRobotsRuleById = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const { id } = req.params;

            const rule = await this.SeoRobotsService.getRobotsRuleById(Number(id));

            if (!rule) {
                throw new HttpException(404, "Robots rule not found");
            }

            res.status(200).json({
                success: true,
                message: "Robots rule fetched successfully",
                data: rule,
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * POST /seo/admin/robots
     */
    public createRobotsRule = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const ruleData = req.body;

            const created = await this.SeoRobotsService.createRobotsRule(ruleData);

            res.status(201).json({
                success: true,
                message: "Robots rule created successfully",
                data: created,
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * PUT /seo/admin/robots/:id
     */
    public updateRobotsRule = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const { id } = req.params;
            const ruleData = req.body;

            const updated = await this.SeoRobotsService.updateRobotsRule(
                Number(id),
                ruleData,
            );

            if (!updated) {
                throw new HttpException(404, "Robots rule not found");
            }

            res.status(200).json({
                success: true,
                message: "Robots rule updated successfully",
                data: updated,
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * DELETE /seo/admin/robots/:id
     */
    public deleteRobotsRule = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const { id } = req.params;

            const deleted = await this.SeoRobotsService.deleteRobotsRule(
                Number(id),
            );

            if (!deleted) {
                throw new HttpException(404, "Robots rule not found");
            }

            res.status(200).json({
                success: true,
                message: "Robots rule deleted successfully",
            });
        } catch (error) {
            next(error);
        }
    };
}

export default SeoRobotsController;