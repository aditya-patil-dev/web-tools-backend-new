import { Request, Response, NextFunction } from "express";
import ToolsService from "../services/tools.services";
import HttpException from "../exceptions/HttpException";

class ToolsController {
  public ToolsService = new ToolsService();

  /**
   * GET /tools/all
   * All tools across every category + category list for filter tabs
   */
  public getAllTools = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const data = await this.ToolsService.getAllTools();

      res.status(200).json({
        success: true,
        message: "All tools fetched successfully",
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /tools?category=image-tools
   * Listing page (cards only)
   */
  public getTools = async (req, res, next) => {
    try {
      const { category } = req.query;

      if (!category || typeof category !== "string") {
        throw new HttpException(400, "Category is required");
      }

      const [tools, categoryPage] = await Promise.all([
        this.ToolsService.getToolsByCategory(category),
        this.ToolsService.getCategoryPage(category),
      ]);

      res.status(200).json({
        success: true,
        message: "Tools fetched successfully",
        data: {
          category: categoryPage,
          tools,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /tools/:category/:slug
   * Tool page (SEO + content)
   */
  public getToolPage = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const category = req.params.category as string;
      const slug = req.params.slug as string;

      if (!category || !slug) {
        throw new HttpException(400, "Category and slug are required");
      }

      const toolPage = await this.ToolsService.getToolPage(category, slug);

      if (!toolPage) {
        throw new HttpException(404, "Tool not found");
      }

      res.status(200).json({
        success: true,
        message: "Tool page fetched successfully",
        data: toolPage,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /tools/speed-test
   */
  public testWebsiteSpeed = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      let { url } = req.body;

      if (!url) {
        throw new HttpException(400, "URL is required");
      }

      if (!url.startsWith("http")) {
        url = `https://${url}`;
      }

      const data = await this.ToolsService.testWebsiteSpeed(url);

      res.status(200).json({
        success: true,
        message: "Speed test completed",
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  public checkOpenGraph = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      let { url } = req.body;

      if (!url) throw new HttpException(400, "URL is required");
      if (!url.startsWith("http")) url = `https://${url}`;

      const data = await this.ToolsService.checkOpenGraph(url);

      res.status(200).json({
        success: true,
        message: "OG tags fetched successfully",
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  public protectPdf = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const file = (req as any).file as Express.Multer.File | undefined;
      const { password, ownerPassword, allowPrint, allowCopy, allowModify } =
        req.body;

      if (!file) throw new HttpException(400, "PDF file is required");
      if (!password) throw new HttpException(400, "Password is required");
      if (password.length < 6)
        throw new HttpException(400, "Password must be at least 6 characters");

      const { buffer, fileName } = await this.ToolsService.protectPdf({
        buffer: file.buffer,
        originalName: file.originalname,
        password,
        ownerPassword: ownerPassword || password,
        allowPrint: allowPrint === "true",
        allowCopy: allowCopy === "true",
        allowModify: allowModify === "true",
      });

      res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": buffer.length.toString(),
        "X-File-Name": fileName,
      });

      res.send(buffer);
    } catch (error) {
      next(error);
    }
  };

  public unlockPdf = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const file = (req as any).file as Express.Multer.File | undefined;
      const password = req.body.password;

      if (!file) throw new HttpException(400, "PDF file is required");
      if (!password) throw new HttpException(400, "Password is required");

      const { buffer, fileName } = await this.ToolsService.unlockPdf({
        buffer: file.buffer,
        originalName: file.originalname,
        password,
      });

      res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": buffer.length.toString(),
        "X-File-Name": fileName,
      });

      res.send(buffer);
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /tools/ai-compress
   */
  public aiCompressImage = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const file = (req as any).file as Express.Multer.File | undefined;

      if (!file) {
        throw new HttpException(400, "Image file is required");
      }

      const result = await this.ToolsService.aiCompressImage({
        buffer: file.buffer,
        mimeType: file.mimetype,
        originalName: file.originalname,
        size: file.size,
      });

      res.status(200).json({
        success: true,
        message: "Image optimized successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}

export default ToolsController;
