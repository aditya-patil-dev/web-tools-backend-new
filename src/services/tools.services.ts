import DB, { T } from "../database/index.schema";

class ToolsService {
    /**
     * Tools listing (cards)
     * Reads ONLY `tools`
     */
    public async getToolsByCategory(categorySlug: string): Promise<any[]> {
        return DB(T.TOOLS)
            .select(
                "id",
                "title",
                "slug",
                "short_description",
                "category_slug",
                "tool_type",
                "tags",
                "badge",
                "rating",
                "views",
                "users_count",
                "tool_url",
            )
            .where({
                category_slug: categorySlug,
                status: "active",
            })
            .orderBy([
                { column: "is_featured", order: "desc" },
                { column: "sort_order", order: "asc" },
                { column: "created_at", order: "desc" },
            ]);
    }

    /**
     * Tool detail page
     * JOIN tools + tool_pages
     */
    public async getToolPage(
        categorySlug: string,
        toolSlug: string,
    ): Promise<any | null> {
        const tool = await DB(T.TOOLS)
            .leftJoin("tool_pages", "tools.slug", "tool_pages.tool_slug")
            .select(
                // tools (listing + runtime)
                "tools.id",
                "tools.title",
                "tools.slug",
                "tools.category_slug",
                "tools.tool_type",
                "tools.access_level",
                "tools.daily_limit",
                "tools.monthly_limit",
                "tools.views",
                "tools.users_count",

                // tool_pages (SEO + content)
                "tool_pages.page_title",
                "tool_pages.page_intro",
                "tool_pages.long_content",
                "tool_pages.features",
                "tool_pages.faqs",
                "tool_pages.meta_title",
                "tool_pages.meta_description",
                "tool_pages.meta_keywords",
                "tool_pages.canonical_url",
                "tool_pages.schema_markup",
                "tool_pages.noindex",
            )
            .where({
                "tools.slug": toolSlug,
                "tools.category_slug": categorySlug,
                "tools.status": "active",
                "tool_pages.status": "active",
            })
            .first();

        return tool || null;
    }

    public async getCategoryPage(categorySlug: string) {
        const categoryPage = await DB("tools_category_pages")
            .select(
                "page_title",
                "page_description",
                "page_intro",
                "meta_title",
                "meta_description",
                "meta_keywords",
                "canonical_url",
                "noindex",
            )
            .where({
                category_slug: categorySlug,
                status: "active",
            })
            .first();

        return categoryPage || null;
    }
}

export default ToolsService;