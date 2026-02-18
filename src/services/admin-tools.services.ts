import DB, { T } from "../database/index.schema";
import HttpException from "../exceptions/HttpException";

interface ToolFilters {
  page: number;
  limit: number;
  search?: string;
  category?: string;
  status?: string;
  badge?: string;
  access_level?: string;
  is_featured?: boolean;
  sort_by: string;
  sort_order: string;
}

interface ToolData {
  category?: any;
  tool: any;
  page: any;
}

class AdminToolsService {
  // ============================================
  // TOOL CRUD OPERATIONS
  // ============================================

  /**
   * Get all tools with filtering and pagination.
   * FIX: is_featured filter bug (was always applied when falsy)
   * FIX: SQL injection protection on sort_by
   */
  public async getTools(filters: ToolFilters) {
    const {
      page,
      limit,
      search,
      category,
      status,
      badge,
      access_level,
      is_featured,
      sort_by,
      sort_order,
    } = filters;
    const offset = (page - 1) * limit;

    // FIX: Whitelist allowed sort columns to prevent SQL injection
    const allowedSortColumns = [
      "created_at",
      "updated_at",
      "title",
      "sort_order",
    ];
    const safeSortBy = allowedSortColumns.includes(sort_by)
      ? sort_by
      : "created_at";
    const safeSortOrder = sort_order === "asc" ? "asc" : "desc";

    let baseQuery = DB(T.TOOLS);

    if (search) {
      baseQuery = baseQuery.where((builder) => {
        builder
          .where("title", "ilike", `%${search}%`)
          .orWhere("short_description", "ilike", `%${search}%`)
          .orWhereRaw("? = ANY(tags)", [search]);
      });
    }
    if (category) {
      baseQuery = baseQuery.where("category_slug", category);
    }
    if (status) {
      baseQuery = baseQuery.where("status", status);
    }
    if (badge) {
      baseQuery = baseQuery.where("badge", badge);
    }
    if (access_level) {
      baseQuery = baseQuery.where("access_level", access_level);
    }
    // FIX: Only apply filter when explicitly true or false (not undefined)
    // Original bug: `if (is_featured)` would skip filter when is_featured=false
    if (is_featured !== undefined) {
      baseQuery = baseQuery.where("is_featured", is_featured);
    }

    const [{ count }] = await baseQuery.clone().count("* as count");
    const total = parseInt(count as string);

    const tools = await baseQuery
      .clone()
      .select(
        "id",
        "title",
        "slug",
        "category_slug",
        "tool_type",
        "short_description",
        "tags",
        "badge",
        "access_level",
        "tool_url",
        "status",
        "is_featured",
        "sort_order",
        "created_at",
        "updated_at",
      )
      .orderBy(safeSortBy, safeSortOrder)
      .limit(limit)
      .offset(offset);

    return { tools, total };
  }

