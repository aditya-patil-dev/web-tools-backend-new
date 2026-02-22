import DB, { T } from "../database/index.schema";
import HttpException from "../exceptions/HttpException";

interface ToolPageFilters {
    page: number;
    limit: number;
    search?: string;
    status?: string;
    tool_slug?: string;
    sort_by: string;
    sort_order: string;
}

class AdminToolPagesService {
    /**
     * Get all tool pages with filtering and pagination
     */
    public async getToolPages(filters: ToolPageFilters) {
        const { page, limit, search, status, tool_slug, sort_by, sort_order } =
            filters;
        const offset = (page - 1) * limit;

        // SQL injection protection
        const allowedSortColumns = ["created_at", "updated_at", "page_title"];
        const safeSortBy = allowedSortColumns.includes(sort_by)
            ? sort_by
            : "created_at";
        const safeSortOrder = sort_order === "asc" ? "asc" : "desc";

        // Create a separate query just for counting (no joins needed for count)
        let countQuery = DB("tool_pages");

        if (search) {
            countQuery = countQuery.where((builder) => {
                builder
                    .where("page_title", "ilike", `%${search}%`)
                    .orWhere("page_intro", "ilike", `%${search}%`)
                    .orWhere("tool_slug", "ilike", `%${search}%`);
            });
        }

        if (status) {
            countQuery = countQuery.where("status", status);
        }

        if (tool_slug) {
            countQuery = countQuery.where("tool_slug", tool_slug);
        }

        const [{ count }] = await countQuery.count("* as count");
        const total = parseInt(count as string);

        // Main query with joins for data
        let baseQuery = DB("tool_pages")
            .leftJoin("tools", "tool_pages.tool_slug", "tools.slug")
            .select(
                "tool_pages.id",
                "tool_pages.tool_slug",
                "tool_pages.page_title",
                "tool_pages.page_intro",
                "tool_pages.long_content",
                "tool_pages.features",
                "tool_pages.faqs",
                "tool_pages.meta_title",
                "tool_pages.meta_description",
                "tool_pages.meta_keywords",
                "tool_pages.canonical_url",
                "tool_pages.noindex",
                "tool_pages.schema_markup",
                "tool_pages.status",
                "tool_pages.created_at",
                "tool_pages.updated_at",
                // Include tool info
                "tools.id as tool_id",
                "tools.title as tool_title",
                "tools.category_slug as tool_category_slug",
            );

        if (search) {
            baseQuery = baseQuery.where((builder) => {
                builder
                    .where("tool_pages.page_title", "ilike", `%${search}%`)
                    .orWhere("tool_pages.page_intro", "ilike", `%${search}%`)
                    .orWhere("tool_pages.tool_slug", "ilike", `%${search}%`);
            });
        }

        if (status) {
            baseQuery = baseQuery.where("tool_pages.status", status);
        }

        if (tool_slug) {
            baseQuery = baseQuery.where("tool_pages.tool_slug", tool_slug);
        }

        const toolPages = await baseQuery
            .clone()
            .orderBy(`tool_pages.${safeSortBy}`, safeSortOrder)
            .limit(limit)
            .offset(offset);

        // Format response to include tool info
        const formattedPages = toolPages.map((page) => ({
            id: page.id,
            tool_slug: page.tool_slug,
            page_title: page.page_title,
            page_intro: page.page_intro,
            long_content: page.long_content,
            features: page.features,
            faqs: page.faqs,
            meta_title: page.meta_title,
            meta_description: page.meta_description,
            meta_keywords: page.meta_keywords,
            canonical_url: page.canonical_url,
            noindex: page.noindex,
            schema_markup: page.schema_markup,
            status: page.status,
            created_at: page.created_at,
            updated_at: page.updated_at,
            tool: page.tool_id
                ? {
                    id: page.tool_id,
                    title: page.tool_title,
                    slug: page.tool_slug,
                    category_slug: page.tool_category_slug,
                }
                : null,
        }));

        return { toolPages: formattedPages, total };
    }

