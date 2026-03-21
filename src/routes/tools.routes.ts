import { Router } from "express";
import multer from "multer";
import Route from "../interfaces/route.interface";
import ToolsController from "../controllers/tools.controllers";

// Memory storage — keeps file as a Buffer (no disk writes)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB max
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "application/pdf") cb(null, true);
    else cb(new Error("Only PDF files are allowed"));
  },
});

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
    this.router.post("/events/track", this.ToolsController.trackToolEvent);

    // Open Graph Checker
    this.router.post("/og-check", this.ToolsController.checkOpenGraph);

    // PDF protection
    this.router.post(
      "/protect-pdf",
      upload.single("pdf"),
      this.ToolsController.protectPdf,
    );
  }
}

export default ToolsRoute;
