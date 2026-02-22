import { Router } from "express";
import Route from "../interfaces/route.interface";
import ToolsController from "../controllers/tools.controllers";

class ToolsRoute implements Route {
    public path = "/tools";
    public router = Router();
    public ToolsController = new ToolsController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // Listing page (cards)
        this.router.get(`/`, this.ToolsController.getTools);

        // Tool detail page
        this.router.get(`/:category/:slug`, this.ToolsController.getToolPage);
    }
}

export default ToolsRoute;