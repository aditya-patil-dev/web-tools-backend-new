"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const seo_robots_services_1 = __importDefault(require("../services/seo-robots.services"));
const HttpException_1 = __importDefault(require("../exceptions/HttpException"));
class SeoRobotsController {
    constructor() {
        this.SeoRobotsService = new seo_robots_services_1.default();
        /* =========================================
           PUBLIC ROUTE
        ========================================== */
        /**
         * GET /seo/robots
         * Returns formatted robots.txt data
         */
        this.getRobotsRules = async (req, res, next) => {
            try {
                const rules = await this.SeoRobotsService.getFormattedRobots();
                res.status(200).type("text/plain").send(rules);
            }
            catch (error) {
                next(error);
            }
        };
        /* =========================================
           ADMIN ROUTES
        ========================================== */
        /**
         * GET /seo/admin/robots
         */
        this.getAllRobotsRules = async (req, res, next) => {
            try {
                const rules = await this.SeoRobotsService.getAllRobotsRules();
                res.status(200).json({
                    success: true,
                    message: "Robots rules fetched successfully",
                    data: rules,
                });
            }
            catch (error) {
                next(error);
            }
        };
        /**
         * GET /seo/admin/robots/:id
         */
        this.getRobotsRuleById = async (req, res, next) => {
            try {
                const { id } = req.params;
                const rule = await this.SeoRobotsService.getRobotsRuleById(Number(id));
                if (!rule) {
                    throw new HttpException_1.default(404, "Robots rule not found");
                }
                res.status(200).json({
                    success: true,
                    message: "Robots rule fetched successfully",
                    data: rule,
                });
            }
            catch (error) {
                next(error);
            }
        };
        /**
         * POST /seo/admin/robots
         */
        this.createRobotsRule = async (req, res, next) => {
            try {
                const ruleData = req.body;
                const created = await this.SeoRobotsService.createRobotsRule(ruleData);
                res.status(201).json({
                    success: true,
                    message: "Robots rule created successfully",
                    data: created,
                });
            }
            catch (error) {
                next(error);
            }
        };
        /**
         * PUT /seo/admin/robots/:id
         */
        this.updateRobotsRule = async (req, res, next) => {
            try {
                const { id } = req.params;
                const ruleData = req.body;
                const updated = await this.SeoRobotsService.updateRobotsRule(Number(id), ruleData);
                if (!updated) {
                    throw new HttpException_1.default(404, "Robots rule not found");
                }
                res.status(200).json({
                    success: true,
                    message: "Robots rule updated successfully",
                    data: updated,
                });
            }
            catch (error) {
                next(error);
            }
        };
        /**
         * DELETE /seo/admin/robots/:id
         */
        this.deleteRobotsRule = async (req, res, next) => {
            try {
                const { id } = req.params;
                const deleted = await this.SeoRobotsService.deleteRobotsRule(Number(id));
                if (!deleted) {
                    throw new HttpException_1.default(404, "Robots rule not found");
                }
                res.status(200).json({
                    success: true,
                    message: "Robots rule deleted successfully",
                });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.default = SeoRobotsController;
//# sourceMappingURL=seo-robots.controllers.js.map