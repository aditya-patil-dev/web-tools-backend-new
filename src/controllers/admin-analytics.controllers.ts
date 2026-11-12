import { Request, Response, NextFunction } from "express";
import AdminAnalyticsService from "../services/admin-analytics.services";

class AdminAnalyticsController {
  private analyticsService = new AdminAnalyticsService();

  /**
   * GET /admin/analytics/overview
   */
  public getOverview = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { range, start_date, end_date, category } = req.query;

      const data = await this.analyticsService.getOverviewAnalytics({
        range: range as any,
        start_date: start_date as string,
        end_date: end_date as string,
        category: category as string,
      });

      res.status(200).json({
        success: true,
        message: "Analytics overview fetched successfully",
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /admin/analytics/tools
   */
  public getToolsAnalytics = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const {
        page,
        limit,
        search,
        category,
        health_tier,
        sort_by,
        sort_order,
        range,
        start_date,
        end_date,
      } = req.query;

      const data = await this.analyticsService.getToolsAnalytics({
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        search: search as string,
        category: category as string,
        health_tier: health_tier as any,
        sort_by: sort_by as string,
        sort_order: sort_order as any,
        range: range as string,
        start_date: start_date as string,
        end_date: end_date as string,
      });

      res.status(200).json({
        success: true,
        message: "Tool performance analytics fetched successfully",
        data: data.tools,
        meta: data.meta,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /admin/analytics/events
   */
  public getEventsTelemetry = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const {
        page,
        limit,
        event_type,
        tool_id,
        session_id,
        start_date,
        end_date,
      } = req.query;

      const data = await this.analyticsService.getEventsTelemetry({
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        event_type: event_type as string,
        tool_id: tool_id ? Number(tool_id) : undefined,
        session_id: session_id as string,
        start_date: start_date as string,
        end_date: end_date as string,
      });

      res.status(200).json({
        success: true,
        message: "Events telemetry fetched successfully",
        data: data.events,
        meta: data.meta,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /tools/events/track (Public Tracking Endpoint)
   */
  public trackEvent = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const {
        tool_slug,
        tool_id,
        event_type,
        session_id,
        ref_tool_slug,
        ref_tool_id,
        meta,
      } = req.body;

      if (!event_type || !session_id) {
        res.status(400).json({
          success: false,
          message: "event_type and session_id are required",
        });
        return;
      }

      const event = await this.analyticsService.trackEvent({
        tool_slug,
        tool_id,
        event_type,
        session_id,
        ref_tool_slug,
        ref_tool_id,
        meta,
      });

      res.status(201).json({
        success: true,
        message: "Event tracked successfully",
        data: event,
      });
    } catch (error) {
      next(error);
    }
  };
}

export default AdminAnalyticsController;