  /**
   * Get single tool by ID with all related data
   */
  public async getToolById(id: number) {
    const tool = await DB(T.TOOLS)
      .leftJoin("tool_pages", "tools.slug", "tool_pages.tool_slug")
      .leftJoin(
        "tools_category_pages",
        "tools.category_slug",
        "tools_category_pages.category_slug",
      )
      .select(
        // Tool
        "tools.id",
        "tools.title",
        "tools.slug",
        "tools.category_slug",
        "tools.tool_type",
        "tools.tags",
        "tools.short_description",
        "tools.badge",
        "tools.access_level",
        "tools.tool_url",
        "tools.status as tool_status",
        "tools.is_featured",
        "tools.sort_order",
        "tools.created_at",
        "tools.updated_at",

        // Tool page
        "tool_pages.id as page_id",
        "tool_pages.page_title",
        "tool_pages.page_intro",
        "tool_pages.long_content",
        "tool_pages.features",
        "tool_pages.faqs",
        "tool_pages.meta_title as page_meta_title",
        "tool_pages.meta_description as page_meta_description",
        "tool_pages.meta_keywords as page_meta_keywords",
        "tool_pages.canonical_url as page_canonical_url",
        "tool_pages.noindex as page_noindex",
        "tool_pages.schema_markup",
        "tool_pages.status as page_status",

        // Category - FIX: aliased category_slug to avoid ambiguity
        "tools_category_pages.category_slug as cat_slug",
        "tools_category_pages.page_title as category_page_title",
        "tools_category_pages.page_description as category_page_description",
        "tools_category_pages.page_intro as category_page_intro",
        "tools_category_pages.meta_title as category_meta_title",
        "tools_category_pages.meta_description as category_meta_description",
        "tools_category_pages.meta_keywords as category_meta_keywords",
        "tools_category_pages.canonical_url as category_canonical_url",
        "tools_category_pages.noindex as category_noindex",
        "tools_category_pages.status as category_status",
      )
      .where("tools.id", id)
      .first();

    if (!tool) return null;

    return {
      category: {
        category_slug: tool.cat_slug,
        page_title: tool.category_page_title,
        page_description: tool.category_page_description,
        page_intro: tool.category_page_intro,
        meta_title: tool.category_meta_title,
        meta_description: tool.category_meta_description,
        meta_keywords: tool.category_meta_keywords,
        canonical_url: tool.category_canonical_url,
        noindex: tool.category_noindex,
        status: tool.category_status,
      },
      tool: {
        id: tool.id,
        title: tool.title,
        slug: tool.slug,
        category_slug: tool.category_slug,
        tool_type: tool.tool_type,
        tags: tool.tags,
        short_description: tool.short_description,
        badge: tool.badge,
        access_level: tool.access_level,
        tool_url: tool.tool_url,
        status: tool.tool_status,
        is_featured: tool.is_featured,
        sort_order: tool.sort_order,
        created_at: tool.created_at,
        updated_at: tool.updated_at,
      },
      page: {
        tool_slug: tool.slug,
        page_title: tool.page_title,
        page_intro: tool.page_intro,
        long_content: tool.long_content,
        features: tool.features,
        faqs: tool.faqs,
        meta_title: tool.page_meta_title,
        meta_description: tool.page_meta_description,
        meta_keywords: tool.page_meta_keywords,
        canonical_url: tool.page_canonical_url,
        noindex: tool.page_noindex,
        schema_markup: tool.schema_markup,
        status: tool.page_status,
      },
    };
  }

