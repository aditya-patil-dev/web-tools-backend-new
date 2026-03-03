import { Router } from "express";
import Route from "../interfaces/route.interface";
import SettingsController from "../controllers/settings.controllers";

class SettingsRoute implements Route {
  public path = "/settings";
  public router = Router();
  public SettingsController = new SettingsController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    /* ========================================
           ADMIN ROUTES (FIRST)
        ========================================= */

    this.router.get(`/admin`, this.SettingsController.getSiteSettingsAdmin);

    this.router.put(`/admin`, this.SettingsController.updateSiteSettings);

    /* ========================================
           PUBLIC ROUTES
        ========================================= */

    this.router.get(`/`, this.SettingsController.getSiteSettings);
  }
}

export default SettingsRoute;
