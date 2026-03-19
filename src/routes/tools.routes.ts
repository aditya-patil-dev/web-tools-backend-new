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
        // All tools listing
        this.router.get(`/all`, this.ToolsController.getAllTools);

        // Listing page (cards)
        this.router.get(`/`, this.ToolsController.getTools);

        // Tool detail page
        this.router.get(`/:category/:slug`, this.ToolsController.getToolPage);

        // speed test route
        this.router.post("/speed-test", this.ToolsController.testWebsiteSpeed);

        // TOOL EVENT TRACKING
        this.router.post(
            "/events/track",
            this.ToolsController.trackToolEvent
        );

        // Open Graph Checker
        this.router.post("/og-check", this.ToolsController.checkOpenGraph);

    }
}

export default ToolsRoute;