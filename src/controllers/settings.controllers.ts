import { Request, Response, NextFunction } from "express";
import SettingsService from "../services/settings.service";
import HttpException from "../exceptions/HttpException";

class SettingsController {
  public SettingsService = new SettingsService();

  /* ============================================
       PUBLIC
    ============================================ */

  /**
   * GET /settings
   */
  public getSiteSettings = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const settings = await this.SettingsService.getSiteSettings();

      res.status(200).json({
        success: true,
        message: "Site settings fetched successfully",
        data: settings,
      });
    } catch (error) {
      next(error);
    }
  };

  /* ============================================
       ADMIN
    ============================================ */

  /**
   * GET /settings/admin
   */
  public getSiteSettingsAdmin = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const settings = await this.SettingsService.getSiteSettingsAdmin();

      res.status(200).json({
        success: true,
        message: "Site settings fetched successfully",
        data: settings,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /settings/admin
   */
  public updateSiteSettings = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const updated = await this.SettingsService.updateSiteSettings(req.body);

      res.status(200).json({
        success: true,
        message: "Site settings updated successfully",
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  };
}

export default SettingsController;
