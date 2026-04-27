import { Request, Response, NextFunction } from "express";
import AdminToolsService from "../services/admin-tools.services";
import HttpException from "../exceptions/HttpException";
import { UpdateToolDto } from "../dtos/tools.dto";

class AdminToolsController {
  public service = new AdminToolsService();

  // ============================================
  // TOOL CRUD OPERATIONS
  // ============================================

  /**
   * GET /admin/tools
   * Get all tools with filtering, pagination, and search
   * Query params:
   *  - page: number (default: 1)
   *  - limit: number (default: 20)
   *  - search: string
   *  - category: string
   *  - status: active|draft|archived
   *  - badge: new|popular|pro
   *  - access_level: free|premium|pro
   *  - is_featured: boolean
   *  - sort_by: created_at|updated_at|title|sort_order (default: created_at)
   *  - sort_order: asc|desc (default: desc)
   */
  public getTools = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const filters = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
        search: req.query.search as string,
        category: req.query.category as string,
        status: req.query.status as string,
        badge: req.query.badge as string,
        access_level: req.query.access_level as string,
        is_featured: req.query.is_featured === "true",
        sort_by: (req.query.sort_by as string) || "created_at",
        sort_order: (req.query.sort_order as string) || "desc",
      };

      const result = await this.service.getTools(filters);

      res.status(200).json({
        success: true,
        message: "Tools fetched successfully",
        data: result.tools,
        meta: {
          total: result.total,
          page: filters.page,
          limit: filters.limit,
          total_pages: Math.ceil(result.total / filters.limit),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /admin/tools/:id
   * Get single tool by ID with all related data
   */
  public getToolById = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const id = req.params.id as string;

      const tool = await this.service.getToolById(parseInt(id));

      if (!tool) {
        throw new HttpException(404, "Tool not found");
      }

      res.status(200).json({
        success: true,
        message: "Tool fetched successfully",
        data: tool,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /admin/tools
   * Create new tool with tool_page and optionally category
   * Body: {
   *   category: { category_slug, page_title, ... },
   *   tool: { title, slug, ... },
   *   page: { tool_slug, page_title, ... }
   * }
   */
  public createTool = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { category, tool, page } = req.body;

      // Validate required fields
      if (!tool || !page) {
        throw new HttpException(400, "Tool and page data are required");
      }

      // Check if slug already exists
      const slugExists = await this.service.checkSlugExists(tool.slug);
      if (slugExists) {
        throw new HttpException(409, `Tool slug '${tool.slug}' already exists`);
      }

      const result = await this.service.createTool({
        category,
        tool,
        page,
      });

      res.status(201).json({
        success: true,
        message: "Tool created successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /admin/tools/:id
   * Update existing tool
   * Body: Same as create
   */
  public updateTool = async (
    req: Request<{ id: string }, {}, UpdateToolDto>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const { category, tool, page } = req.body;

      // Check if tool exists
      const existingTool = await this.service.getToolById(parseInt(id));
      if (!existingTool) {
        throw new HttpException(404, "Tool not found");
      }

      // If slug changed, check if new slug exists
      // FIX: getToolById returns nested structure {category, tool, page}
      // so we need existingTool.tool.slug, not existingTool.slug
      if (tool?.slug && tool.slug !== existingTool.tool.slug) {
        const slugExists = await this.service.checkSlugExists(tool.slug);
        if (slugExists) {
          throw new HttpException(
            409,
            `Tool slug '${tool.slug}' already exists`,
          );
        }
      }

      const result = await this.service.updateTool(parseInt(id), {
        category,
        tool,
        page,
      });

      res.status(200).json({
        success: true,
        message: "Tool updated successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /admin/tools/:id
   * Soft delete tool (sets status to 'archived')
   */
  public deleteTool = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const id = req.params.id as string;

      await this.service.softDeleteTool(parseInt(id));

      res.status(200).json({
        success: true,
        message: "Tool deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /admin/tools/:id/permanent
   * Hard delete tool (permanently removes from database)
   */
  public hardDeleteTool = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const id = req.params.id as string;

      await this.service.hardDeleteTool(parseInt(id));

      res.status(200).json({
        success: true,
        message: "Tool permanently deleted",
      });
    } catch (error) {
      next(error);
    }
  };

  // ============================================
  // BULK OPERATIONS
  // ============================================

  /**
   * PATCH /admin/tools/bulk/update
   * Bulk update tools
   * Body: {
   *   ids: number[],
   *   updates: { status?, category_slug?, badge?, ... }
   * }
   */
  public bulkUpdate = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { ids, updates } = req.body;

      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        throw new HttpException(400, "Tool IDs are required");
      }

      if (!updates || Object.keys(updates).length === 0) {
        throw new HttpException(400, "Updates are required");
      }

      const result = await this.service.bulkUpdate(ids, updates);

      res.status(200).json({
        success: true,
        message: `${result} tools updated successfully`,
        data: { updated_count: result },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /admin/tools/bulk/delete
   * Bulk delete tools
   * Body: {
   *   ids: number[],
   *   permanent?: boolean
   * }
   */
  public bulkDelete = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { ids, permanent = false } = req.body;

      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        throw new HttpException(400, "Tool IDs are required");
      }

      const result = await this.service.bulkDelete(ids, permanent);

      res.status(200).json({
        success: true,
        message: `${result} tools ${permanent ? "permanently deleted" : "deleted"}`,
        data: { deleted_count: result },
      });
    } catch (error) {
      next(error);
    }
  };

  // ============================================
  // CATEGORY OPERATIONS
  // ============================================

  /**
   * GET /admin/tools/categories/list
   * Get all categories with tool counts
   */
  public getCategories = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const categories = await this.service.getCategories();

      res.status(200).json({
        success: true,
        message: "Categories fetched successfully",
        data: categories,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /admin/tools/categories/:slug
   * Get single category by slug
   */
  public getCategoryBySlug = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const slug = req.params.slug as string;

      const category = await this.service.getCategoryBySlug(slug);

      if (!category) {
        throw new HttpException(404, "Category not found");
      }

      res.status(200).json({
        success: true,
        message: "Category fetched successfully",
        data: category,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /admin/tools/categories
   * Create or update category
   * Body: {
   *   category_slug, page_title, page_description, ...
   * }
   */
  public upsertCategory = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const categoryData = req.body;

      if (!categoryData.category_slug) {
        throw new HttpException(400, "Category slug is required");
      }

      const result = await this.service.upsertCategory(categoryData);

      res.status(result.created ? 201 : 200).json({
        success: true,
        message: `Category ${result.created ? "created" : "updated"} successfully`,
        data: result.category,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /admin/tools/categories/:slug
   * Delete category
   */
  public deleteCategory = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const slug = req.params.slug as string;

      // Check if category has tools
      const toolCount = await this.service.getCategoryToolCount(slug);
      if (toolCount > 0) {
        throw new HttpException(
          409,
          `Cannot delete category. ${toolCount} tools are using this category`,
        );
      }

      await this.service.deleteCategory(slug);

      res.status(200).json({
        success: true,
        message: "Category deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  // ============================================
  // UTILITY ENDPOINTS
  // ============================================

  /**
   * GET /admin/tools/check/slug/:slug
   * Check if slug is available
   */
  public checkSlugAvailability = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const slug = req.params.slug as string;

      const exists = await this.service.checkSlugExists(slug);

      res.status(200).json({
        success: true,
        data: {
          slug,
          available: !exists,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /admin/tools/:id/analytics
   * Get tool analytics/stats
   */
  public getToolAnalytics = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const id = req.params.id as string;

      const analytics = await this.service.getToolAnalytics(parseInt(id));

      if (!analytics) {
        throw new HttpException(404, "Tool not found");
      }

      res.status(200).json({
        success: true,
        message: "Tool analytics fetched successfully",
        data: analytics,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /admin/tools/:id/duplicate
   * Duplicate tool with new slug
   * Body: {
   *   new_slug: string,
   *   new_title?: string
   * }
   */
  public duplicateTool = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const id = req.params.id as string;
      const { new_slug, new_title } = req.body;

      if (!new_slug) {
        throw new HttpException(400, "New slug is required");
      }

      // Check if new slug exists
      const slugExists = await this.service.checkSlugExists(new_slug);
      if (slugExists) {
        throw new HttpException(409, `Slug '${new_slug}' already exists`);
      }

      const duplicatedTool = await this.service.duplicateTool(
        parseInt(id),
        new_slug,
        new_title,
      );

      res.status(201).json({
        success: true,
        message: "Tool duplicated successfully",
        data: duplicatedTool,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /admin/tools/:id/restore
   * Restore soft-deleted tool
   */
  public restoreTool = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const id = req.params.id as string;

      await this.service.restoreTool(parseInt(id));

      res.status(200).json({
        success: true,
        message: "Tool restored successfully",
      });
    } catch (error) {
      next(error);
    }
  };
}

export default AdminToolsController;