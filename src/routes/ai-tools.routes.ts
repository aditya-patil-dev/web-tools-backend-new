import { Router } from "express";
import Route from "../interfaces/route.interface";
import AiToolsController from "../controllers/ai-tools.controllers";

class AiToolsRoute implements Route {
    public path = "/ai-tools";
    public router = Router();
    public aiToolsController = new AiToolsController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // POST /ai-tools/meta-description
        this.router.post("/meta-description", this.aiToolsController.generateMetaDescription);
    }
}

export default AiToolsRoute;