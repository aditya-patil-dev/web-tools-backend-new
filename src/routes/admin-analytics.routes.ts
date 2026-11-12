import { Router } from "express";
import Route from "../interfaces/route.interface";
import AdminAnalyticsController from "../controllers/admin-analytics.controllers";

class AdminAnalyticsRoute implements Route {
  public path = "/admin/analytics";
  public router = Router();
  public controller = new AdminAnalyticsController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // GET /api/v1/admin/analytics/overview
    this.router.get(`/overview`, this.controller.getOverview);

    // GET /api/v1/admin/analytics/tools
    this.router.get(`/tools`, this.controller.getToolsAnalytics);

    // GET /api/v1/admin/analytics/events
    this.router.get(`/events`, this.controller.getEventsTelemetry);
  }
}

export default AdminAnalyticsRoute;