    /**
     * Get single tool page by tool slug
     */
    public async getToolPageBySlug(slug: string) {
        const page = await DB("tool_pages")
            .leftJoin("tools", "tool_pages.tool_slug", "tools.slug")
            .select(
                "tool_pages.id",
                "tool_pages.tool_slug",
                "tool_pages.page_title",
                "tool_pages.page_intro",
                "tool_pages.long_content",
                "tool_pages.features",
                "tool_pages.faqs",
                "tool_pages.meta_title",
                "tool_pages.meta_description",
                "tool_pages.meta_keywords",
                "tool_pages.canonical_url",
                "tool_pages.noindex",
                "tool_pages.schema_markup",
                "tool_pages.status",
                "tool_pages.created_at",
                "tool_pages.updated_at",
                // Include tool info
                "tools.id as tool_id",
                "tools.title as tool_title",
                "tools.category_slug as tool_category_slug",
            )
            .where("tool_pages.tool_slug", slug)
            .first();

        if (!page) return null;

        return {
            id: page.id,
            tool_slug: page.tool_slug,
            page_title: page.page_title,
            page_intro: page.page_intro,
            long_content: page.long_content,
            features: page.features,
            faqs: page.faqs,
            meta_title: page.meta_title,
            meta_description: page.meta_description,
            meta_keywords: page.meta_keywords,
            canonical_url: page.canonical_url,
            noindex: page.noindex,
            schema_markup: page.schema_markup,
            status: page.status,
            created_at: page.created_at,
            updated_at: page.updated_at,
            tool: page.tool_id
                ? {
                    id: page.tool_id,
                    title: page.tool_title,
                    slug: page.tool_slug,
                    category_slug: page.tool_category_slug,
                }
                : null,
        };
    }

    /**
     * Create new tool page
     */
    public async createToolPage(data: any) {
        const [toolPage] = await DB("tool_pages")
            .insert({
                tool_slug: data.tool_slug,
                page_title: data.page_title,
                page_intro: data.page_intro || null,
                long_content: data.long_content || null,
                features: data.features || null,
                faqs: data.faqs || null,
                meta_title: data.meta_title || null,
                meta_description: data.meta_description || null,
                meta_keywords: data.meta_keywords || null,
                canonical_url: data.canonical_url || null,
                noindex: data.noindex || false,
                schema_markup: data.schema_markup || null,
                status: data.status || "draft",
            })
            .returning("*");

        return this.getToolPageBySlug(toolPage.tool_slug);
    }

    /**
     * Update existing tool page
     */
    public async updateToolPage(slug: string, data: any) {
        const updateData: any = {};

        if (data.page_title !== undefined)
            updateData.page_title = data.page_title;
        if (data.page_intro !== undefined)
            updateData.page_intro = data.page_intro;
        if (data.long_content !== undefined)
            updateData.long_content = data.long_content;
        if (data.features !== undefined)
            updateData.features = data.features;
        if (data.faqs !== undefined)
            updateData.faqs = data.faqs;
        if (data.meta_title !== undefined)
            updateData.meta_title = data.meta_title;
        if (data.meta_description !== undefined)
            updateData.meta_description = data.meta_description;
        if (data.meta_keywords !== undefined)
            updateData.meta_keywords = data.meta_keywords;
        if (data.canonical_url !== undefined)
            updateData.canonical_url = data.canonical_url;
        if (data.noindex !== undefined)
            updateData.noindex = data.noindex;
        if (data.schema_markup !== undefined)
            updateData.schema_markup = data.schema_markup;
        if (data.status !== undefined)
            updateData.status = data.status;

        updateData.updated_at = DB.fn.now();

        await DB("tool_pages").where("tool_slug", slug).update(updateData);

        return this.getToolPageBySlug(slug);
    }

    /**
     * Delete tool page
     */
    public async deleteToolPage(slug: string) {
        const deleted = await DB("tool_pages").where("tool_slug", slug).delete();

        if (deleted === 0) {
            throw new HttpException(404, "Tool page not found");
        }

        return true;
    }

    /**
     * Check if tool exists
     */
    public async checkToolExists(slug: string): Promise<boolean> {
        const tool = await DB(T.TOOLS).select("slug").where("slug", slug).first();
        return !!tool;
    }

    /**
     * Check if tool page exists
     */
    public async checkToolPageExists(slug: string): Promise<boolean> {
        const page = await DB("tool_pages")
            .select("tool_slug")
            .where("tool_slug", slug)
            .first();
        return !!page;
    }
}

export default AdminToolPagesService;