  /**
   * Create new tool with tool_page and optionally category.
   * FIX: meta_keywords handled as string (not array)
   * FIX: schema_markup stringify guard
   */
  public async createTool(data: ToolData) {
    const trx = await DB.transaction();

    try {
      const { category, tool, page } = data;

      if (category) {
        await this.upsertCategoryTransaction(category, trx);
      }

      const [createdTool] = await trx(T.TOOLS)
        .insert({
          title: tool.title,
          slug: tool.slug,
          category_slug: tool.category_slug,
          tool_type: tool.tool_type,
          tags: tool.tags || [],
          short_description: tool.short_description,
          badge: tool.badge || null,
          access_level: tool.access_level || "free",
          tool_url: tool.tool_url,
          status: tool.status || "draft",
          is_featured: tool.is_featured || false,
          sort_order: tool.sort_order || 0,
        })
        .returning("*");

      await trx("tool_pages").insert({
        tool_slug: page.tool_slug || tool.slug,
        page_title: page.page_title,
        page_intro: page.page_intro || null,
        long_content: page.long_content || null,
        // FIX: stringify arrays before inserting into jsonb
        features: page.features ? JSON.stringify(page.features) : null,
        faqs: page.faqs ? JSON.stringify(page.faqs) : null,
        meta_title: page.meta_title || null,
        meta_description: page.meta_description || null,
        // FIX: meta_keywords is text column - insert as string, not array
        meta_keywords: page.meta_keywords || null,
        canonical_url: page.canonical_url || null,
        noindex: page.noindex || false,
        // FIX: schema_markup is jsonb - only stringify if it's an object
        schema_markup: page.schema_markup
          ? typeof page.schema_markup === "string"
            ? page.schema_markup
            : JSON.stringify(page.schema_markup)
          : null,
        status: page.status || "draft",
      });

      await trx.commit();
      return createdTool;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  /**
   * Update existing tool
   */
  public async updateTool(id: number, data: ToolData) {
    const trx = await DB.transaction();

    try {
      const { category, tool, page } = data;

      if (category) {
        await this.upsertCategoryTransaction(category, trx);
      }

      if (tool) {
        const updateData: any = {};

        if (tool.title !== undefined) updateData.title = tool.title;
        if (tool.slug !== undefined) updateData.slug = tool.slug;
        if (tool.category_slug !== undefined)
          updateData.category_slug = tool.category_slug;
        if (tool.tool_type !== undefined) updateData.tool_type = tool.tool_type;
        if (tool.tags !== undefined) updateData.tags = tool.tags;
        if (tool.short_description !== undefined)
          updateData.short_description = tool.short_description;
        if (tool.badge !== undefined) updateData.badge = tool.badge;
        if (tool.access_level !== undefined)
          updateData.access_level = tool.access_level;
        if (tool.tool_url !== undefined) updateData.tool_url = tool.tool_url;
        if (tool.status !== undefined) updateData.status = tool.status;
        if (tool.is_featured !== undefined)
          updateData.is_featured = tool.is_featured;
        if (tool.sort_order !== undefined)
          updateData.sort_order = tool.sort_order;

        await trx(T.TOOLS).where("id", id).update(updateData);
      }

      if (page) {
        // FIX: use explicit column alias to avoid ambiguity with category_slug
        const currentTool = await trx(T.TOOLS)
          .select("slug as tool_slug")
          .where("id", id)
          .first();

        if (!currentTool) {
          throw new HttpException(404, "Tool not found during page update");
        }

        const pageUpdateData: any = {};

        if (page.page_title !== undefined)
          pageUpdateData.page_title = page.page_title;
        if (page.page_intro !== undefined)
          pageUpdateData.page_intro = page.page_intro;
        if (page.long_content !== undefined)
          pageUpdateData.long_content = page.long_content;
        if (page.features !== undefined)
          pageUpdateData.features = page.features
            ? JSON.stringify(page.features)
            : null;
        if (page.faqs !== undefined)
          pageUpdateData.faqs = page.faqs ? JSON.stringify(page.faqs) : null;
        if (page.meta_title !== undefined)
          pageUpdateData.meta_title = page.meta_title;
        if (page.meta_description !== undefined)
          pageUpdateData.meta_description = page.meta_description;
        // FIX: meta_keywords is text, not array
        if (page.meta_keywords !== undefined)
          pageUpdateData.meta_keywords = page.meta_keywords;
        if (page.canonical_url !== undefined)
          pageUpdateData.canonical_url = page.canonical_url;
        if (page.noindex !== undefined) pageUpdateData.noindex = page.noindex;
        if (page.schema_markup !== undefined) {
          pageUpdateData.schema_markup = page.schema_markup
            ? typeof page.schema_markup === "string"
              ? page.schema_markup
              : JSON.stringify(page.schema_markup)
            : null;
        }
        if (page.status !== undefined) pageUpdateData.status = page.status;

        // If slug changed, update FK in tool_pages
        if (tool?.slug && tool.slug !== currentTool.tool_slug) {
          pageUpdateData.tool_slug = tool.slug;
        }

        await trx("tool_pages")
          .where("tool_slug", currentTool.tool_slug)
          .update(pageUpdateData);
      }

      await trx.commit();
      return await this.getToolById(id);
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  /**
   * Soft delete tool by setting status='archived'.
   * Also archives the linked tool_page.
   */
  public async softDeleteTool(id: number) {
    const trx = await DB.transaction();

    try {
      const tool = await trx(T.TOOLS).select("slug").where("id", id).first();

      if (!tool) {
        throw new HttpException(404, "Tool not found");
      }

      // Soft delete using status='archived'
      await trx(T.TOOLS).where("id", id).update({
        status: "archived",
        updated_at: DB.fn.now(),
      });

      // Also archive the linked page
      await trx("tool_pages").where("tool_slug", tool.slug).update({
        status: "archived",
      });

      await trx.commit();
      return true;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  /**
   * Hard delete tool (permanently remove)
   */
  public async hardDeleteTool(id: number) {
    const trx = await DB.transaction();

    try {
      const tool = await trx(T.TOOLS).select("slug").where("id", id).first();

      if (!tool) {
        throw new HttpException(404, "Tool not found");
      }

      await trx("tool_pages").where("tool_slug", tool.slug).delete();
      await trx(T.TOOLS).where("id", id).delete();

      await trx.commit();
      return true;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  // ============================================
  // BULK OPERATIONS
  // ============================================

  /**
   * Bulk update tools
   */
  public async bulkUpdate(ids: number[], updates: any) {
    const updateData: any = { ...updates, updated_at: DB.fn.now() };

    const updated = await DB(T.TOOLS).whereIn("id", ids).update(updateData);

    return updated;
  }

  /**
   * Bulk delete tools.
   * Soft delete uses status='archived', hard delete removes records.
   */
  public async bulkDelete(ids: number[], permanent: boolean = false) {
    if (permanent) {
      const trx = await DB.transaction();

      try {
        const tools = await trx(T.TOOLS).select("slug").whereIn("id", ids);
        const slugs = tools.map((t) => t.slug);

        await trx("tool_pages").whereIn("tool_slug", slugs).delete();
        const deleted = await trx(T.TOOLS).whereIn("id", ids).delete();

        await trx.commit();
        return deleted;
      } catch (error) {
        await trx.rollback();
        throw error;
      }
    } else {
      // Soft delete using status='archived'
      const trx = await DB.transaction();

      try {
        const tools = await trx(T.TOOLS).select("slug").whereIn("id", ids);
        const slugs = tools.map((t) => t.slug);

        await trx("tool_pages").whereIn("tool_slug", slugs).update({
          status: "archived",
        });

        const updated = await trx(T.TOOLS).whereIn("id", ids).update({
          status: "archived",
          updated_at: DB.fn.now(),
        });

        await trx.commit();
        return updated;
      } catch (error) {
        await trx.rollback();
        throw error;
      }
    }
  }

  // ============================================
  // CATEGORY OPERATIONS
  // ============================================

  /**
   * Get all categories with tool counts
   */
  public async getCategories() {
    return DB("tools_category_pages")
      .leftJoin(
        "tools",
        "tools_category_pages.category_slug",
        "tools.category_slug",
      )
      .select(
        "tools_category_pages.category_slug",
        "tools_category_pages.page_title",
        "tools_category_pages.page_description",
        "tools_category_pages.status",
        "tools_category_pages.created_at",
        "tools_category_pages.updated_at",
      )
      .count("tools.id as tool_count")
      .groupBy(
        "tools_category_pages.category_slug",
        "tools_category_pages.page_title",
        "tools_category_pages.page_description",
        "tools_category_pages.status",
        "tools_category_pages.created_at",
        "tools_category_pages.updated_at",
      )
      .orderBy("tools_category_pages.page_title", "asc");
  }

  /**
   * Get single category by slug
   */
  public async getCategoryBySlug(slug: string) {
    return DB("tools_category_pages")
      .select("*")
      .where("category_slug", slug)
      .first();
  }

  /**
   * Create or update category
   */
  public async upsertCategory(categoryData: any) {
    const existing = await DB("tools_category_pages")
      .where("category_slug", categoryData.category_slug)
      .first();

    if (existing) {
      await DB("tools_category_pages")
        .where("category_slug", categoryData.category_slug)
        .update({
          page_title: categoryData.page_title,
          page_description: categoryData.page_description,
          page_intro: categoryData.page_intro || null,
          meta_title: categoryData.meta_title || null,
          meta_description: categoryData.meta_description || null,
          meta_keywords: categoryData.meta_keywords || null,
          canonical_url: categoryData.canonical_url || null,
          noindex: categoryData.noindex || false,
          status: categoryData.status || "draft",
          updated_at: DB.fn.now(),
        });

      return {
        created: false,
        category: await this.getCategoryBySlug(categoryData.category_slug),
      };
    } else {
      await DB("tools_category_pages").insert({
        category_slug: categoryData.category_slug,
        page_title: categoryData.page_title,
        page_description: categoryData.page_description,
        page_intro: categoryData.page_intro || null,
        meta_title: categoryData.meta_title || null,
        meta_description: categoryData.meta_description || null,
        meta_keywords: categoryData.meta_keywords || null,
        canonical_url: categoryData.canonical_url || null,
        noindex: categoryData.noindex || false,
        status: categoryData.status || "draft",
      });

      return {
        created: true,
        category: await this.getCategoryBySlug(categoryData.category_slug),
      };
    }
  }

  /**
   * Upsert category within a transaction
   */
  private async upsertCategoryTransaction(categoryData: any, trx: any) {
    const existing = await trx("tools_category_pages")
      .where("category_slug", categoryData.category_slug)
      .first();

    if (existing) {
      await trx("tools_category_pages")
        .where("category_slug", categoryData.category_slug)
        .update({
          page_title: categoryData.page_title,
          page_description: categoryData.page_description,
          page_intro: categoryData.page_intro || null,
          meta_title: categoryData.meta_title || null,
          meta_description: categoryData.meta_description || null,
          meta_keywords: categoryData.meta_keywords || null,
          canonical_url: categoryData.canonical_url || null,
          noindex: categoryData.noindex || false,
          status: categoryData.status || "draft",
          updated_at: DB.fn.now(),
        });
    } else {
      await trx("tools_category_pages").insert({
        category_slug: categoryData.category_slug,
        page_title: categoryData.page_title,
        page_description: categoryData.page_description,
        page_intro: categoryData.page_intro || null,
        meta_title: categoryData.meta_title || null,
        meta_description: categoryData.meta_description || null,
        meta_keywords: categoryData.meta_keywords || null,
        canonical_url: categoryData.canonical_url || null,
        noindex: categoryData.noindex || false,
        status: categoryData.status || "draft",
      });
    }
  }

  /**
   * Delete category (soft delete using status='archived')
   */
  public async deleteCategory(slug: string) {
    const updated = await DB("tools_category_pages")
      .where("category_slug", slug)
      .update({
        status: "archived",
        updated_at: DB.fn.now(),
      });

    if (updated === 0) {
      throw new HttpException(404, "Category not found");
    }

    return true;
  }

  /**
   * Get category tool count
   */
  public async getCategoryToolCount(slug: string) {
    const [{ count }] = await DB(T.TOOLS)
      .where("category_slug", slug)
      .count("* as count");

    return parseInt(count as string);
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  /**
   * Check if slug exists
   */
  public async checkSlugExists(slug: string): Promise<boolean> {
    const tool = await DB(T.TOOLS).select("slug").where("slug", slug).first();
    return !!tool;
  }

  /**
   * Get tool analytics (placeholder)
   */
  public async getToolAnalytics(id: number) {
    const tool = await DB(T.TOOLS)
      .select("id", "title", "slug", "category_slug", "created_at")
      .where("id", id)
      .first();

    if (!tool) return null;

    return {
      ...tool,
      analytics: {
        total_views: 0,
        unique_users: 0,
        avg_session_duration: 0,
      },
    };
  }

  /**
   * Duplicate tool
   */
  public async duplicateTool(id: number, newSlug: string, newTitle?: string) {
    const trx = await DB.transaction();

    try {
      const originalTool = await trx(T.TOOLS).where("id", id).first();

      if (!originalTool) {
        throw new HttpException(404, "Tool not found");
      }

      const originalPage = await trx("tool_pages")
        .where("tool_slug", originalTool.slug)
        .first();

      const [duplicatedTool] = await trx(T.TOOLS)
        .insert({
          title: newTitle || `${originalTool.title} (Copy)`,
          slug: newSlug,
          category_slug: originalTool.category_slug,
          tool_type: originalTool.tool_type,
          tags: originalTool.tags,
          short_description: originalTool.short_description,
          badge: originalTool.badge,
          access_level: originalTool.access_level,
          tool_url: originalTool.tool_url,
          status: "draft",
          is_featured: false,
          sort_order: originalTool.sort_order,
        })
        .returning("*");

      if (originalPage) {
        await trx("tool_pages").insert({
          tool_slug: newSlug,
          page_title: originalPage.page_title,
          page_intro: originalPage.page_intro,
          long_content: originalPage.long_content,
          features: originalPage.features,
          faqs: originalPage.faqs,
          meta_title: originalPage.meta_title,
          meta_description: originalPage.meta_description,
          meta_keywords: originalPage.meta_keywords,
          canonical_url: null,
          noindex: true,
          schema_markup: originalPage.schema_markup,
          status: "draft",
        });
      }

      await trx.commit();
      return duplicatedTool;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  /**
   * Restore soft-deleted tool (change status from 'archived' to 'draft').
   * Also restores the linked tool_page.
   */
  public async restoreTool(id: number) {
    const trx = await DB.transaction();

    try {
      const tool = await trx(T.TOOLS)
        .select("slug")
        .where("id", id)
        .where("status", "archived")
        .first();

      if (!tool) {
        throw new HttpException(
          404,
          "Tool not found or is not in archived state",
        );
      }

      await trx(T.TOOLS).where("id", id).update({
        status: "draft",
        updated_at: DB.fn.now(),
      });

      // Also restore the linked page
      await trx("tool_pages")
        .where("tool_slug", tool.slug)
        .where("status", "archived")
        .update({
          status: "draft",
        });

      await trx.commit();
      return true;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }
}

export default AdminToolsService;